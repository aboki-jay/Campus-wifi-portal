"use client";

import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { ChevronLeft } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation"; 

export default function OTPVerification() {
  const router = useRouter(); 
  const searchParams = useSearchParams(); 
  const [otp, setOtp] = useState<string[]>(new Array(6).fill(""));
  const [errorMessage, setErrorMessage] = useState("");
  const [isLocked, setIsLocked] = useState(false); 
  const [timeLeft, setTimeLeft] = useState(59);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timerId = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timerId);
  }, [timeLeft]);

  const handleResend = () => {
    setTimeLeft(59);
    setOtp(new Array(6).fill("")); 
    setErrorMessage(""); 
    inputRefs.current[0]?.focus(); 
    console.log("Resending new OTP code...");
  };

  const handleChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return; 
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);
    setErrorMessage(""); 

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text/plain").trim();
    if (!/^\d{6}$/.test(pastedData)) return; 
    const pastedArray = pastedData.split("");
    setOtp(pastedArray);
    inputRefs.current[5]?.focus();
    setErrorMessage("");
  };

  useEffect(() => {
    const currentOtp = otp.join("");
    if (currentOtp.length === 6 && !isLocked) {
      verifyCode(currentOtp);
    }
  }, [otp, isLocked]);

  const verifyCode = async (code: string) => {
    const cug = searchParams.get("cug"); 
    
    const res = await fetch("/api/wifi-credentials/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cugNumber: cug, otp: code }),
    });

    const data = await res.json();

    if (!data.ok) {
      setErrorMessage(data.error || "Invalid code");
      if (res.status === 429) setIsLocked(true);
      if (res.status === 401) setOtp(new Array(6).fill(""));
    } else {
      sessionStorage.setItem("wifi_success", JSON.stringify(data.credential));
      router.push("/");
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center bg-white px-4 font-sans sm:px-6">
      <button 
        onClick={() => router.back()}
        className="absolute left-4 top-4 flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50 sm:left-8 sm:top-8 sm:px-4 sm:text-sm"
      >
        <ChevronLeft className="w-4 h-4" />
        Go back
      </button>

      <div className="flex w-full max-w-md flex-col items-center pt-28 text-center sm:px-4 sm:pt-32">
        <h1 className="mb-2 text-[22px] font-semibold tracking-tight text-gray-900 sm:text-[26px] md:text-[28px]">
          Check your phone for a code
        </h1>
        <p className="mb-8 text-[14px] text-gray-500 sm:text-[15px]">
          We sent a 6-digit code to {searchParams.get("cug") || "your CUG number"}
        </p>

        <hr className="w-full border-gray-200 mb-10" />

        <div className="mb-4 flex flex-wrap items-center justify-center gap-3" onPaste={handlePaste}>
          {otp.map((digit, index) => (
            <input
              key={index}
              type="text"
              inputMode="numeric"
              maxLength={1}
              disabled={isLocked}
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className={`w-10 h-12 md:w-14 md:h-14 text-center text-lg md:text-xl font-semibold rounded-xl outline-none transition-all ${
                isLocked
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed border-transparent"
                  : errorMessage
                  ? "border border-red-500 bg-red-50 text-red-500"
                  : "border border-transparent bg-gray-100 focus:bg-white focus:border-green-500 text-gray-900"
              }`}
            />
          ))}
        </div>

        <div className="h-6 mb-8 flex items-center justify-center">
          {errorMessage ? (
            <span className="text-sm text-red-500 font-medium">{errorMessage}</span>
          ) : timeLeft > 0 ? (
            <span className="text-sm text-gray-400">
              Resend code in 0:{timeLeft.toString().padStart(2, "0")}
            </span>
          ) : (
            <button 
              onClick={handleResend}
              disabled={isLocked}
              className={`text-sm font-medium transition-colors ${isLocked ? 'text-gray-300 cursor-not-allowed' : 'text-green-500 hover:text-green-600'}`}
            >
              Resend Code
            </button>
          )}
        </div>

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