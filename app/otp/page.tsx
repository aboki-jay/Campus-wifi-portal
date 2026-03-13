"use client";

import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { ChevronLeft } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation"; 

export default function OTPVerification() {
  const router = useRouter(); 
  const searchParams = useSearchParams(); // Grabs the CUG number from the URL
  const [otp, setOtp] = useState<string[]>(new Array(6).fill(""));
  const [isError, setIsError] = useState(false);
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
    setIsError(false);
    inputRefs.current[0]?.focus(); 
    console.log("Resending new OTP code...");
  };

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
    setIsError(false);
  };

  useEffect(() => {
    const currentOtp = otp.join("");
    if (currentOtp.length === 6) {
      verifyCode(currentOtp);
    }
  }, [otp]);

  // THE NEW VERIFICATION LOGIC
  const verifyCode = async (code: string) => {
    const cug = searchParams.get("cug"); // Get the CUG from the URL
    
    const res = await fetch("/api/wifi-credentials/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cugNumber: cug, otp: code }),
    });

    const data = await res.json();

    if (!data.ok) {
      setIsError(true); // Turns the boxes red if it's wrong!
    } else {
      // SUCCESS! Save the password temporarily and kick them back to the home screen
      sessionStorage.setItem("wifi_success", JSON.stringify(data.credential));
      router.push("/");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-white relative font-sans">
      <button 
        onClick={() => router.back()}
        className="absolute top-8 left-8 flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        Go back
      </button>

      <div className="w-full max-w-md px-6 pt-32 flex flex-col items-center text-center">
        <h1 className="text-[28px] font-semibold text-gray-900 tracking-tight mb-2">
          Check your phone for a code
        </h1>
        <p className="text-[15px] text-gray-500 mb-8">
          We sent a 6-digit code to {searchParams.get("cug") || "your CUG number"}
        </p>

        <hr className="w-full border-gray-200 mb-10" />

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