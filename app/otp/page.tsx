"use client";

import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation"; // 1. Added Next.js Router

export default function OTPVerification() {
  const router = useRouter(); // Initialize the router
  const [otp, setOtp] = useState<string[]>(new Array(6).fill(""));
  const [isError, setIsError] = useState(false);
  const [timeLeft, setTimeLeft] = useState(59);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // 59-second Countdown Timer
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timerId = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timerId);
  }, [timeLeft]);

  // Handle Resend Click
  const handleResend = () => {
    setTimeLeft(59); // Reset timer
    setOtp(new Array(6).fill("")); // Clear inputs
    setIsError(false); // Clear errors
    inputRefs.current[0]?.focus(); // Focus back on the first box
    // TODO: Add the actual Supabase "send new OTP" function here later
    console.log("Resending new OTP code...");
  };

  // Handle typing numbers
  const handleChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return; 

    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);
    setIsError(false); 

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle Backspace
  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Handle Pasting a full 6-digit code
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text/plain").trim();
    if (!/^\d{6}$/.test(pastedData)) return; 

    const pastedArray = pastedData.split("");
    setOtp(pastedArray);
    inputRefs.current[5]?.focus();
    setIsError(false);
  };

  // Auto-Submit when 6 digits are entered
  useEffect(() => {
    const currentOtp = otp.join("");
    if (currentOtp.length === 6) {
      verifyCode(currentOtp);
    }
  }, [otp]);

  // Mock Verification Function
  const verifyCode = (code: string) => {
    console.log("Verifying code:", code);
    
    if (code === "123456") {
      setIsError(true);
    } else {
      alert("Success! Code verified.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-white relative font-sans">
      {/* Go Back Button - Now actually goes back! */}
      <button 
        onClick={() => router.back()}
        className="absolute top-8 left-8 flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        Go back
      </button>

      {/* Main Content */}
      <div className="w-full max-w-md px-6 pt-32 flex flex-col items-center text-center">
        <h1 className="text-[28px] font-semibold text-gray-900 tracking-tight mb-2">
          Check your phone for a code
        </h1>
        <p className="text-[15px] text-gray-500 mb-8">
          We sent a 6-digit code to your CUG number
        </p>

        <hr className="w-full border-gray-200 mb-10" />

        {/* OTP Input Boxes */}
        <div className="flex gap-3 mb-4" onPaste={handlePaste}>
          {otp.map((digit, index) => (
            <input
              key={index}
              type="text"
              inputMode="numeric"
              maxLength={1}
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className={`w-14 h-14 text-center text-xl font-semibold rounded-xl outline-none transition-all ${
                isError
                  ? "border border-red-500 bg-red-50 text-red-500"
                  : "border border-transparent bg-gray-100 focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-500/10 text-gray-900"
              }`}
            />
          ))}
        </div>

        {/* Dynamic Subtext: Error, Timer, or Resend Button */}
        <div className="h-6 mb-8 flex items-center justify-center">
          {isError ? (
            <span className="text-sm text-red-500 font-medium">Invalid code</span>
          ) : timeLeft > 0 ? (
            <span className="text-sm text-gray-400">
              Resend code in 0:{timeLeft.toString().padStart(2, "0")}
            </span>
          ) : (
            <button 
              onClick={handleResend}
              className="text-sm font-medium text-green-500 hover:text-green-600 transition-colors"
            >
              Resend Code
            </button>
          )}
        </div>

        {/* Bottom Link - Now routes back to home! */}
        <p className="text-[15px] text-gray-500">
          Can't access your code?{" "}
          <button 
            onClick={() => router.push("/")}
            className="text-green-500 font-medium hover:text-green-600 transition-colors"
          >
            Change number
          </button>
        </p>
      </div>
    </div>
  );
}