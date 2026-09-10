import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { CheckCircleIcon, LoaderIcon, AlertCircleIcon, ShieldIcon, ClockIcon, SendIcon } from "lucide-react";
import { Button } from "../components/Button";
import { TextInput } from "../components/TextInput";
import { TextArea } from "../components/TextArea";
type PortalState = "loading" | "ready" | "submitting" | "success" | "error" | "expired" | "already_submitted";
interface BidContext {
  reference_id: string;
  request_type: string;
  loan_amount: number | null;
  monthly_income: number | null;
  investment_amount: number | null;
  tenure: string | null;
  bank_name: string;
  consultant_name: string;
  sla_deadline: string;
}
export function ConsultantPortal() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [state, setState] = useState<PortalState>("loading");
  const [context, setContext] = useState<BidContext | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [proposedRate, setProposedRate] = useState("");
  const [productName, setProductName] = useState("");
  const [tenureMonths, setTenureMonths] = useState("");
  const [advisorNotes, setAdvisorNotes] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  useEffect(() => {
    if (!token) {
      setErrorMessage("No access token provided. Please use the link from your email.");
      setState("error");
      return;
    }
    loadBidContext();
  }, [token]);
  async function loadBidContext() {
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
      const response = await fetch(`${supabaseUrl}/functions/v1/submit-consultant-bid`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${anonKey}`,
          apikey: anonKey
        },
        body: JSON.stringify({
          token,
          _preflight: true
        })
      });
      if (response.status === 410) {
        setState("expired");
        return;
      }
      if (response.status === 409) {
        setState("already_submitted");
        return;
      }
      if (!response.ok && response.status !== 400) {
        setState("error");
        setErrorMessage("This access link is invalid or has expired.");
        return;
      }
      setState("ready");
    } catch {
      setState("error");
      setErrorMessage("Unable to connect. Please check your internet connection and try again.");
    }
  }
  function validate(): boolean {
    const errors: Record<string, string> = {};
    const rate = Number(proposedRate);
    if (!proposedRate.trim() || !Number.isFinite(rate) || rate <= 0 || rate > 99.99) {
      errors.proposedRate = "Enter a valid rate between 0.01% and 99.99%.";
    }
    if (!productName.trim()) {
      errors.productName = "Product name is required.";
    }
    if (tenureMonths.trim()) {
      const tm = Number(tenureMonths);
      if (!Number.isInteger(tm) || tm < 1 || tm > 600) {
        errors.tenureMonths = "Enter a valid tenure (1-600 months).";
      }
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setState("submitting");
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
      const response = await fetch(`${supabaseUrl}/functions/v1/submit-consultant-bid`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${anonKey}`,
          apikey: anonKey
        },
        body: JSON.stringify({
          token,
          proposed_rate: Number(proposedRate),
          product_name: productName.trim(),
          tenure_months: tenureMonths.trim() ? Number(tenureMonths) : null,
          advisor_notes: advisorNotes.trim() || null
        })
      });
      if (response.status === 410) {
        setState("expired");
        return;
      }
      if (response.status === 409) {
        setState("already_submitted");
        return;
      }
      const result = await response.json();
      if (!response.ok) {
        setState("ready");
        setErrorMessage(result.error || "Something went wrong. Please try again.");
        return;
      }
      setState("success");
    } catch {
      setState("ready");
      setErrorMessage("Network error. Please try again.");
    }
  }
  return <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-12 sm:py-16">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="font-heading text-3xl sm:text-4xl text-primary mb-2">Safe Methods</h1>
          <p className="text-muted-foreground text-sm">Consultant Bid Portal</p>
        </div>

        {state === "loading" && <div className="bg-surface border border-border-subtle rounded-xl p-12 text-center shadow-soft">
            <LoaderIcon className="w-8 h-8 text-accent animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Verifying your access link...</p>
          </div>}

        {state === "error" && <div className="bg-surface border border-border-subtle rounded-xl p-12 text-center shadow-soft">
            <div className="w-16 h-16 rounded-full bg-destructive/10 border border-destructive/30 flex items-center justify-center mx-auto mb-6">
              <AlertCircleIcon className="w-8 h-8 text-destructive" />
            </div>
            <h2 className="font-heading text-2xl text-foreground mb-3">Access Denied</h2>
            <p className="text-muted-foreground leading-relaxed">{errorMessage}</p>
          </div>}

        {state === "expired" && <div className="bg-surface border border-border-subtle rounded-xl p-12 text-center shadow-soft">
            <div className="w-16 h-16 rounded-full bg-warning/10 border border-warning/30 flex items-center justify-center mx-auto mb-6">
              <ClockIcon className="w-8 h-8 text-warning" />
            </div>
            <h2 className="font-heading text-2xl text-foreground mb-3">Link Expired</h2>
            <p className="text-muted-foreground leading-relaxed">
              The deadline for this quote request has passed. If you believe this is an error,
              please contact us at info@safemethods.org.
            </p>
          </div>}

        {state === "already_submitted" && <div className="bg-surface border border-border-subtle rounded-xl p-12 text-center shadow-soft">
            <div className="w-16 h-16 rounded-full bg-accent/10 border border-accent/30 flex items-center justify-center mx-auto mb-6">
              <ShieldIcon className="w-8 h-8 text-accent" />
            </div>
            <h2 className="font-heading text-2xl text-foreground mb-3">Already Submitted</h2>
            <p className="text-muted-foreground leading-relaxed">
              Your bid for this quote request has already been submitted and is under review.
              Thank you for your participation.
            </p>
          </div>}

        {state === "success" && <div className="bg-surface border border-border-subtle rounded-xl p-12 text-center shadow-soft">
            <div className="w-16 h-16 rounded-full bg-success/10 border border-success/30 flex items-center justify-center mx-auto mb-6">
              <CheckCircleIcon className="w-8 h-8 text-success" />
            </div>
            <h2 className="font-heading text-2xl text-foreground mb-3">Bid Submitted</h2>
            <p className="text-muted-foreground leading-relaxed mb-2">
              Your proposed rate and terms have been submitted successfully.
            </p>
            <p className="text-muted-foreground leading-relaxed text-sm">
              The Safe Methods team will review your bid before presenting it to the client.
              You will not need to take any further action.
            </p>
          </div>}

        {(state === "ready" || state === "submitting") && <div className="bg-surface border border-border-subtle rounded-xl shadow-soft overflow-hidden">
            <div className="p-6 border-b border-border-subtle bg-muted/30">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <SendIcon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-heading text-xl text-foreground">Submit Your Bid</h2>
                  <p className="text-xs text-muted-foreground">Complete the form below with your competitive offer</p>
                </div>
              </div>

              <div className="mt-4 p-3 rounded-lg bg-warning/5 border border-warning/20">
                <p className="text-xs text-warning font-medium flex items-center gap-1.5">
                  <ClockIcon className="w-3.5 h-3.5" />
                  Submit before the 5-day SLA deadline. Late submissions will not be considered.
                </p>
              </div>
            </div>

            <div className="p-4 border-b border-border-subtle bg-primary/5">
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <ShieldIcon className="w-3.5 h-3.5 text-primary" />
                Customer personal details are hidden per Safe Methods privacy policy (BR-PRIV-01).
              </p>
            </div>

            {errorMessage && state === "ready" && <div className="mx-6 mt-6 p-3 rounded-lg bg-destructive/5 border border-destructive/20">
                <p className="text-sm text-destructive">{errorMessage}</p>
              </div>}

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <TextInput label="Proposed Rate (%)" type="number" step="0.01" min="0.01" max="99.99" placeholder="e.g. 5.49" value={proposedRate} onChange={(e) => setProposedRate(e.target.value)} required />
                {fieldErrors.proposedRate && <p className="text-xs text-destructive mt-1">{fieldErrors.proposedRate}</p>}
              </div>

              <div>
                <TextInput label="Product Name" placeholder="e.g. 5-Year Fixed Rate Mortgage" value={productName} onChange={(e) => setProductName(e.target.value)} maxLength={200} required />
                {fieldErrors.productName && <p className="text-xs text-destructive mt-1">{fieldErrors.productName}</p>}
              </div>

              <div>
                <TextInput label="Tenure (months, optional)" type="number" min="1" max="600" placeholder="e.g. 60" value={tenureMonths} onChange={(e) => setTenureMonths(e.target.value)} />
                {fieldErrors.tenureMonths && <p className="text-xs text-destructive mt-1">{fieldErrors.tenureMonths}</p>}
              </div>

              <div>
                <TextArea label="Additional Notes (optional)" placeholder="Any terms, conditions, or details the client should know about..." rows={4} maxLength={2000} value={advisorNotes} onChange={(e) => setAdvisorNotes(e.target.value)} />
              </div>

              <Button type="submit" variant="primary" size="lg" className="w-full" disabled={state === "submitting"}>
                {state === "submitting" ? <span className="flex items-center gap-2">
                    <LoaderIcon className="w-4 h-4 animate-spin" />
                    Submitting...
                  </span> : "Submit Bid"}
              </Button>
            </form>
          </div>}
      </div>
    </div>;
}