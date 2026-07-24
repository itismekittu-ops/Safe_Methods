// Langfuse tracing client — Basic Auth REST API, non-blocking.
// OBS-ARCH-01: uses Basic Auth REST (OTLP not available in Deno Edge runtime).
// OBS-ARCH-02: all methods swallow errors and never reject — observability
// degradation is acceptable, breaking the product is not.

const LANGFUSE_HOST = Deno.env.get("LANGFUSE_HOST") ?? "";
const LANGFUSE_PUBLIC_KEY = Deno.env.get("LANGFUSE_PUBLIC_KEY") ?? "";
const LANGFUSE_SECRET_KEY = Deno.env.get("LANGFUSE_SECRET_KEY") ?? "";

const INGESTION_URL = `${LANGFUSE_HOST}/api/public/ingestion`;

export interface LangfuseSpan {
  id: string;
  traceId: string;
  parentId?: string;
  name: string;
  startTime: string;
  endTime?: string;
  input?: unknown;
  output?: unknown;
  metadata?: Record<string, unknown>;
  level?: "DEBUG" | "DEFAULT" | "WARNING" | "ERROR";
  statusMessage?: string;
}

export interface LangfuseGeneration {
  id: string;
  traceId: string;
  parentId?: string;
  name: string;
  startTime: string;
  endTime?: string;
  model: string;
  modelParameters?: Record<string, unknown>;
  input?: unknown;
  output?: unknown;
  metadata?: Record<string, unknown>;
  level?: "DEBUG" | "DEFAULT" | "WARNING" | "ERROR";
  statusMessage?: string;
}

export interface LangfuseTrace {
  id: string;
  name: string;
  userId?: string;
  sessionId?: string;
  metadata?: Record<string, unknown>;
  tags?: string[];
}

function authHeader(): string {
  return "Basic " + btoa(`${LANGFUSE_PUBLIC_KEY}:${LANGFUSE_SECRET_KEY}`);
}

function nowIso(): string {
  return new Date().toISOString();
}

function eventId(): string {
  return crypto.randomUUID();
}

function isConfigured(): boolean {
  return !!(LANGFUSE_HOST && LANGFUSE_PUBLIC_KEY && LANGFUSE_SECRET_KEY);
}

// OBS-TRACE-01: one trace per conversation turn, linked to persistent session ID.
// OBS-TRACE-02: distinct spans per stage.
// OBS-TRACE-04: model name, model version, and prompt version attached.
// OBS-TRACE-05: captured latency tracked per individual stage.
export interface TraceContext {
  traceId: string;
  sessionId: string;
  userId?: string;
  events: Array<Record<string, unknown>>;
  tags: string[];
}

export function createTraceContext(sessionId: string, userId?: string): TraceContext {
  return {
    traceId: crypto.randomUUID(),
    sessionId,
    userId,
    events: [],
    tags: [],
  };
}

export function addTrace(ctx: TraceContext, trace: LangfuseTrace): void {
  ctx.events.push({
    id: eventId(),
    type: "trace-create",
    timestamp: nowIso(),
    body: {
      id: trace.id,
      name: trace.name,
      userId: trace.userId,
      sessionId: trace.sessionId,
      metadata: trace.metadata ?? {},
      tags: trace.tags ?? [],
    },
  });
}

export function addSpan(ctx: TraceContext, span: LangfuseSpan): void {
  ctx.events.push({
    id: eventId(),
    type: "span-create",
    timestamp: span.startTime,
    body: {
      id: span.id,
      traceId: span.traceId,
      parentId: span.parentId,
      name: span.name,
      startTime: span.startTime,
      endTime: span.endTime,
      input: span.input,
      output: span.output,
      metadata: span.metadata ?? {},
      level: span.level ?? "DEFAULT",
      statusMessage: span.statusMessage,
    },
  });
}

export function addGeneration(ctx: TraceContext, gen: LangfuseGeneration): void {
  ctx.events.push({
    id: eventId(),
    type: "generation-create",
    timestamp: gen.startTime,
    body: {
      id: gen.id,
      traceId: gen.traceId,
      parentId: gen.parentId,
      name: gen.name,
      startTime: gen.startTime,
      endTime: gen.endTime,
      model: gen.model,
      modelParameters: gen.modelParameters ?? {},
      input: gen.input,
      output: gen.output,
      metadata: gen.metadata ?? {},
      level: gen.level ?? "DEFAULT",
      statusMessage: gen.statusMessage,
    },
  });
}

export function addTag(ctx: TraceContext, tag: string): void {
  if (!ctx.tags.includes(tag)) ctx.tags.push(tag);
}

// OBS-ARCH-02: never blocks the chat response. Fire-and-forget with a short timeout.
export async function flush(ctx: TraceContext): Promise<void> {
  if (!isConfigured() || ctx.events.length === 0) return;

  // Attach accumulated tags to the trace-create event if present
  if (ctx.tags.length > 0) {
    const traceEvent = ctx.events.find((e) => e.type === "trace-create");
    if (traceEvent && traceEvent.body) {
      const body = traceEvent.body as Record<string, unknown>;
      body.tags = [...(body.tags as string[] ?? []), ...ctx.tags];
    }
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    await fetch(INGESTION_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader(),
      },
      body: JSON.stringify({ batch: ctx.events }),
      signal: controller.signal,
    });
    clearTimeout(timeout);
  } catch {
    // OBS-ARCH-02: swallow — never break the chat experience
  }
}
