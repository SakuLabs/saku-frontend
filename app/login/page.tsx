"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { TypewriterEffect } from "@/components/ui/typewriter-effect";
import { AuthShell } from "@/components/auth-shell";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, loading, error: authError } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Error", {
        description: "Please enter both email and password",
      });
      return;
    }

    try {
      const user = await login({ email, password });
      if (user) {
        toast.success("Success", {
          description: "Logged in successfully",
        });
        router.push("/tasks");
      } else {
        toast.error("Login Failed", {
          description: authError || "Invalid credentials. Please try again.",
        });
      }
    } catch (error) {
      toast.error("Login Failed", {
        description: "An unexpected error occurred",
      });
    }
  };

  return (
    <AuthShell
      heading={
        <span className="block min-h-[40px]">
          <TypewriterEffect
            words={[
              "Welcome back!", // English
              "欢迎回来!", // Chinese (Huānyíng huílái)
              "Bon retour!", // French
              "Bienvenido de nuevo!", // Spanish
              "おかえりなさい!", // Japanese (Okaerinasai)
              "Willkommen zurück!", // German
              "어서 오세요!", // Korean (Eoseo oseyo - Polite welcome)
              "Bentornato!", // Italian
              "다시 오신 것을 환영합니다!", // Korean (Dasi osin geoseul hwanyunghamnida - Formal "Welcome back")
              "Bem-vindo de volta!", // Portuguese
            ]}
          />
        </span>
      }
      subtitle="Enter your email to sign in to your account"
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-medium text-indigo-400 hover:text-indigo-300 hover:underline"
          >
            Sign up
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-white/80">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            required
            autoFocus
            autoComplete="email"
            className="h-11 border-white/10 bg-white/5 text-white transition-colors placeholder:text-white/30 focus-visible:border-indigo-500/50 focus-visible:ring-indigo-500/40"
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-white/80">
              Password
            </Label>
            <Link
              href="/forgot-password"
              className="text-sm font-medium text-indigo-400 hover:text-indigo-300 hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            required
            autoComplete="current-password"
            className="h-11 border-white/10 bg-white/5 text-white transition-colors placeholder:text-white/30 focus-visible:border-indigo-500/50 focus-visible:ring-indigo-500/40"
          />
        </div>

        <Button
          type="submit"
          className="h-11 w-full bg-indigo-600 text-white hover:bg-indigo-500"
          disabled={loading}
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Sign in
        </Button>
      </form>
    </AuthShell>
  );
}
