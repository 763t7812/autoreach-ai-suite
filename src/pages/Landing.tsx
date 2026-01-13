import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Zap,
  Globe,
  Mail,
  BarChart3,
  Shield,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import { api } from "@/lib/api";

const features = [
  {
    icon: Globe,
    title: "Smart Website Scraping",
    description:
      "Automatically discover contact emails and analyze company offerings from any website.",
  },
  {
    icon: Sparkles,
    title: "AI-Powered Personalization",
    description:
      "Generate hyper-personalized emails that resonate with each prospect's unique needs.",
  },
  {
    icon: Mail,
    title: "Multi-Provider Support",
    description:
      "Send through Gmail or Outlook with complete isolation and tracking for each.",
  },
  {
    icon: BarChart3,
    title: "Reply Detection",
    description:
      "Track opens, replies, and engagement with intelligent thread management.",
  },
];

const steps = [
  {
    number: "01",
    title: "Import Your Leads",
    description:
      "Upload via Google Sheets, Excel, or CSV. We'll automatically parse and validate your data.",
  },
  {
    number: "02",
    title: "AI Analyzes & Generates",
    description:
      "Our AI scrapes websites, understands offerings, and crafts personalized emails for each lead.",
  },
  {
    number: "03",
    title: "Review & Send",
    description:
      "Preview AI-generated emails, make edits if needed, then send via Gmail or Outlook.",
  },
];

export default function Landing() {
  const { token, setToken, setLoading } = useAuthStore();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Check URL for token from OAuth callback
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get("token");
    if (urlToken) {
      setToken(urlToken);
      window.history.replaceState({}, "", "/");
      setIsAuthenticated(true);
      setChecking(false);
      return;
    }

    // Check existing token
    const checkAuth = async () => {
      if (!token) {
        setChecking(false);
        return;
      }

      try {
        await api.get("/auth/check-scopes");
        setIsAuthenticated(true);
      } catch {
        setIsAuthenticated(false);
      } finally {
        setChecking(false);
        setLoading(false);
      }
    };

    checkAuth();
  }, [token, setToken, setLoading]);

  const handleGoogleLogin = () => {
    window.location.href = api.getOAuthUrl("gmail");
  };

  const handleOutlookLogin = () => {
    window.location.href = api.getOAuthUrl("outlook");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b bg-background/80 backdrop-blur-lg">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent">
              <Zap className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">AutoReach AI</span>
          </div>
          <div className="flex items-center gap-4">
            {checking ? (
              <div className="h-10 w-32 rounded-lg shimmer" />
            ) : isAuthenticated ? (
              <Button asChild variant="hero">
                <Link to="/dashboard">
                  Go to Dashboard
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" onClick={handleGoogleLogin}>
                  Sign In
                </Button>
                <Button variant="hero" onClick={handleGoogleLogin}>
                  Get Started
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-20">
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-1/2 -translate-x-1/2 h-[600px] w-[600px] rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute top-40 right-1/4 h-[400px] w-[400px] rounded-full bg-accent/5 blur-3xl" />
        </div>

        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-4xl text-center"
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-secondary/50 px-4 py-1.5 text-sm">
              <Sparkles className="h-4 w-4 text-primary" />
              <span>AI-Powered Cold Email Automation</span>
            </div>

            <h1 className="mb-6 text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
              Send emails that{" "}
              <span className="gradient-text">actually get replies</span>
            </h1>

            <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground sm:text-xl">
              AutoReach AI scrapes websites, discovers contacts, and generates
              hyper-personalized emails that convert. Scale your outreach without
              losing the human touch.
            </p>

            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              {checking ? (
                <div className="h-12 w-48 rounded-lg shimmer" />
              ) : isAuthenticated ? (
                <Button asChild variant="hero" size="xl">
                  <Link to="/dashboard">
                    Open Dashboard
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              ) : (
                <>
                  <Button
                    variant="hero"
                    size="xl"
                    onClick={handleGoogleLogin}
                    className="w-full sm:w-auto"
                  >
                    <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                    Sign in with Google
                  </Button>
                  <Button
                    variant="hero-outline"
                    size="xl"
                    onClick={handleOutlookLogin}
                    className="w-full sm:w-auto"
                  >
                    <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                      <path
                        d="M2 6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6Z"
                        fill="#0078D4"
                      />
                      <path
                        d="M2 6l10 7 10-7"
                        stroke="#fff"
                        strokeWidth="1.5"
                      />
                    </svg>
                    Sign in with Outlook
                  </Button>
                </>
              )}
            </div>

            <p className="mt-6 text-sm text-muted-foreground">
              No credit card required • Free tier available
            </p>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <h2 className="mb-4 text-3xl font-bold sm:text-4xl">
              How It Works
            </h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              Three simple steps to transform your cold outreach into warm
              conversations
            </p>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-3">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative rounded-2xl border bg-card p-8 shadow-card"
              >
                <div className="mb-4 text-5xl font-bold text-primary/20">
                  {step.number}
                </div>
                <h3 className="mb-2 text-xl font-semibold">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
                {index < steps.length - 1 && (
                  <ArrowRight className="absolute -right-4 top-1/2 hidden h-8 w-8 -translate-y-1/2 text-primary/30 md:block" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <h2 className="mb-4 text-3xl font-bold sm:text-4xl">
              Everything you need to scale outreach
            </h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              Powerful features designed for modern sales teams
            </p>
          </motion.div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group rounded-2xl border bg-card p-6 shadow-card transition-all hover:shadow-lg hover:-translate-y-1"
              >
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-accent p-12 text-center text-primary-foreground"
          >
            {/* Decorative circles */}
            <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-white/10" />
            <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-white/10" />

            <div className="relative z-10">
              <Shield className="mx-auto mb-6 h-16 w-16 opacity-90" />
              <h2 className="mb-4 text-3xl font-bold sm:text-4xl">
                Ready to transform your outreach?
              </h2>
              <p className="mx-auto mb-8 max-w-xl opacity-90">
                Join thousands of sales professionals who are closing more deals
                with AI-powered personalization.
              </p>
              <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                {isAuthenticated ? (
                  <Button
                    asChild
                    size="xl"
                    className="bg-white text-primary hover:bg-white/90"
                  >
                    <Link to="/dashboard">
                      Go to Dashboard
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                ) : (
                  <Button
                    size="xl"
                    className="bg-white text-primary hover:bg-white/90"
                    onClick={handleGoogleLogin}
                  >
                    Start Free Today
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                )}
              </div>
              <div className="mt-6 flex items-center justify-center gap-6 text-sm opacity-80">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="h-4 w-4" /> No credit card
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="h-4 w-4" /> Free tier included
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="h-4 w-4" /> Cancel anytime
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent">
                <Zap className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-semibold">AutoReach AI</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2026 AutoReach AI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
