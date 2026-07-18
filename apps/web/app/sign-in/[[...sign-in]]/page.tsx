"use client";

import React, { useState, useEffect } from "react";
import { useSignIn } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { Sparkles, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

export default function SignInPage() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleGoogleSignIn = async () => {
    console.log("Google Sign-In clicked. Clerk loaded:", isLoaded);
    if (!isLoaded || !signIn) {
      console.warn("Clerk not fully loaded. Falling back to dev bypass.");
      document.cookie = "dev_bypass=true; path=/; max-age=31536000";
      window.location.href = "/";
      return;
    }
    setLoading(true);
    setError("");
    try {
      await signIn.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/",
      });
    } catch (err: unknown) {
      console.error("Google Sign-In Error:", err);
      setError("Could not initiate Google sign-in. Please check your Clerk dashboard has Google OAuth enabled.");
      setLoading(false);
    }
  };

  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded || !signIn || !setActive) {
      console.warn("Clerk not fully loaded. Falling back to dev bypass.");
      document.cookie = "dev_bypass=true; path=/; max-age=31536000";
      window.location.href = "/";
      return;
    }
    setLoading(true);
    setError("");
    try {
      const result = await signIn.create({
        identifier: email,
        password,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.push("/");
      } else {
        console.error(result);
        setError("Sign in could not be completed. Please check your credentials.");
      }
    } catch (err: any) {
      console.error("Sign-in error:", err);
      setError(err.errors?.[0]?.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  const showGoogleLoading = loading;

  if (!mounted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-bg-base px-4 py-8 relative overflow-hidden">
        {/* Background glows */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />
        {/* Loading Spinner */}
        <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center animate-pulse z-10 shadow-lg shadow-violet-600/30">
          <Sparkles size={20} className="text-white animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-bg-base px-4 py-8 relative overflow-hidden">
      {/* Background glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center gap-2.5 mb-8 z-10"
      >
        <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center shadow-lg shadow-violet-600/30">
          <Sparkles size={20} className="text-white" strokeWidth={2.5} />
        </div>
        <div>
          <h1 className="text-xl font-black text-white tracking-tight">SmartSave AI</h1>
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Smart AI-Powered Wallet</p>
        </div>
      </motion.div>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="z-10 w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-8"
      >
        <h2 className="text-2xl font-bold text-white mb-1">Welcome back</h2>
        <p className="text-zinc-400 text-sm mb-8">Sign in to your SmartSave account</p>

        {/* Google Button */}
        <button
          onClick={handleGoogleSignIn}
          disabled={showGoogleLoading}
          suppressHydrationWarning
          className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-gray-900 font-semibold rounded-xl py-3 px-4 transition-all duration-200 shadow-sm"
        >
          {showGoogleLoading ? (
            <Loader2 size={18} className="animate-spin text-gray-600" />
          ) : (
            <>
              <GoogleIcon />
              Continue with Google
            </>
          )}
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-zinc-800" />
          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">or</span>
          <div className="flex-1 h-px bg-zinc-800" />
        </div>

        {/* Manual Form */}
        <form onSubmit={handleSignInSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              suppressHydrationWarning
              placeholder="name@example.com"
              className="w-full h-11 px-4 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-sm focus:outline-none focus:border-violet-600 focus:ring-1 focus:ring-violet-600 transition-colors"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              suppressHydrationWarning
              placeholder="••••••••"
              className="w-full h-11 px-4 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-sm focus:outline-none focus:border-violet-600 focus:ring-1 focus:ring-violet-600 transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl text-sm transition-all duration-200 shadow-lg shadow-violet-600/20"
          >
            {loading ? <Loader2 size={18} className="animate-spin mx-auto text-white" /> : "Sign In"}
          </button>
        </form>

        {/* Developer Bypass Button */}
        <button
          onClick={() => {
            document.cookie = "dev_bypass=true; path=/; max-age=31536000";
            window.location.href = "/";
          }}
          className="w-full mt-4 bg-zinc-850 hover:bg-zinc-800 text-zinc-300 font-medium rounded-xl py-3 px-4 transition-all duration-200 text-sm border border-zinc-800/80"
        >
          ⚡ Dev Mode: Bypass Auth & Login
        </button>

        {error && (
          <div className="mt-4 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-zinc-850" />
          <span className="text-[10px] text-zinc-600 font-semibold">secured by Clerk</span>
          <div className="flex-1 h-px bg-zinc-850" />
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-zinc-500">
          Don&apos;t have an account?{" "}
          <Link href="/sign-up" className="text-violet-400 hover:text-violet-300 font-medium transition-colors">
            Sign up
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
