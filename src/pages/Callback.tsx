import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Zap } from "lucide-react";
import { useAuthStore } from "@/store/authStore";

export default function Callback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setToken } = useAuthStore();

  useEffect(() => {
    const token = searchParams.get("token");

    if (token) {
      setToken(token);
      // Small delay for visual feedback
      setTimeout(() => {
        navigate("/dashboard", { replace: true });
      }, 500);
    } else {
      // No token, redirect to home
      navigate("/", { replace: true });
    }
  }, [searchParams, setToken, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <div className="relative mx-auto mb-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent">
            <Zap className="h-8 w-8 text-primary-foreground" />
          </div>
          <div className="absolute inset-0 animate-ping rounded-2xl bg-primary/30" />
        </div>
        <h2 className="mb-2 text-xl font-semibold">Signing you in...</h2>
        <p className="text-muted-foreground">
          Please wait while we complete authentication
        </p>
        <div className="mt-6 flex justify-center gap-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="h-2 w-2 rounded-full bg-primary"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}
