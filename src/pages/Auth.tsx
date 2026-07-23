import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardBody } from "../components/Card";
import { Tabs, TabList, Tab, TabPanel } from "../components/Tabs";
import { Button } from "../components/Button";
import { TextInput } from "../components/TextInput";
import { Logo } from "../components/Logo";
import { useAuth } from "../lib/auth";

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

export function Auth() {
  const { signUp, signIn } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");

  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);

  // Signup state
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirm, setSignupConfirm] = useState("");
  const [signupError, setSignupError] = useState<string | null>(null);
  const [signupLoading, setSignupLoading] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    if (!loginEmail.trim() || !loginPassword.trim()) {
      setLoginError("Please enter your email and password.");
      return;
    }
    setLoginLoading(true);
    const { error } = await signIn(loginEmail, loginPassword);
    setLoginLoading(false);
    if (error) {
      setLoginError(error);
    } else {
      navigate("/");
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError(null);
    setSignupSuccess(null);
    if (!signupName.trim() || !signupEmail.trim() || !signupPassword.trim()) {
      setSignupError("Please fill in all fields.");
      return;
    }
    if (signupPassword.length < 8) {
      setSignupError("Password must be at least 8 characters long.");
      return;
    }
    if (signupPassword !== signupConfirm) {
      setSignupError("Passwords do not match.");
      return;
    }
    setSignupLoading(true);
    const { error } = await signUp(signupEmail, signupPassword, signupName);
    setSignupLoading(false);
    if (error) {
      setSignupError(error);
    } else {
      setSignupSuccess("Account created! You're now signed in.");
      setTimeout(() => navigate("/"), 1200);
    }
  };

  return (
    <main className="w-full bg-background flex flex-col items-center justify-center px-4 py-16 sm:py-24">
      <div className="w-full max-w-[420px] flex flex-col items-center">
        <Logo size="lg" className="mb-10" />

        <Card floating className="w-full">
          <CardBody className="p-6 sm:p-8">
            <Tabs value={activeTab} onChange={(v) => { setActiveTab(v as "login" | "signup"); setLoginError(null); setSignupError(null); setSignupSuccess(null); }}>
              <TabList className="mb-8">
                <Tab value="login">Log In</Tab>
                <Tab value="signup">Sign Up</Tab>
              </TabList>

              <TabPanel value="login">
                <form onSubmit={handleLogin} className="space-y-5">
                  <TextInput
                    label="Email"
                    type="email"
                    placeholder="name@example.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                  />
                  <div>
                    <TextInput
                      label="Password"
                      type="password"
                      placeholder="Enter your password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                    />
                    <div className="flex justify-end mt-2">
                      <a href="#" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                        Forgot password?
                      </a>
                    </div>
                  </div>

                  {loginError && (
                    <p className="text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-md px-4 py-3">
                      {loginError}
                    </p>
                  )}

                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full mt-2 bg-accent text-primary hover:bg-accent/90 border-transparent"
                    disabled={loginLoading}
                  >
                    {loginLoading ? "Signing in..." : "Log In"}
                  </Button>
                </form>
              </TabPanel>

              <TabPanel value="signup">
                <form onSubmit={handleSignup} className="space-y-5">
                  <TextInput
                    label="Full name"
                    type="text"
                    placeholder="Jane Doe"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    required
                  />
                  <TextInput
                    label="Email"
                    type="email"
                    placeholder="name@example.com"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    required
                  />
                  <TextInput
                    label="Password"
                    type="password"
                    placeholder="At least 8 characters"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    required
                  />
                  <TextInput
                    label="Confirm password"
                    type="password"
                    placeholder="Re-enter password"
                    value={signupConfirm}
                    onChange={(e) => setSignupConfirm(e.target.value)}
                    required
                  />

                  {signupError && (
                    <p className="text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-md px-4 py-3">
                      {signupError}
                    </p>
                  )}
                  {signupSuccess && (
                    <p className="text-sm text-success bg-success/10 border border-success/30 rounded-md px-4 py-3">
                      {signupSuccess}
                    </p>
                  )}

                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full mt-2 bg-accent text-primary hover:bg-accent/90 border-transparent"
                    disabled={signupLoading}
                  >
                    {signupLoading ? "Creating account..." : "Sign Up"}
                  </Button>
                </form>
              </TabPanel>
            </Tabs>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border-subtle"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-surface px-4 text-muted-foreground">or</span>
              </div>
            </div>

            <Button variant="secondary" className="w-full flex items-center justify-center gap-3">
              <GoogleIcon />
              Continue with Google
            </Button>
          </CardBody>
        </Card>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          {activeTab === "login" ? (
            <p>
              Don't have an account?{" "}
              <button
                onClick={() => { setActiveTab("signup"); setLoginError(null); }}
                className="text-foreground hover:text-accent font-medium transition-colors"
              >
                Sign up
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{" "}
              <button
                onClick={() => { setActiveTab("login"); setSignupError(null); setSignupSuccess(null); }}
                className="text-foreground hover:text-accent font-medium transition-colors"
              >
                Log in
              </button>
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
