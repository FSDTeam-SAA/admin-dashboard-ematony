"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Lock } from "lucide-react";
import { toast } from "sonner";
import { AuthCard } from "@/components/auth/auth-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { resetPasswordApi } from "@/lib/api";

function ResetPasswordForm() {
  const router = useRouter();
  const params = useSearchParams();
  const email = params.get("email") ?? "";
  const otp = params.get("otp") ?? "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!email || !otp) {
      toast.error("Reset session expired. Request a new OTP.");
      router.push("/forgot-password");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      await resetPasswordApi({ email, otp, password });
      toast.success("Password reset successfully");
      router.push("/login");
    } catch (error: unknown) {
      const response = error as { response?: { data?: { message?: string } } };
      toast.error(response.response?.data?.message ?? "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="relative">
        <Lock className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-[#6e84a7]" />
        <Input
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="h-[56px] rounded-[18px] border-[#dfe7ef] bg-white pl-14 pr-14 text-[16px] text-[#083f32] placeholder:text-[#8ba0bf]"
          placeholder="Create New Password"
          required
        />
        <button
          type="button"
          onClick={() => setShowPassword((value) => !value)}
          className="absolute right-5 top-1/2 -translate-y-1/2 text-[#6e84a7]"
          aria-label="Toggle password visibility"
        >
          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </button>
      </div>

      <div className="relative">
        <Lock className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-[#6e84a7]" />
        <Input
          type={showConfirmPassword ? "text" : "password"}
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          className="h-[56px] rounded-[18px] border-[#dfe7ef] bg-white pl-14 pr-14 text-[16px] text-[#083f32] placeholder:text-[#8ba0bf]"
          placeholder="Confirm New Password"
          required
        />
        <button
          type="button"
          onClick={() => setShowConfirmPassword((value) => !value)}
          className="absolute right-5 top-1/2 -translate-y-1/2 text-[#6e84a7]"
          aria-label="Toggle confirm password visibility"
        >
          {showConfirmPassword ? (
            <EyeOff className="h-5 w-5" />
          ) : (
            <Eye className="h-5 w-5" />
          )}
        </button>
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="mt-6 h-[56px] w-full rounded-[18px] bg-[#064b39] text-[16px] font-semibold text-white hover:bg-[#053b2d]"
      >
        {loading ? "Confirming..." : "Confirm"}
      </Button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <AuthCard
      title="Reset Password"
      description="Create and confirm your new password."
      className="max-w-[610px] px-10 py-12"
    >
      <Suspense fallback={<div className="text-center text-[#6e84a7]">Loading...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </AuthCard>
  );
}
