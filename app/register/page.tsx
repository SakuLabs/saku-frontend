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

import { AuthShell } from "@/components/auth-shell";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { register, loading, error: authError } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !password) {
      toast.error("Error", {
        description: "Please fill in all fields",
      });
      return;
    }

    try {
      const user = await register({ name, email, password });
      if (user) {
        toast.success("Success", {
          description: "Account created successfully",
        });
        router.push("/tasks");
      } else {
        toast.error("Registration Failed", {
          description: authError || "Could not create account. Please try again.",
        });
      }
    } catch (error) {
      toast.error("Registration Failed", {
        description: "An unexpected error occurred",
      });
    }
  };

  return (
    <AuthShell
      heading="Create an account"
      subtitle="Enter your details below to create your account"
      footer={
        <>
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-indigo-400 hover:text-indigo-300 hover:underline"
          >
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-white/80">
            Name
          </Label>
          <Input
            id="name"
            placeholder="John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
            required
            autoFocus
            autoComplete="name"
            className="h-11 border-white/10 bg-white/5 text-white transition-colors placeholder:text-white/30 focus-visible:border-indigo-500/50 focus-visible:ring-indigo-500/40"
          />
        </div>
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
            autoComplete="email"
            className="h-11 border-white/10 bg-white/5 text-white transition-colors placeholder:text-white/30 focus-visible:border-indigo-500/50 focus-visible:ring-indigo-500/40"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password" className="text-white/80">
            Password
          </Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            required
            autoComplete="new-password"
            className="h-11 border-white/10 bg-white/5 text-white transition-colors placeholder:text-white/30 focus-visible:border-indigo-500/50 focus-visible:ring-indigo-500/40"
          />
        </div>

        <Button
          type="submit"
          className="h-11 w-full bg-indigo-600 text-white hover:bg-indigo-500"
          disabled={loading}
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Create account
        </Button>
      </form>
    </AuthShell>
  );
}
