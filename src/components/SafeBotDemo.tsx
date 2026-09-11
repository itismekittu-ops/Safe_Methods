import React from "react";
import { ShieldIcon, LockIcon, EyeIcon, ScaleIcon } from "lucide-react";

const pillars = [
  {
    icon: ShieldIcon,
    title: "Guardrail-First",
    description: "Every message is screened for safety before reaching our AI — no unsafe input ever touches the model.",
  },
  {
    icon: LockIcon,
    title: "PII Protection",
    description: "Sensitive data like SINs and card numbers are automatically detected and blocked from the conversation.",
  },
  {
    icon: EyeIcon,
    title: "Full Transparency",
    description: "Every AI response is traced and audited, so you can trust the guidance you receive is grounded in real data.",
  },
  {
    icon: ScaleIcon,
    title: "Unbiased Rankings",
    description: "Bank recommendations are powered purely by objective rate data — never paid placements or manual overrides.",
  },
];

export function SafeBotDemo() {
  return (
    <section className="container mx-auto px-4 py-16 md:py-24 bg-surface border-y border-border-subtle">
      <div className="max-w-3xl mx-auto text-center mb-12">
        <h2 className="font-heading text-3xl md:text-4xl text-foreground mb-4">
          Built on Trust and Safety
        </h2>
        <p className="text-muted-foreground text-lg">
          SafeBot is engineered with multiple layers of protection so you get
          reliable, unbiased financial guidance — every time.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
        {pillars.map((pillar, idx) => (
          <div
            key={idx}
            className="bg-background border border-border-subtle rounded-lg p-6 flex flex-col items-center text-center hover:border-border transition-colors"
          >
            <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center mb-5">
              <pillar.icon className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-heading text-lg font-semibold text-foreground mb-3">
              {pillar.title}
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {pillar.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
