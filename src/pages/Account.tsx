import React, { useEffect, useState, useCallback } from "react";
import { Navigate } from "react-router-dom";
import {
  DownloadIcon,
  TrashIcon,
  ShieldIcon,
  AlertTriangleIcon,
  CheckCircleIcon,
  LoaderIcon,
  FileTextIcon,
  MailIcon,
  PhoneIcon,
  ClockIcon,
} from "lucide-react";
import { Card, CardBody, CardHeader, CardTitle } from "../components/Card";
import { Button } from "../components/Button";
import { useAuth } from "../lib/auth";
import { supabase } from "../lib/supabase";

interface QuoteRow {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  request_type: string;
  loan_amount: number | null;
  monthly_income: number | null;
  investment_amount: number | null;
  tenure: string | null;
  selected_institutions: string[];
  consent_given: boolean;
  status: string;
  created_at: string;
}

interface LeadRow {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  source: string;
  created_at: string;
}

interface ChatSessionRow {
  id: string;
  session_token: string;
  created_at: string;
}

interface DeletionRequestRow {
  id: string;
  status: string;
  requested_at: string;
  completed_at: string | null;
}

type Tab = "overview" | "quotes" | "leads" | "chat" | "deletion";

async function sha256(text: string): Promise<string> {
  const buf = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function Account() {
  const { user, loading } = useAuth();

  const [tab, setTab] = useState<Tab>("overview");
  const [quotes, setQuotes] = useState<QuoteRow[]>([]);
  const [leads, setLeads] = useState<LeadRow[]>([]);
  const [chatSessions, setChatSessions] = useState<ChatSessionRow[]>([]);
  const [deletionRequests, setDeletionRequests] = useState<DeletionRequestRow[]>([]);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Deletion state
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  const loadData = useCallback(async () => {
    if (!user) return;
    setFetching(true);
    setError(null);
    try {
      const [q, l, s, d] = await Promise.all([
        supabase
          .from("quote_requests")
          .select("id, name, email, phone, request_type, loan_amount, monthly_income, investment_amount, tenure, selected_institutions, consent_given, status, created_at")
          .eq("email", user.email ?? "")
          .order("created_at", { ascending: false }),
        supabase
          .from("leads")
          .select("id, name, email, phone, source, created_at")
          .eq("email", user.email ?? "")
          .order("created_at", { ascending: false }),
        supabase
          .from("chat_sessions")
          .select("id, session_token, created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("data_deletion_requests")
          .select("id, status, requested_at, completed_at")
          .eq("user_id", user.id)
          .order("requested_at", { ascending: false }),
      ]);

      if (q.error) throw q.error;
      if (l.error) throw l.error;
      if (s.error) throw s.error;
      if (d.error) throw d.error;

      setQuotes((q.data ?? []) as QuoteRow[]);
      setLeads((l.data ?? []) as LeadRow[]);
      setChatSessions((s.data ?? []) as ChatSessionRow[]);
      setDeletionRequests((d.data ?? []) as DeletionRequestRow[]);
    } catch {
      setError("We couldn't load your data right now. Please try again.");
    } finally {
      setFetching(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleExport = () => {
    if (!user) return;
    const payload = {
      account: {
        id: user.id,
        email: user.email,
        createdAt: user.created_at,
      },
      quoteRequests: quotes,
      leads,
      chatSessions,
      deletionRequests,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `safe-methods-personal-data-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDelete = async () => {
    if (!user || !user.email) return;
    if (confirmText.toUpperCase() !== "DELETE") return;
    setDeleting(true);
    setDeleteError(null);
    try {
      const emailHash = await sha256(user.email.toLowerCase());
      const { error: insertError } = await supabase.from("data_deletion_requests").insert({
        user_id: user.id,
        user_email_hash: emailHash,
        status: "pending",
      });
      if (insertError) throw insertError;
      setDeleteSuccess(true);
      loadData();
    } catch {
      setDeleteError("Something went wrong submitting your deletion request. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <main className="container mx-auto px-4 py-24 flex justify-center">
        <LoaderIcon className="w-6 h-6 animate-spin text-muted-foreground" />
      </main>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const hasPendingDeletion = deletionRequests.some((r) => r.status === "pending");

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: "overview", label: "Overview", count: 0 },
    { key: "quotes", label: "Quote Requests", count: quotes.length },
    { key: "leads", label: "Contact Submissions", count: leads.length },
    { key: "chat", label: "Chat Sessions", count: chatSessions.length },
    { key: "deletion", label: "Data Deletion", count: deletionRequests.length },
  ];

  return (
    <main className="container mx-auto px-4 py-12 md:py-16">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-heading text-3xl md:text-4xl text-foreground mb-2">
            Your Account & Data
          </h1>
          <p className="text-muted-foreground">
            View, export, or permanently delete the personal data Safe Methods holds about you.
          </p>
        </div>

        {/* Action bar */}
        <div className="flex flex-wrap gap-3 mb-8">
          <Button variant="secondary" onClick={handleExport}>
            <DownloadIcon className="w-4 h-4 mr-2" />
            Export My Data
          </Button>
          <Button
            variant="ghost"
            onClick={() => setTab("deletion")}
            className="text-destructive border-destructive/30 hover:bg-destructive/5"
          >
            <TrashIcon className="w-4 h-4 mr-2" />
            Request Deletion
          </Button>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-md bg-destructive/10 border border-destructive/30 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="flex flex-wrap gap-1 mb-6 border-b border-border-subtle">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
                tab === t.key
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label}
              {t.count > 0 && (
                <span className="ml-2 text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {fetching && (
          <div className="flex justify-center py-12">
            <LoaderIcon className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        )}

        {!fetching && tab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-5">
              <FileTextIcon className="w-6 h-6 text-primary mb-3" />
              <p className="text-2xl font-heading font-bold text-foreground">{quotes.length}</p>
              <p className="text-sm text-muted-foreground">Quote Requests</p>
            </Card>
            <Card className="p-5">
              <MailIcon className="w-6 h-6 text-primary mb-3" />
              <p className="text-2xl font-heading font-bold text-foreground">{leads.length}</p>
              <p className="text-sm text-muted-foreground">Contact Submissions</p>
            </Card>
            <Card className="p-5">
              <ClockIcon className="w-6 h-6 text-primary mb-3" />
              <p className="text-2xl font-heading font-bold text-foreground">{chatSessions.length}</p>
              <p className="text-sm text-muted-foreground">Chat Sessions</p>
            </Card>
          </div>
        )}

        {!fetching && tab === "quotes" && (
          <div className="space-y-3">
            {quotes.length === 0 ? (
              <p className="text-muted-foreground text-sm">No quote requests found.</p>
            ) : (
              quotes.map((q) => (
                <Card key={q.id} className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-sm font-medium text-foreground capitalize">
                      {q.request_type} Request
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground capitalize">
                      {q.status}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">
                    {new Date(q.created_at).toLocaleString()}
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {q.loan_amount != null && <p>Loan: ${q.loan_amount.toLocaleString()}</p>}
                    {q.monthly_income != null && <p>Income: ${q.monthly_income.toLocaleString()}</p>}
                    {q.investment_amount != null && <p>Investment: ${q.investment_amount.toLocaleString()}</p>}
                    {q.tenure && <p>Term: {q.tenure}</p>}
                  </div>
                  {q.selected_institutions.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {q.selected_institutions.map((b) => (
                        <span key={b} className="text-xs px-2 py-1 bg-muted rounded text-muted-foreground">
                          {b}
                        </span>
                      ))}
                    </div>
                  )}
                </Card>
              ))
            )}
          </div>
        )}

        {!fetching && tab === "leads" && (
          <div className="space-y-3">
            {leads.length === 0 ? (
              <p className="text-muted-foreground text-sm">No contact form submissions found.</p>
            ) : (
              leads.map((l) => (
                <Card key={l.id} className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">{l.name}</p>
                      <p className="text-xs text-muted-foreground">{l.source}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(l.created_at).toLocaleString()}
                    </p>
                  </div>
                  {l.phone && <p className="text-sm text-muted-foreground mt-2">Phone: {l.phone}</p>}
                </Card>
              ))
            )}
          </div>
        )}

        {!fetching && tab === "chat" && (
          <div className="space-y-3">
            {chatSessions.length === 0 ? (
              <p className="text-muted-foreground text-sm">No chat sessions linked to your account.</p>
            ) : (
              chatSessions.map((s) => (
                <Card key={s.id} className="p-5 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">Session</p>
                    <p className="text-xs text-muted-foreground font-mono">
                      {s.session_token.slice(0, 8)}…
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {new Date(s.created_at).toLocaleString()}
                  </p>
                </Card>
              ))
            )}
          </div>
        )}

        {!fetching && tab === "deletion" && (
          <div className="space-y-6">
            {/* Existing requests */}
            {deletionRequests.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-foreground">Your Deletion Requests</h3>
                {deletionRequests.map((r) => (
                  <Card key={r.id} className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {r.status === "pending" ? (
                        <ClockIcon className="w-5 h-5 text-warning" />
                      ) : r.status === "completed" ? (
                        <CheckCircleIcon className="w-5 h-5 text-success" />
                      ) : (
                        <AlertTriangleIcon className="w-5 h-5 text-muted-foreground" />
                      )}
                      <div>
                        <p className="text-sm text-foreground capitalize">{r.status}</p>
                        <p className="text-xs text-muted-foreground">
                          Requested {new Date(r.requested_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    {r.completed_at && (
                      <p className="text-xs text-muted-foreground">
                        Completed {new Date(r.completed_at).toLocaleDateString()}
                      </p>
                    )}
                  </Card>
                ))}
              </div>
            )}

            {deleteSuccess ? (
              <Card className="p-6">
                <div className="flex items-start gap-3">
                  <CheckCircleIcon className="w-6 h-6 text-success shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-heading text-lg text-foreground mb-1">Request Submitted</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Your permanent data deletion request has been recorded. Our team will
                      process it within 30 days. You'll receive a confirmation email once it's
                      complete. Note: some data may be retained as required by law.
                    </p>
                  </div>
                </div>
              </Card>
            ) : hasPendingDeletion ? (
              <Card className="p-6">
                <div className="flex items-start gap-3">
                  <ClockIcon className="w-6 h-6 text-warning shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-heading text-lg text-foreground mb-1">Pending Request</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      You already have a pending deletion request. Our team is processing it.
                      No further action is needed at this time.
                    </p>
                  </div>
                </div>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <ShieldIcon className="w-5 h-5 text-primary" />
                    <CardTitle>Permanently Delete My Data</CardTitle>
                  </div>
                </CardHeader>
                <CardBody className="space-y-4">
                  <div className="p-4 rounded-md bg-warning/5 border border-warning/30">
                    <div className="flex items-start gap-2">
                      <AlertTriangleIcon className="w-5 h-5 text-warning shrink-0 mt-0.5" />
                      <p className="text-sm text-foreground leading-relaxed">
                        This action is irreversible. Once processed, all your personal data —
                        quote requests, contact submissions, and chat history — will be
                        permanently removed. Some data may be retained as required by law.
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Type <span className="font-mono font-bold text-destructive">DELETE</span> to confirm
                    </label>
                    <input
                      type="text"
                      value={confirmText}
                      onChange={(e) => setConfirmText(e.target.value)}
                      placeholder="DELETE"
                      className="w-full px-4 py-2.5 bg-background border border-border-subtle text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>

                  {deleteError && (
                    <p className="text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-md px-4 py-3">
                      {deleteError}
                    </p>
                  )}

                  <Button
                    variant="primary"
                    onClick={handleDelete}
                    disabled={deleting || confirmText.toUpperCase() !== "DELETE"}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90 border-transparent"
                  >
                    {deleting ? (
                      <>
                        <LoaderIcon className="w-4 h-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <TrashIcon className="w-4 h-4 mr-2" />
                        Permanently Delete My Data
                      </>
                    )}
                  </Button>
                </CardBody>
              </Card>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
