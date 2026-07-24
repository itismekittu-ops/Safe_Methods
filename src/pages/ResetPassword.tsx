import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircleIcon, LoaderIcon, LockIcon } from "lucide-react";
import { Card, CardBody } from "../components/Card";
import { Button } from "../components/Button";
import { TextInput } from "../components/TextInput";
import { Logo } from "../components/Logo";
import { useAuth } from "../lib/auth";

const STRENGTH_RULES = [
  { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { label: "Contains uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { label: "Contains lowercase letter", test: (p: string) => /[a-z]/.test(p) },
  { label: "Contains a number", test: (p: string) => /\d/.test(p) },
];

export function ResetPassword() {
  const { updatePassword, loading } = useAuth();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!loading) setReady(true);
  }, [loading]);

  const passedRules = STRENGTH_RULES.filter((r) => r.test(password));
  const allRulesPassed = passedRules.length === STRENGTH_RULES.length;
  const passwordsMatch = password === confirmPassword && password.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!allRulesPassed) {
      setError("Please meet all password strength requirements.");
      return;
    }
    if (!passwordsMatch) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    const { error } = await updatePassword(password);
    setSubmitting(false);

    if (error) {
      setError(error);
    } else {
      setSuccess(true);
      setTimeout(() => navigate("/account"), 3000);
    }
  };

  if (!ready) {
    return (
      <main className="container mx-auto px-4 py-24 flex justify-center">
        <LoaderIcon className="w-6 h-6 animate-spin text-muted-foreground" />
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-16 md:py-24 flex justify-center">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Logo />
        </div>

        <Card>
          <CardBody className="p-8">
            {success ? (
              <div className="text-center space-y-5">
                <div className="w-14 h-14 rounded-full bg-success/10 border border-success/30 flex items-center justify-center mx-auto">
                  <CheckCircleIcon className="w-7 h-7 text-success" />
                </div>
                <div>
                  <h1 className="font-heading text-2xl text-foreground mb-2">Password Updated</h1>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Your password has been changed successfully. You'll be redirected to your account shortly.
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="text-center mb-6">
                  <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center mx-auto mb-4">
                    <LockIcon className="w-7 h-7 text-primary" />
                  </div>
                  <h1 className="font-heading text-2xl text-foreground mb-2">Set a New Password</h1>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Choose a strong password for your Safe Methods account.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <TextInput
                    label="New Password"
                    type="password"
                    placeholder="Enter new password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />

                  <div className="space-y-1.5">
                    {STRENGTH_RULES.map((rule) => {
                      const passed = rule.test(password);
                      return (
                        <div key={rule.label} className="flex items-center gap-2">
                          <div
                            className={`w-4 h-4 rounded-full flex items-center justify-center text-xs ${
                              passed ? "bg-success/20 text-success" : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {passed ? "✓" : ""}
                          </div>
                          <span className={`text-xs ${passed ? "text-foreground" : "text-muted-foreground"}`}>
                            {rule.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <TextInput
                    label="Confirm Password"
                    type="password"
                    placeholder="Re-enter new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  {confirmPassword.length > 0 && !passwordsMatch && (
                    <p className="text-xs text-destructive -mt-2">Passwords do not match.</p>
                  )}

                  {error && (
                    <p className="text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-md px-4 py-3">
                      {error}
                    </p>
                  )}

                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full bg-accent text-primary hover:bg-accent/90 border-transparent"
                    disabled={submitting || !allRulesPassed || !passwordsMatch}
                  >
                    {submitting ? (
                      <>
                        <LoaderIcon className="w-4 h-4 mr-2 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      "Update Password"
                    )}
                  </Button>
                </form>
              </>
            )}
          </CardBody>
        </Card>
      </div>
    </main>
  );
}
