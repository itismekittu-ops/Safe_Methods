import React, { useState, useEffect } from "react";
import { XIcon, CheckCircleIcon, LoaderIcon, ShieldCheckIcon, ArrowRightIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "./Button";
import { TextInput } from "./TextInput";
import { Select } from "./Select";
import { supabase } from "../lib/supabase";

export interface BankMatchRef {
  name: string;
  productType: string;
  rate: number;
  rank: number;
  consultantId: string | null;
  consultantName: string | null;
}

interface GetQuotesModalProps {
  open: boolean;
  onClose: () => void;
  banks: BankMatchRef[];
  sessionToken: string | null;
}

type RequestMode = "loan" | "investment";

type Topic = "mortgage" | "personal_loan" | "gic" | "investment" | "general";

interface BlogRec {
  title: string;
  description: string;
  category: string;
  image: string;
  slug: string;
}

const BLOG_RECS: Record<Topic, BlogRec[]> = {
  mortgage: [
    { title: "5 Steps to Build an Emergency Fund", description: "A practical approach to securing a financial safety net without compromising your current lifestyle.", category: "Saving", image: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&q=80&w=600&h=400", slug: "emergency-fund" },
    { title: "How to Improve Your Credit Score Fast", description: "Actionable strategies to optimize your credit utilization and resolve outstanding discrepancies.", category: "Credit", image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=600&h=400", slug: "credit-score" },
  ],
  personal_loan: [
    { title: "How to Improve Your Credit Score Fast", description: "Actionable strategies to optimize your credit utilization and resolve outstanding discrepancies.", category: "Credit", image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=600&h=400", slug: "credit-score" },
    { title: "5 Steps to Build an Emergency Fund", description: "A practical approach to securing a financial safety net without compromising your current lifestyle.", category: "Saving", image: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&q=80&w=600&h=400", slug: "emergency-fund" },
  ],
  gic: [
    { title: "Investing 101 for Beginners", description: "Demystifying the markets: foundational principles for building a resilient investment portfolio.", category: "Investing", image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&q=80&w=600&h=400", slug: "investing-101" },
    { title: "5 Steps to Build an Emergency Fund", description: "A practical approach to securing a financial safety net without compromising your current lifestyle.", category: "Saving", image: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&q=80&w=600&h=400", slug: "emergency-fund" },
  ],
  investment: [
    { title: "Investing 101 for Beginners", description: "Demystifying the markets: foundational principles for building a resilient investment portfolio.", category: "Investing", image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&q=80&w=600&h=400", slug: "investing-101" },
    { title: "5 Steps to Build an Emergency Fund", description: "A practical approach to securing a financial safety net without compromising your current lifestyle.", category: "Saving", image: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&q=80&w=600&h=400", slug: "emergency-fund" },
  ],
  general: [
    { title: "5 Steps to Build an Emergency Fund", description: "A practical approach to securing a financial safety net without compromising your current lifestyle.", category: "Saving", image: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&q=80&w=600&h=400", slug: "emergency-fund" },
    { title: "Investing 101 for Beginners", description: "Demystifying the markets: foundational principles for building a resilient investment portfolio.", category: "Investing", image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&q=80&w=600&h=400", slug: "investing-101" },
  ],
};

function topicFromProductType(pt: string | undefined): Topic {
  if (pt === "mortgage") return "mortgage";
  if (pt === "personal_loan") return "personal_loan";
  if (pt === "gic") return "gic";
  if (pt === "investment") return "investment";
  return "general";
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^[\d\s()+\-]{7,}$/;

export function GetQuotesModal({ open, onClose, banks, sessionToken }: GetQuotesModalProps) {
  const [mode, setMode] = useState<RequestMode>("loan");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loanAmount, setLoanAmount] = useState("");
  const [monthlyIncome, setMonthlyIncome] = useState("");
  const [investmentAmount, setInvestmentAmount] = useState("");
  const [tenure, setTenure] = useState("5-year");
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const key = `safebot_quote_submitted_${sessionToken ?? "anon"}`;
    if (sessionStorage.getItem(key) === "true") {
      setAlreadySubmitted(true);
    }
  }, [open, sessionToken]);

  useEffect(() => {
    if (!open) return;
    const productType = banks[0]?.productType ?? "";
    if (productType === "gic" || productType === "investment") {
      setMode("investment");
    } else {
      setMode("loan");
    }
  }, [open, banks]);

  if (!open) return null;

  const selectedBanks = banks.map((b) => b.name);

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Name is required.";
    if (!email.trim()) e.email = "Email is required.";
    else if (!emailRegex.test(email)) e.email = "Please enter a valid email address.";
    if (phone.trim() && !phoneRegex.test(phone)) e.phone = "Please enter a valid phone number.";
    if (mode === "loan") {
      if (!loanAmount.trim()) e.loanAmount = "Loan amount is required.";
      else if (isNaN(Number(loanAmount)) || Number(loanAmount) <= 0) e.loanAmount = "Enter a valid amount.";
      if (!monthlyIncome.trim()) e.monthlyIncome = "Monthly income is required.";
      else if (isNaN(Number(monthlyIncome)) || Number(monthlyIncome) <= 0) e.monthlyIncome = "Enter a valid amount.";
    } else {
      if (!investmentAmount.trim()) e.investmentAmount = "Investment amount is required.";
      else if (isNaN(Number(investmentAmount)) || Number(investmentAmount) <= 0) e.investmentAmount = "Enter a valid amount.";
    }
    if (!consent) e.consent = "You must provide consent to submit.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    if (!validate()) return;

    setSubmitting(true);
    try {
      const { data: sessionData } = await supabase
        .from("chat_sessions")
        .select("id")
        .eq("session_token", sessionToken ?? "")
        .limit(1)
        .maybeSingle();

      const insertPayload: Record<string, unknown> = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim().replace(/\s+/g, "") || null,
        request_type: mode,
        selected_institutions: selectedBanks,
        consent_given: true,
        consent_timestamp: new Date().toISOString(),
        status: "pending",
      };

      if (mode === "loan") {
        insertPayload.loan_amount = Number(loanAmount);
        insertPayload.monthly_income = Number(monthlyIncome);
      } else {
        insertPayload.investment_amount = Number(investmentAmount);
        insertPayload.tenure = tenure;
      }

      if (sessionData) {
        insertPayload.session_id = sessionData.id;
      }

      const { error: insertError } = await supabase
        .from("quote_requests")
        .insert(insertPayload);

      if (insertError) throw insertError;

      // Fire transactional confirmation email (F3-US9) — best-effort, non-blocking
      try {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
        const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
        await fetch(`${supabaseUrl}/functions/v1/send-quote-confirmation`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${anonKey}`,
            apikey: anonKey,
          },
          body: JSON.stringify({ email: email.trim().toLowerCase() }),
        });
      } catch {
        // Email send is best-effort; don't block the success UI
      }

      sessionStorage.setItem(`safebot_quote_submitted_${sessionToken ?? "anon"}`, "true");
      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 5000);
    } catch (err) {
      console.error(err);
      setSubmitError("Something went wrong submitting your request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (submitting) return;
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={handleClose}
    >
      <div
        className="bg-surface border border-border-subtle rounded-xl shadow-raised w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {success ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-success/10 border border-success/30 flex items-center justify-center mx-auto mb-6">
              <CheckCircleIcon className="w-8 h-8 text-success" />
            </div>
            <h2 className="font-heading text-2xl text-foreground mb-3">Request Submitted</h2>
            <p className="text-muted-foreground leading-relaxed mb-2">
              You will receive offers from all selected advisors/banks within 5 business days.
            </p>

            {/* Contextual blog recommendations (F3-US8) */}
            {(() => {
              const topic = topicFromProductType(banks[0]?.productType);
              const recs = BLOG_RECS[topic] ?? BLOG_RECS.general;
              return (
                <div className="mt-6 text-left">
                  <p className="text-sm font-medium text-foreground mb-3">
                    While you wait, explore these related resources:
                  </p>
                  <div className="space-y-3">
                    {recs.map((rec) => (
                      <Link
                        key={rec.slug}
                        to="/blog"
                        className="flex items-center gap-3 p-3 rounded-lg border border-border-subtle bg-background hover:border-border hover:bg-muted transition-colors group"
                      >
                        <img src={rec.image} alt={rec.title} className="w-14 h-14 rounded-md object-cover shrink-0" />
                        <div className="min-w-0 flex-grow">
                          <p className="text-sm font-medium text-foreground truncate">{rec.title}</p>
                          <p className="text-xs text-muted-foreground line-clamp-2">{rec.description}</p>
                        </div>
                        <ArrowRightIcon className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-transform shrink-0" />
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })()}

            <p className="text-xs text-muted-foreground mt-6">This window will close automatically...</p>
          </div>
        ) : alreadySubmitted ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-accent/10 border border-accent/30 flex items-center justify-center mx-auto mb-6">
              <ShieldCheckIcon className="w-8 h-8 text-accent" />
            </div>
            <h2 className="font-heading text-2xl text-foreground mb-3">Already Submitted</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              You've already submitted a quote request in this session. Our team is
              processing it and you'll receive offers within 5 business days.
            </p>
            <Button variant="secondary" onClick={onClose}>Close</Button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between p-6 border-b border-border-subtle">
              <h2 className="font-heading text-2xl text-foreground">Get Quotes</h2>
              <button
                onClick={handleClose}
                className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                aria-label="Close"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Selected institutions */}
              <div>
                <p className="text-sm font-medium text-foreground mb-2">Your request will be sent to:</p>
                <div className="flex flex-wrap gap-2">
                  {selectedBanks.length > 0 ? (
                    selectedBanks.map((b) => (
                      <span key={b} className="text-xs px-3 py-1.5 bg-muted border border-border-subtle rounded-md text-foreground">
                        {b}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-muted-foreground">No banks matched yet — ask a question first.</span>
                  )}
                </div>
              </div>

              {/* Loan / Investment toggle */}
              <div className="flex gap-2 p-1 bg-muted rounded-lg">
                <button
                  type="button"
                  onClick={() => setMode("loan")}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                    mode === "loan" ? "bg-surface text-foreground shadow-sm" : "text-muted-foreground"
                  }`}
                >
                  Loan
                </button>
                <button
                  type="button"
                  onClick={() => setMode("investment")}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                    mode === "investment" ? "bg-surface text-foreground shadow-sm" : "text-muted-foreground"
                  }`}
                >
                  Investment
                </button>
              </div>

              {/* Contact fields */}
              <TextInput
                label="Name"
                placeholder="Jane Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              {errors.name && <p className="text-xs text-destructive -mt-2">{errors.name}</p>}

              <TextInput
                label="Email"
                type="email"
                placeholder="jane@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {errors.email && <p className="text-xs text-destructive -mt-2">{errors.email}</p>}

              <TextInput
                label="Phone (optional)"
                type="tel"
                placeholder="888-841-7755"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              {errors.phone && <p className="text-xs text-destructive -mt-2">{errors.phone}</p>}

              {/* Dynamic fields */}
              {mode === "loan" ? (
                <>
                  <TextInput
                    label="Loan Amount"
                    type="number"
                    placeholder="50000"
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(e.target.value)}
                  />
                  {errors.loanAmount && <p className="text-xs text-destructive -mt-2">{errors.loanAmount}</p>}

                  <TextInput
                    label="Monthly Income"
                    type="number"
                    placeholder="5000"
                    value={monthlyIncome}
                    onChange={(e) => setMonthlyIncome(e.target.value)}
                  />
                  {errors.monthlyIncome && <p className="text-xs text-destructive -mt-2">{errors.monthlyIncome}</p>}
                </>
              ) : (
                <>
                  <TextInput
                    label="Investment Amount"
                    type="number"
                    placeholder="25000"
                    value={investmentAmount}
                    onChange={(e) => setInvestmentAmount(e.target.value)}
                  />
                  {errors.investmentAmount && <p className="text-xs text-destructive -mt-2">{errors.investmentAmount}</p>}

                  <Select label="Term" value={tenure} onChange={(e) => setTenure(e.target.value)}>
                    <option value="1-year">1 Year</option>
                    <option value="3-year">3 Years</option>
                    <option value="5-year">5 Years</option>
                    <option value="10-year">10 Years</option>
                  </Select>
                </>
              )}

              {/* Consent */}
              <div className="pt-2">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded border-border-subtle text-accent focus:ring-accent/30"
                  />
                  <span className="text-sm text-muted-foreground leading-relaxed">
                    I authorize Safe Methods to share my contact details with the
                    listed institutions for the purpose of providing quotes. I
                    understand my data will not be used for any other purpose.
                  </span>
                </label>
                {errors.consent && <p className="text-xs text-destructive mt-1">{errors.consent}</p>}
              </div>

              {submitError && (
                <p className="text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-md px-4 py-3">
                  {submitError}
                </p>
              )}

              <Button
                type="submit"
                variant="primary"
                className="w-full bg-accent text-primary hover:bg-accent/90 border-transparent"
                disabled={submitting || !consent || selectedBanks.length === 0}
              >
                {submitting ? (
                  <>
                    <LoaderIcon className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Quote Request"
                )}
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
