"use client";

import { Suspense, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { AuthCard } from "@/components/auth/auth-card";

const OTP_LENGTH = 6;

function VerifyOtpForm() {
  const router = useRouter();
  const params = useSearchParams();
  const email = params.get("email") ?? "";
  const mode = params.get("mode") ?? "reset";
  const [digits, setDigits] = useState(Array.from({ length: OTP_LENGTH }, () => ""));
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  const otpValue = useMemo(() => digits.join(""), [digits]);

  const handleDigitChange = (index: number, value: string) => {
    const nextValue = value.replace(/\D/g, "").slice(-1);
    const nextDigits = [...digits];
    nextDigits[index] = nextValue;
    setDigits(nextDigits);

    if (nextValue && index < OTP_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLDivElement>) => {
    event.preventDefault();
    const pasted = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH);

    if (!pasted) return;

    const nextDigits = Array.from({ length: OTP_LENGTH }, (_, index) => pasted[index] ?? "");
    setDigits(nextDigits);
    inputsRef.current[Math.min(pasted.length, OTP_LENGTH) - 1]?.focus();
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (otpValue.length !== OTP_LENGTH) {
      toast.error("Enter the 6-digit code.");
      return;
    }

    if (mode === "reset") {
      router.push(
        `/reset-password?email=${encodeURIComponent(email)}&otp=${encodeURIComponent(
          otpValue
        )}`
      );
      return;
    }

    toast.error("Unsupported OTP mode");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-10">
      <div className="flex items-center justify-center gap-10" onPaste={handlePaste}>
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={(node) => {
              inputsRef.current[index] = node;
            }}
            value={digit}
            onChange={(event) => handleDigitChange(index, event.target.value)}
            onKeyDown={(event) => handleKeyDown(index, event)}
            inputMode="numeric"
            maxLength={1}
            className="h-[64px] w-[64px] rounded-[18px] border border-[#6e84a7] bg-white text-center text-[24px] font-normal text-[#6e84a7] outline-none transition focus:border-[#064b39] focus:text-[#064b39]"
            aria-label={`OTP digit ${index + 1}`}
          />
        ))}
      </div>

      <Button
        type="submit"
        className="h-[56px] w-full rounded-[18px] bg-[#064b39] text-[16px] font-semibold text-white hover:bg-[#053b2d]"
      >
        Verify Code
      </Button>
    </form>
  );
}

export default function VerifyOtpPage() {
  return (
    <AuthCard
      title="Verify Email"
      description="Enter the 6-digit code sent to your email."
      className="max-w-[610px] px-10 py-12"
    >
      <Suspense fallback={<div className="text-center text-[#6e84a7]">Loading...</div>}>
        <VerifyOtpForm />
      </Suspense>
    </AuthCard>
  );
}
