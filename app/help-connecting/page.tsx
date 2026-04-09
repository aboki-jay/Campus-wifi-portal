"use client";

import Link from "next/link";
import styles from "./page.module.css";

type HelpLocation = {
  label: string;
  bgClassName: string;
  textClassName: string;
};

const HELP_LOCATIONS: readonly HelpLocation[] = [
  {
    label: "1. SPORT CENTER",
    bgClassName: "bg-[#FDE9D3]",
    textClassName: "text-[#9D5608]",
  },
  {
    label: "2. SSANU",
    bgClassName: "bg-[#E1FDD3]",
    textClassName: "text-[#194703]",
  },
  {
    label: "3. COLMAS",
    bgClassName: "bg-[#E0FEF8]",
    textClassName: "text-[#046350]",
  },
  {
    label: "4. INFORMATION CENTER",
    bgClassName: "bg-[#E0FEF8]",
    textClassName: "text-[#046350]",
  },
  {
    label: "5. SUB BUILDING",
    bgClassName: "bg-[#DAD2FD]",
    textClassName: "text-[#4D26F3]",
  },
  {
    label: "6. DUFARMS",
    bgClassName: "bg-[#E5E5E5]",
    textClassName: "text-[#5B5B5B]",
  },
  {
    label: "7. COLENG",
    bgClassName: "bg-[#FDE9D3]",
    textClassName: "text-[#9D5608]",
  },
  {
    label: "8. HEALTH CENTER",
    bgClassName: "bg-[#E1FDD3]",
    textClassName: "text-[#194703]",
  },
  {
    label: "9. ICT",
    bgClassName: "bg-[#E5E5E5]",
    textClassName: "text-[#5B5B5B]",
  },
  {
    label: "10. ACADEMIC BUILDING",
    bgClassName: "bg-[#DAD2FD]",
    textClassName: "text-[#4D26F3]",
  },
  {
    label: "11. COLANIMPHASE",
    bgClassName: "bg-[#E1FDD3]",
    textClassName: "text-[#194703]",
  },
] as const;

function XIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M6 6l12 12M18 6 6 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function HelpConnectingPage() {
  return (
    <main className="min-h-screen bg-white px-4 pb-16 pt-4 sm:px-6 sm:pt-6 md:px-8 md:pt-8">
      <div className="mx-auto flex w-full max-w-[1040px] justify-end">
        <Link
          href="/"
          className="inline-flex items-center gap-1 rounded-[8px] border border-[#D9D9D9] bg-[#F5F5F5] py-[2px] pl-[6px] pr-[8px] text-[13px] font-medium leading-[18px] text-black transition-colors hover:bg-[#EBEBEB]"
        >
          <XIcon className="size-5" />
          Close
        </Link>
      </div>

      <div className="mx-auto mt-8 flex w-full max-w-[800px] flex-col items-center gap-6 sm:mt-12 md:mt-16">
        <div className="w-full overflow-hidden rounded-[24px]">
          <div
            role="img"
            aria-label="Illustration showing how to connect devices"
            className={`${styles.heroImage} h-[180px] w-full bg-cover bg-center bg-no-repeat sm:h-[240px] md:h-[291px]`}
          />
        </div>

        <div className="flex w-full max-w-[739px] flex-col items-center gap-7 text-center sm:gap-8 md:gap-[26px]">
          <h1 className="text-[32px] font-bold leading-[1.1] text-black sm:text-[36px] md:text-[28px] md:leading-8">
            Need Help connecting?
          </h1>

          <div className="flex w-full flex-col items-center gap-10 sm:gap-11 md:gap-[41px]">
            <div className="flex w-full flex-col items-center gap-6">
              <p className="max-w-[680px] text-[16px] leading-7 text-[#757575] sm:text-[18px] sm:leading-8">
                <span>Step 1:</span>
                <span className="text-[#1E1E1E]">
                  {" "}
                  Connect your device once you&apos;re around these locations
                </span>
              </p>

              <div className="flex w-full max-w-[760px] flex-wrap justify-center gap-3 sm:gap-4 md:gap-6">
                {HELP_LOCATIONS.map((location) => (
                  <span
                    key={location.label}
                    className={`inline-flex rounded-[999px] px-4 py-[6px] text-[16px] font-medium leading-6 sm:text-[18px] ${location.bgClassName} ${location.textClassName}`}
                  >
                    {location.label}
                  </span>
                ))}
              </div>
            </div>

            <div className="max-w-[720px] text-[16px] leading-8 text-[#1E1E1E] sm:text-[18px]">
              <p>
                <span className="text-[#757575]">Step 2:</span>
                <span>{` Connect to SSID : `}</span>
                <span className="font-medium">NCC-FUNAABWIFI-2023</span>
              </p>
              <p>
                <span>Use the password : </span>
                <span className="font-medium">12345678</span>
              </p>
              <p>This will redirect you to the Dodopho login page</p>
              <p>Enter your CUG number and your password to access the free internet</p>
              <p>
                <span>e.g Username: </span>
                <span className="font-medium">9012345678</span>
                <span>{`; Password: `}</span>
                <span className="font-medium">DoDphO138</span>
              </p>
            </div>
          </div>

          <div className="max-w-[560px] text-[16px] leading-8 text-[#1E1E1E] sm:text-[18px]">
            <p className="text-[#1E1E1E]">
              For further assistance, kindly contact our support team on
            </p>
            <p className="font-medium">( 09152444443 )</p>
          </div>
        </div>
      </div>
    </main>
  );
}
