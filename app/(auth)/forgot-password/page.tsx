"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail } from "lucide-react";
import { toast } from "sonner";
import { AuthCard } from "@/components/auth/auth-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { forgotPasswordApi } from "@/lib/api";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);

    try {
      await forgotPasswordApi({ email });
      toast.success("OTP sent to your email");
      router.push(`/verify-otp?email=${encodeURIComponent(email)}&mode=reset`);
    } catch (error: unknown) {
      const response = error as { response?: { data?: { message?: string } } };
      toast.error(response.response?.data?.message ?? "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard
      title="Forgot Password"
      description="Enter your email to receive OTP."
    >
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="relative">
          <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#7083a3]" />
          <Input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Enter your email"
            className="h-[54px] rounded-[18px] border-[#dbe3ee] bg-white pl-12 pr-4 text-[16px] text-[#083f32] shadow-none"
            required
          />
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="h-[56px] w-full rounded-[18px] bg-[#064b39] text-[18px] font-semibold text-white hover:bg-[#053d2f]"
        >
          {loading ? "Sending..." : "Send OTP"}
        </Button>
      </form>
    </AuthCard>
  );
}
