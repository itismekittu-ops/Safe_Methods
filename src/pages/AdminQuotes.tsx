import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckCircleIcon,
  XCircleIcon,
  LoaderIcon,
  RefreshCwIcon,
  SendIcon,
  ClockIcon,
  ShieldCheckIcon,
  AlertCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "lucide-react";
import { Button } from "../components/Button";
import { Badge } from "../components/Badge";
import { useAuth } from "../lib/auth";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

interface Bid {
  id: string;
  status: string;
  proposed_rate: number | null;
  product_name: string | null;
  tenure_months: number | null;
  advisor_notes: string | null;
  submitted_at: string | null;
  reviewed_at: string | null;
  admin_notes: string | null;
  consultant_name: string;
  bank_name: string;
}

interface QuoteGroup {
  id: string;
  reference_id: string;
  name: string;
  email: string;
  request_type: string;
  loan_amount: number | null;
  monthly_income: number | null;
  investment_amount: number | null;
  tenure: string | null;
  sla_deadline: string;
  aggregated_quotes_sent: boolean;
  aggregated_quotes_sent_at: string | null;
  created_at: string;
  bids: Bid[];
}

type StatusFilter = "all" | "pending" | "ready" | "dispatched";

const STATUS_BADGE: Record<string, { variant: "accent" | "neutral" | "success" | "warning"; label: string }> = {
  pending_consultant_submission: { variant: "neutral", label: "Awaiting Bid" },
  pending_admin_review: { variant: "warning", label: "Needs Review" },
  approved: { variant: "success", label: "Approved" },
  rejected: { variant: "accent", label: "Rejected" },
  expired: { variant: "neutral", label: "Expired" },
};

export function AdminQuotes() {
  const { session, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [quotes, setQuotes] = useState<QuoteGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [expandedQuote, setExpandedQuote] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const serviceRoleKey = ""; // Admin uses authenticated session; dispatch goes through edge fn

  useEffect(() => {
    if (!authLoading && !session) {
      navigate("/login", { replace: true });
    }
  }, [authLoading, session, navigate]);

  const fetchQuotes = useCallback(async () => {
    if (!session) return;
    setLoading(true);
    setError(null);

    try {
      const token = session.access_token;

      // Fetch quote requests with their bids via the service-role proxy
      const response = await fetch(`${SUPABASE_URL}/functions/v1/admin-quotes-data`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          apikey: ANON_KEY,
        },
        body: JSON.stringify({ action: "list" }),
      });

      if (!response.ok) {
        throw new Error("Failed to load quotes");
      }

      const data = await response.json();
      if (data.quotes) {
        setQuotes(data.quotes);
      }
    } catch {
      // Fallback: direct fetch via anon key (service role handles via edge fn)
      setError("Unable to load quote data. Please ensure you have admin access.");
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    if (session) fetchQuotes();
  }, [session, fetchQuotes]);

  async function handleBidAction(bidId: string, action: "approve" | "reject") {
    if (!session) return;
    setActionLoading(bidId);
    setActionMessage(null);

    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/admin-quotes-data`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
          apikey: ANON_KEY,
        },
        body: JSON.stringify({ action, bid_id: bidId }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Action failed");
      }

      setActionMessage({ type: "success", text: `Bid ${action}d successfully.` });
      await fetchQuotes();
    } catch (err) {
      setActionMessage({ type: "error", text: (err as Error).message });
    } finally {
      setActionLoading(null);
    }
  }

  async function handleDispatch(quoteRequestId: string, force: boolean) {
    if (!session) return;
    setActionLoading(`dispatch-${quoteRequestId}`);
    setActionMessage(null);

    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/dispatch-aggregated-quotes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
          apikey: ANON_KEY,
        },
        body: JSON.stringify({ quote_request_id: quoteRequestId, force }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Dispatch failed");
      }

      setActionMessage({
        type: "success",
        text: `Offers dispatched to customer (${result.dispatched} bid${result.dispatched !== 1 ? "s" : ""}).`,
      });
      await fetchQuotes();
    } catch (err) {
      setActionMessage({ type: "error", text: (err as Error).message });
    } finally {
      setActionLoading(null);
    }
  }

  const filteredQuotes = quotes.filter((q) => {
    if (filter === "all") return true;
    if (filter === "dispatched") return q.aggregated_quotes_sent;
    if (filter === "pending") return !q.aggregated_quotes_sent && q.bids.some((b) => b.status === "pending_consultant_submission");
    if (filter === "ready") return !q.aggregated_quotes_sent && q.bids.some((b) => b.status === "pending_admin_review" || b.status === "approved");
    return true;
  });

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoaderIcon className="w-8 h-8 text-accent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="font-heading text-3xl text-foreground">Quote Administration</h1>
            <p className="text-muted-foreground text-sm mt-1">Review consultant bids and dispatch offers to customers</p>
          </div>
          <Button variant="secondary" size="sm" onClick={fetchQuotes} disabled={loading}>
            <RefreshCwIcon className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {/* Action message */}
        {actionMessage && (
          <div
            className={`mb-6 p-4 rounded-lg border ${
              actionMessage.type === "success"
                ? "bg-success/5 border-success/20 text-success"
                : "bg-destructive/5 border-destructive/20 text-destructive"
            }`}
          >
            <p className="text-sm font-medium">{actionMessage.text}</p>
          </div>
        )}

        {/* Filters */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {(["all", "pending", "ready", "dispatched"] as StatusFilter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 text-sm font-medium rounded-md border transition-colors ${
                filter === f
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-surface text-muted-foreground border-border-subtle hover:border-border hover:text-foreground"
              }`}
            >
              {f === "all" ? "All" : f === "pending" ? "Awaiting Bids" : f === "ready" ? "Ready for Review" : "Dispatched"}
              {f !== "all" && (
                <span className="ml-1.5 text-xs opacity-70">
                  ({quotes.filter((q) => {
                    if (f === "dispatched") return q.aggregated_quotes_sent;
                    if (f === "pending") return !q.aggregated_quotes_sent && q.bids.some((b) => b.status === "pending_consultant_submission");
                    if (f === "ready") return !q.aggregated_quotes_sent && q.bids.some((b) => b.status === "pending_admin_review" || b.status === "approved");
                    return false;
                  }).length})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <LoaderIcon className="w-8 h-8 text-accent animate-spin" />
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="bg-surface border border-border-subtle rounded-xl p-12 text-center">
            <AlertCircleIcon className="w-8 h-8 text-destructive mx-auto mb-4" />
            <p className="text-muted-foreground">{error}</p>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && filteredQuotes.length === 0 && (
          <div className="bg-surface border border-border-subtle rounded-xl p-12 text-center">
            <ShieldCheckIcon className="w-8 h-8 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No quote requests match the current filter.</p>
          </div>
        )}

        {/* Quote cards */}
        {!loading &&
          !error &&
          filteredQuotes.map((q) => {
            const isExpanded = expandedQuote === q.id;
            const approvedCount = q.bids.filter((b) => b.status === "approved").length;
            const reviewCount = q.bids.filter((b) => b.status === "pending_admin_review").length;
            const slaDate = new Date(q.sla_deadline);
            const slaExpired = slaDate <= new Date();
            const canDispatch = !q.aggregated_quotes_sent && approvedCount > 0;

            return (
              <div key={q.id} className="bg-surface border border-border-subtle rounded-xl mb-4 overflow-hidden shadow-soft">
                {/* Quote header */}
                <button
                  onClick={() => setExpandedQuote(isExpanded ? null : q.id)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-muted/30 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-mono text-sm font-medium text-primary">{q.reference_id}</span>
                      {q.aggregated_quotes_sent ? (
                        <Badge variant="success">Dispatched</Badge>
                      ) : slaExpired ? (
                        <Badge variant="warning">SLA Expired</Badge>
                      ) : reviewCount > 0 ? (
                        <Badge variant="warning">{reviewCount} to Review</Badge>
                      ) : (
                        <Badge variant="neutral">Awaiting Bids</Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-muted-foreground">
                      <span>{q.name}</span>
                      <span>{q.request_type === "loan" ? "Loan" : "Investment"}</span>
                      <span className="flex items-center gap-1">
                        <ClockIcon className="w-3.5 h-3.5" />
                        SLA: {slaDate.toLocaleDateString("en-CA", { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                      <span>{approvedCount}/{q.bids.length} approved</span>
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronUpIcon className="w-5 h-5 text-muted-foreground shrink-0 ml-4" />
                  ) : (
                    <ChevronDownIcon className="w-5 h-5 text-muted-foreground shrink-0 ml-4" />
                  )}
                </button>

                {/* Expanded content */}
                {isExpanded && (
                  <div className="border-t border-border-subtle">
                    {/* Customer details */}
                    <div className="p-5 bg-muted/20">
                      <h3 className="text-sm font-medium text-foreground mb-3">Customer Request</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                        <div>
                          <span className="text-muted-foreground block text-xs">Name</span>
                          <span className="text-foreground">{q.name}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block text-xs">Email</span>
                          <span className="text-foreground">{q.email}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block text-xs">Type</span>
                          <span className="text-foreground capitalize">{q.request_type}</span>
                        </div>
                        {q.request_type === "loan" ? (
                          <>
                            {q.loan_amount != null && (
                              <div>
                                <span className="text-muted-foreground block text-xs">Loan Amount</span>
                                <span className="text-foreground">${q.loan_amount.toLocaleString()}</span>
                              </div>
                            )}
                            {q.monthly_income != null && (
                              <div>
                                <span className="text-muted-foreground block text-xs">Monthly Income</span>
                                <span className="text-foreground">${q.monthly_income.toLocaleString()}</span>
                              </div>
                            )}
                          </>
                        ) : (
                          <>
                            {q.investment_amount != null && (
                              <div>
                                <span className="text-muted-foreground block text-xs">Investment Amount</span>
                                <span className="text-foreground">${q.investment_amount.toLocaleString()}</span>
                              </div>
                            )}
                            {q.tenure && (
                              <div>
                                <span className="text-muted-foreground block text-xs">Term</span>
                                <span className="text-foreground">{q.tenure}</span>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>

                    {/* Bids */}
                    <div className="p-5">
                      <h3 className="text-sm font-medium text-foreground mb-4">Consultant Bids</h3>
                      <div className="space-y-3">
                        {q.bids.map((bid) => {
                          const badge = STATUS_BADGE[bid.status] || { variant: "neutral" as const, label: bid.status };
                          const isActioning = actionLoading === bid.id;

                          return (
                            <div
                              key={bid.id}
                              className="border border-border-subtle rounded-lg p-4 bg-background"
                            >
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-medium text-foreground">{bid.bank_name}</span>
                                    <span className="text-muted-foreground text-sm">{bid.consultant_name}</span>
                                    <Badge variant={badge.variant}>{badge.label}</Badge>
                                  </div>

                                  {bid.proposed_rate != null && (
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 text-sm">
                                      <div>
                                        <span className="text-muted-foreground text-xs block">Rate</span>
                                        <span className="text-primary font-semibold">{bid.proposed_rate}%</span>
                                      </div>
                                      {bid.product_name && (
                                        <div>
                                          <span className="text-muted-foreground text-xs block">Product</span>
                                          <span className="text-foreground">{bid.product_name}</span>
                                        </div>
                                      )}
                                      {bid.tenure_months && (
                                        <div>
                                          <span className="text-muted-foreground text-xs block">Tenure</span>
                                          <span className="text-foreground">{bid.tenure_months} months</span>
                                        </div>
                                      )}
                                      {bid.submitted_at && (
                                        <div>
                                          <span className="text-muted-foreground text-xs block">Submitted</span>
                                          <span className="text-foreground">
                                            {new Date(bid.submitted_at).toLocaleDateString("en-CA", {
                                              month: "short",
                                              day: "numeric",
                                              hour: "2-digit",
                                              minute: "2-digit",
                                            })}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  )}

                                  {bid.advisor_notes && (
                                    <p className="text-sm text-muted-foreground mt-2 bg-muted/30 p-2 rounded">
                                      {bid.advisor_notes}
                                    </p>
                                  )}
                                </div>

                                {/* Actions for pending_admin_review bids */}
                                {bid.status === "pending_admin_review" && !q.aggregated_quotes_sent && (
                                  <div className="flex items-center gap-2 shrink-0">
                                    <button
                                      onClick={() => handleBidAction(bid.id, "approve")}
                                      disabled={isActioning}
                                      className="p-2 rounded-md border border-success/30 text-success hover:bg-success/10 transition-colors disabled:opacity-50"
                                      title="Approve bid"
                                    >
                                      {isActioning ? (
                                        <LoaderIcon className="w-4 h-4 animate-spin" />
                                      ) : (
                                        <CheckCircleIcon className="w-4 h-4" />
                                      )}
                                    </button>
                                    <button
                                      onClick={() => handleBidAction(bid.id, "reject")}
                                      disabled={isActioning}
                                      className="p-2 rounded-md border border-destructive/30 text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
                                      title="Reject bid"
                                    >
                                      <XCircleIcon className="w-4 h-4" />
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Dispatch action (F3-US17) */}
                    {!q.aggregated_quotes_sent && (
                      <div className="p-5 border-t border-border-subtle bg-muted/20">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {approvedCount > 0
                                ? `${approvedCount} approved bid${approvedCount !== 1 ? "s" : ""} ready to dispatch`
                                : "No approved bids yet"}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              Send all approved offers to the customer as a single comparison email.
                            </p>
                          </div>
                          <Button
                            variant="primary"
                            size="sm"
                            disabled={!canDispatch || actionLoading === `dispatch-${q.id}`}
                            onClick={() => handleDispatch(q.id, true)}
                          >
                            {actionLoading === `dispatch-${q.id}` ? (
                              <span className="flex items-center gap-2">
                                <LoaderIcon className="w-4 h-4 animate-spin" />
                                Sending...
                              </span>
                            ) : (
                              <span className="flex items-center gap-2">
                                <SendIcon className="w-4 h-4" />
                                Send Approved Quotes to Customer Now
                              </span>
                            )}
                          </Button>
                        </div>
                      </div>
                    )}

                    {q.aggregated_quotes_sent && (
                      <div className="p-5 border-t border-border-subtle bg-success/5">
                        <p className="text-sm text-success font-medium flex items-center gap-2">
                          <CheckCircleIcon className="w-4 h-4" />
                          Offers dispatched to customer
                          {q.aggregated_quotes_sent_at && (
                            <span className="text-xs font-normal text-muted-foreground">
                              on {new Date(q.aggregated_quotes_sent_at).toLocaleDateString("en-CA", {
                                month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit",
                              })}
                            </span>
                          )}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
      </div>
    </div>
  );
}
