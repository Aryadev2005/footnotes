import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
// import { supabase } from "@/integrations/supabase/client";
// TODO: Replace with API calls to backend server when ready
import { useAuth } from "@/hooks/useAuth";
import { useProfileSetup } from "@/hooks/useProfileSetup";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MoveRight, Mail, Lock, CheckCircle2 } from "lucide-react";

const Auth = () => {
  const { user, loading: authLoading } = useAuth();
  const { setupDone, loading: setupLoading } = useProfileSetup({ user, authLoading });
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const loading = authLoading || setupLoading;

  useEffect(() => {
    if (!loading && user) {
      if (setupDone === false) {
        navigate("/onboarding", { replace: true });
      } else if (setupDone === true) {
        navigate("/", { replace: true });
      }
    }
  }, [user, loading, setupDone, navigate]);

  const handleAuth = async (isSignUp: boolean) => {
    setSubmitting(true);
    setAuthError(null);
    setSuccessMsg(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setAuthError("Please fill in all fields.");
      setSubmitting(false);
      return;
    }
    if (password.length < 6) {
      setAuthError("Password must be at least 6 characters.");
      setSubmitting(false);
      return;
    }

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email: trimmedEmail,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        setSuccessMsg("Check your email to confirm your account!");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: trimmedEmail,
          password,
        });
        if (error) throw error;
      }
    } catch (err: any) {
      setAuthError(err?.message ?? "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col md:flex-row">
      {/* Left side: Hero Section (Desktop only) */}
      <div className="relative hidden w-1/2 flex-col bg-muted lg:flex">
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-[30s] hover:scale-110" 
          style={{ backgroundImage: "url('/auth-hero.png')" }}
        />
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
        
        <div className="relative z-10 flex h-full flex-col justify-between p-12 text-white">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-white/10 p-2 backdrop-blur-md">
              <span className="font-serif text-2xl font-bold tracking-tight">FN</span>
            </div>
            <span className="font-serif text-xl tracking-widest text-white/90">FOOTNOTES</span>
          </div>
          
          <div className="space-y-6">
            <h1 className="max-w-lg font-serif text-5xl font-medium leading-[1.1] tracking-tight">
              Every street has a story. <br /> 
              <span className="text-white/60">Capture yours.</span>
            </h1>
            <p className="max-w-md text-lg text-white/70">
              Join a community of urban explorers journaling the soul of the city, one place at a time.
            </p>
          </div>

          <div className="text-sm text-white/50">
            © 2026 FootNotes App. All rights reserved.
          </div>
        </div>
      </div>

      {/* Right side: Auth Form */}
      <div className="flex flex-1 items-center justify-center bg-background px-6 py-12 md:px-12 lg:px-24">
        <div className="w-full max-w-[400px] space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <div className="space-y-2 text-center md:text-left">
            <div className="mb-8 flex justify-center md:hidden">
              <span className="font-serif text-3xl font-bold tracking-tighter text-primary">FootNotes</span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight">Welcome to FootNotes</h2>
            <p className="text-muted-foreground">Sign in or create an account to start your journey.</p>
          </div>

          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-secondary/50 p-1">
              <TabsTrigger value="signin" className="rounded-md transition-all">Sign In</TabsTrigger>
              <TabsTrigger value="signup" className="rounded-md transition-all">Sign Up</TabsTrigger>
            </TabsList>

            <div className="mt-8 space-y-4">
              <TabsContent value="signin" className="space-y-4 outline-none">
                <form onSubmit={(e) => { e.preventDefault(); handleAuth(false); }} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email-signin" className="text-xs uppercase tracking-widest text-muted-foreground">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50" />
                      <Input
                        id="email-signin"
                        type="email"
                        placeholder="explore@example.com"
                        className="pl-10 h-11 bg-secondary/30"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="email"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password-signin" className="text-xs uppercase tracking-widest text-muted-foreground">Password</Label>
                      <button type="button" className="text-xs text-primary underline-offset-4 hover:underline">Forgot password?</button>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50" />
                      <Input
                        id="password-signin"
                        type="password"
                        placeholder="••••••••"
                        className="pl-10 h-11 bg-secondary/30"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="current-password"
                      />
                    </div>
                  </div>

                  {authError && <p className="text-sm font-medium text-destructive">{authError}</p>}
                  
                  <Button className="w-full h-11 text-sm font-semibold group" disabled={submitting}>
                    {submitting ? "Signing in..." : (
                      <span className="flex items-center gap-2">
                        Sign In <MoveRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </span>
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="space-y-4 outline-none">
                <form onSubmit={(e) => { e.preventDefault(); handleAuth(true); }} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email-signup" className="text-xs uppercase tracking-widest text-muted-foreground">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50" />
                      <Input
                        id="email-signup"
                        type="email"
                        placeholder="explore@example.com"
                        className="pl-10 h-11 bg-secondary/30"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="email"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password-signup" className="text-xs uppercase tracking-widest text-muted-foreground">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50" />
                      <Input
                        id="password-signup"
                        type="password"
                        placeholder="Create a strong password"
                        className="pl-10 h-11 bg-secondary/30"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="new-password"
                      />
                    </div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Min. 6 characters</p>
                  </div>

                  {authError && <p className="text-sm font-medium text-destructive">{authError}</p>}
                  {successMsg && (
                    <div className="flex items-center gap-2 rounded-lg bg-green-500/10 p-3 text-sm text-green-600">
                      <CheckCircle2 className="h-4 w-4" />
                      {successMsg}
                    </div>
                  )}

                  <Button className="w-full h-11 text-sm font-semibold group" disabled={submitting}>
                    {submitting ? "Creating account..." : (
                      <span className="flex items-center gap-2">
                        Create Account <MoveRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </span>
                    )}
                  </Button>
                </form>
              </TabsContent>
            </div>
          </Tabs>

          <p className="text-center text-xs text-muted-foreground leading-relaxed">
            By continuing, you agree to our <br className="md:hidden" />
            <button className="underline underline-offset-4 hover:text-foreground">Terms of Service</button> and{" "}
            <button className="underline underline-offset-4 hover:text-foreground">Privacy Policy</button>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
