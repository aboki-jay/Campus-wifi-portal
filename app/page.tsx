"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Wifi } from "@/components/ui/wifi";

type CredentialStatus = "unclaimed" | "claimed" | string;

type LookupCredential = {
  cug_number: string;
  full_name: string;
  department: string;
  college: string;
  level: string;
  matric_number: string;
  status: CredentialStatus;
};

type ClaimedCredential = LookupCredential & { password: string };

type UiState =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "notFound" }
  | { kind: "alreadyClaimed" }
  | { kind: "verify"; credential: LookupCredential }
  | { kind: "success"; credential: ClaimedCredential };

type Hotspot = {
  label: string;
  widthClassName: string;
  desktopClassName: string;
  tailClassName: string;
};

type ConnectLocation = {
  label: string;
  bgClassName: string;
  textClassName: string;
  positionClassName: string;
};

const ASSETS = {
  logo: "/8c61e5aa887dac818254a63f90dcea65973a45ac.png",
  wifi: "/81d89fdb093acc3c15c1c14ed6692e3af4c156d3.png",
  notFound: "/38df8bc5a73ab2364418df1e7050401784a0fca5.png",
  alreadyClaimed: "/641085efe6785d884e8639682858244205e8cfb5.png",
} as const;

const HOTSPOTS: readonly Hotspot[] = [
  {
    label: "FUNAAB-DUFARMS",
    widthClassName: "w-[196px]",
    desktopClassName: "left-[10%] top-[13.5%] -rotate-[22deg]",
    tailClassName: "left-[28px]",
  },
  {
    label: "SUG AP RADIO",
    widthClassName: "w-[233px]",
    desktopClassName: "left-1/2 top-[11%] -translate-x-1/2",
    tailClassName: "left-[88px]",
  },
  {
    label: "FUNAABACADEMICB2",
    widthClassName: "w-[210px]",
    desktopClassName: "right-[10.5%] top-[14.5%] rotate-[20deg]",
    tailClassName: "right-[24px]",
  },
  {
    label: "FUNAABCOLMAS",
    widthClassName: "w-[233px]",
    desktopClassName: "left-[7%] top-[50%]",
    tailClassName: "right-[34px]",
  },
  {
    label: "FUNAAB-ENGINEERING",
    widthClassName: "w-[192px]",
    desktopClassName: "right-[12.5%] top-[39.5%] rotate-[7deg]",
    tailClassName: "left-[42px]",
  },
  {
    label: "COLANIMPHASE2",
    widthClassName: "w-[210px]",
    desktopClassName: "left-1/2 top-[72.5%] -translate-x-1/2 -rotate-[1.5deg]",
    tailClassName: "right-[30px]",
  },
] as const;

const CONNECT_LOCATIONS: readonly ConnectLocation[] = [
  {
    label: "1. SPORT CENTER",
    bgClassName: "bg-[#FDE9D3]",
    textClassName: "text-[#9D5608]",
    positionClassName: "left-[5.5%] top-[9%]",
  },
  {
    label: "2. SSANU",
    bgClassName: "bg-[#E1FDD3]",
    textClassName: "text-[#194703]",
    positionClassName: "left-[44%] top-[8.5%]",
  },
  {
    label: "9. ICT",
    bgClassName: "bg-[#E5E5E5]",
    textClassName: "text-[#5B5B5B]",
    positionClassName: "right-[14%] top-[9%]",
  },
  {
    label: "8. HEALTH CENTER",
    bgClassName: "bg-[#E1FDD3]",
    textClassName: "text-[#194703]",
    positionClassName: "left-[14.5%] top-[28%]",
  },
  {
    label: "4. INFORMATION CENTER",
    bgClassName: "bg-[#E0FEF8]",
    textClassName: "text-[#046350]",
    positionClassName: "right-[9%] top-[28%]",
  },
  {
    label: "3. COLMAS",
    bgClassName: "bg-[#E0FEF8]",
    textClassName: "text-[#046350]",
    positionClassName: "left-[9.5%] top-[46%]",
  },
  {
    label: "5. SUB BUILDING",
    bgClassName: "bg-[#DAD2FD]",
    textClassName: "text-[#4D26F3]",
    positionClassName: "left-[39%] top-[46%]",
  },
  {
    label: "7. COLENG",
    bgClassName: "bg-[#FDE9D3]",
    textClassName: "text-[#9D5608]",
    positionClassName: "left-[41.5%] top-[58%]",
  },
  {
    label: "6. DUFARMS",
    bgClassName: "bg-[#E5E5E5]",
    textClassName: "text-[#5B5B5B]",
    positionClassName: "right-[8.5%] top-[58%]",
  },
  {
    label: "11. COLANIMPHASE",
    bgClassName: "bg-[#E1FDD3]",
    textClassName: "text-[#194703]",
    positionClassName: "bottom-[46px] left-[5.5%]",
  },
  {
    label: "10. ACADEMIC BUILDING",
    bgClassName: "bg-[#DAD2FD]",
    textClassName: "text-[#4D26F3]",
    positionClassName: "bottom-[46px] right-[3.5%]",
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

function InfoIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" fill="currentColor" />
      <path
        d="M12 10.1v6M12 7.55h.01"
        stroke="#FFFFFF"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CautionIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" fill="currentColor" />
      <path
        d="M12 6.75v7M12 17h.01"
        stroke="#FFFFFF"
        strokeWidth="1.9"
        strokeLinecap="round"
      />
    </svg>
  );
}

function HotspotIcon() {
  return (
    <svg
      className="size-4"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" fill="#FFD76C" />
      <path
        d="M12 6.75a3.75 3.75 0 0 0-3.75 3.75c0 2.78 3.75 6.75 3.75 6.75s3.75-3.97 3.75-6.75A3.75 3.75 0 0 0 12 6.75Zm0 5.25a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Z"
        fill="#F4B400"
      />
    </svg>
  );
}

function Spinner() {
  return (
    <div className="relative size-11">
      <div className="absolute inset-0 rounded-full border-[3px] border-[#E6F6EC]" />
      <div className="absolute inset-0 animate-spin rounded-full border-[3px] border-transparent border-t-[#33CB63]" />
    </div>
  );
}

function LoadingOverlay() {
  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-white">
      <div className="flex flex-col items-center gap-4">
        <Spinner />
        <div className="px-2 text-center">
          <p className="text-[24px] font-bold leading-normal text-[#02542D]">
            Checking the system
          </p>
          <p className="mt-[17px] max-w-[583px] text-[16px] font-medium leading-normal text-[#757575]">
            We&apos;re checking our system for your internet credentials
            <br />
            please be patient..
          </p>
        </div>
      </div>
    </div>
  );
}

function CloseChip({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="fixed right-4 top-4 z-40 flex items-center gap-1 rounded-[8px] border border-[#D9D9D9] bg-[#F5F5F5] py-[4px] pl-[6px] pr-[8px] text-[13px] font-medium leading-[18px] text-black md:absolute md:right-[200px] md:top-[106px] md:text-[14px]"
    >
      <XIcon className="size-6" />
      Close
    </button>
  );
}

function ModalShell({
  tone,
  onClose,
  children,
}: {
  tone: "neutral" | "warning";
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4">
      <div className="w-[631px] max-w-[calc(100vw-32px)] overflow-hidden rounded-[16px] border border-black/10 bg-white">
        <div
          className={[
            "flex items-center justify-end border-b px-4 py-4",
            tone === "warning"
              ? "border-[#BF6A02] bg-[#FFF1C2]"
              : "border-[#D9D9D9] bg-[#F5F5F5]",
          ].join(" ")}
        >
          <button
            type="button"
            onClick={onClose}
            className="grid size-6 place-items-center text-black/70 hover:text-black"
            aria-label="Close"
          >
            <XIcon className="size-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function HowToConnectModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4">
      <div className="w-[633px] max-w-[calc(100vw-32px)] overflow-hidden rounded-[24px] border border-[#B2B2B2] bg-white shadow-[0_24px_60px_rgba(0,0,0,0.18)]">
        <div className="flex items-start justify-between px-6 pb-4 pt-6 sm:px-8">
          <div className="space-y-1">
            <h2 className="text-[24px] font-medium leading-7 text-[#1E1E1E]">
              How to connect
            </h2>
            <p className="text-[14px] leading-[14px] text-[#757575]">
              This is a step-by-step process on how to connect to our free wifi
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="grid size-8 shrink-0 place-items-center rounded-full bg-[#F5F5F5] text-[#757575] transition-colors hover:text-[#1E1E1E]"
            aria-label="Close"
          >
            <XIcon className="size-[18px]" />
          </button>
        </div>

        <div className="px-3 pb-3 sm:px-3">
          <div className="relative h-[300px] rounded-[16px] bg-[#F9F9F9] px-6 pb-3 pt-[18px]">
            {CONNECT_LOCATIONS.map((location) => (
              <span
                key={location.label}
                className={`absolute inline-flex rounded-[999px] px-4 py-[7px] text-[16px] font-medium leading-6 sm:text-[18px] ${location.bgClassName} ${location.textClassName} ${location.positionClassName}`}
              >
                {location.label}
              </span>
            ))}

            <p className="absolute bottom-3 left-6 text-[18px] font-medium leading-7 text-[#757575]">
              Places to connect to our free wifi
            </p>
          </div>
        </div>

        <div className="overflow-hidden rounded-[24px] bg-white">
          <div className="bg-[#FBFBFB] px-6 py-4 sm:px-8">
            <p className="text-[18px] leading-7 text-[#1E1E1E]">
              <span className="font-medium text-[#B3B3B3]">Step 1: </span>
              <span className="font-medium">
                Connect to SSID : NCC-FUNAABWIFI-2023
              </span>
            </p>
            <p className="text-[18px] leading-7 text-[#1E1E1E]">
              <span className="font-medium">Use the password : </span>12345678
            </p>
          </div>

          <div className="bg-[#FBFBFB] px-6 py-4 sm:px-8">
            <p className="text-[18px] leading-7 text-[#1E1E1E]">
              <span className="font-medium text-[#B3B3B3]">Step 2: </span>
              <span className="font-medium">
                This will redirect you to the Dodopho login page
              </span>
            </p>
            <p className="text-[18px] font-medium leading-7 text-[#1E1E1E]">
              Enter your CUG number and your password to access the free
              internet
            </p>
          </div>

          <div className="flex items-start gap-2 bg-[#FFF1C2] px-6 py-2 sm:px-8">
            <CautionIcon className="mt-[2px] size-5 shrink-0 text-[#7A3D00]" />
            <p className="text-[16px] leading-7 text-[#401B01] sm:text-[18px]">
              Please when typing your CUG number. It should start without the
              initial digit e.g 9012345678
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function NotFoundModal({ onClose }: { onClose: () => void }) {
  return (
    <ModalShell tone="warning" onClose={onClose}>
      <div className="flex flex-col gap-4 p-5">
        <div className="relative h-[259px] w-[591px] max-w-full overflow-hidden">
          <div className="pointer-events-none absolute left-[168px] top-[-64px] h-[387px] w-[580px]">
            <Image
              src={ASSETS.notFound}
              alt=""
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 591px"
            />
          </div>
          <p className="absolute left-6 top-[92px] w-[253px] text-[32px] font-bold leading-[38px] text-[#1E1E1E]">
            CUG number not found.
          </p>
          <p className="absolute left-6 top-[174px] w-[288px] text-[16px] text-[#757575]">
            Please check your spelling or visit our office behind floral
            building at SUB.
          </p>
        </div>
      </div>
    </ModalShell>
  );
}

function AlreadyClaimedModal({ onClose }: { onClose: () => void }) {
  return (
    <ModalShell tone="neutral" onClose={onClose}>
      <div className="relative w-full max-w-[591px] overflow-hidden p-6 sm:p-8">
        <div className="pointer-events-none absolute right-[-40px] top-[-20px] z-0 size-[250px] opacity-20 sm:size-[372px] sm:opacity-100">
          <Image
            src={ASSETS.alreadyClaimed}
            alt=""
            fill
            className="object-contain sm:object-cover"
            sizes="(max-width: 640px) 250px, 372px"
          />
        </div>
        <div className="relative z-10 flex w-full flex-col gap-6 pb-4 pt-10 sm:w-[60%]">
          <h2 className="text-[28px] font-bold leading-tight text-[#1E1E1E] sm:text-[32px]">
            Credentials Already Claimed.
          </h2>
          <p className="text-[14px] leading-[1.546] text-[#757575] sm:text-[16px]">
            Your password has been claimed already. Kindly visit our office
            behind floral building at SUB.
          </p>
        </div>
      </div>
    </ModalShell>
  );
}

function PasswordClaimedToast({ onClose }: { onClose: () => void }) {
  return (
    <div className="pointer-events-none fixed inset-x-0 top-6 z-50 flex justify-center">
      <div className="pointer-events-auto flex w-[550px] max-w-full flex-col overflow-hidden rounded-[16px] border border-[#D9D9D9] bg-white shadow-md">
        <div className="flex items-center justify-between border-b border-[#D9D9D9] px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="grid size-8 place-items-center rounded-full bg-[#F5F5F5] text-[#1E1E1E]">
              <svg
                className="size-4"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="9"
                  stroke="currentColor"
                  strokeWidth="1.6"
                />
                <path
                  d="M9.5 12.5l2 2.5 3-4"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <p className="text-[16px] font-medium text-[#1E1E1E]">
              Password claimed
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid size-6 place-items-center text-[#757575] hover:text-black"
            aria-label="Dismiss"
          >
            <XIcon className="size-5" />
          </button>
        </div>
        <div className="px-4 py-3 text-[14px] text-[#1E1E1E]">
          Keep this password secure.
        </div>
      </div>
    </div>
  );
}

function HotspotBadge({
  label,
  widthClassName,
  className = "",
  tailClassName,
}: {
  label: string;
  widthClassName: string;
  className?: string;
  tailClassName: string;
}) {
  return (
    <div className={className}>
      <div
        className={`relative flex h-[57px] ${widthClassName} items-center gap-[4px] rounded-full border border-black/[0.06] bg-white pl-[8px] pr-[16px] shadow-[0px_5px_11px_rgba(0,0,0,0.1),0px_20px_20px_rgba(0,0,0,0.09),0px_46px_27px_rgba(0,0,0,0.05),0px_81px_32px_rgba(0,0,0,0.01),0px_127px_35px_rgba(0,0,0,0)]`}
      >
        <span
          className={`pointer-events-none absolute bottom-[-8px] ${tailClassName} size-[18px] rotate-45 rounded-[0_0_8px_0] border-b border-r border-black/[0.06] bg-white`}
        />
        <div className="relative z-10 grid size-7 shrink-0 place-items-center rounded-full bg-[#FFF2C9]">
          <HotspotIcon />
        </div>
        <span className="relative z-10 truncate text-[11.5px] font-medium tracking-[-0.12px] text-[#1E1E1E]">
          {label}
        </span>
      </div>
    </div>
  );
}

function LandingView({
  cugNumber,
  canSubmit,
  onCugChange,
  onSubmit,
  onShowGuide,
}: {
  cugNumber: string;
  canSubmit: boolean;
  onCugChange: (value: string) => void;
  onSubmit: () => void;
  onShowGuide: () => void;
}) {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[1200px] flex-col items-center overflow-hidden px-5 pb-16 pt-[26px] sm:px-6 md:px-8">
      <div className="relative h-[84px] w-[164px] sm:h-[110px] sm:w-[182px] md:h-[150px] md:w-[212px]">
        <Image
          src={ASSETS.logo}
          alt="Dodopho Consultancy"
          fill
          className="object-contain"
          sizes="(max-width: 640px) 164px, (max-width: 768px) 182px, 212px"
          priority
        />
      </div>

      <section className="mt-[18px] flex w-full max-w-[682px] flex-col items-center text-center md:mt-[34px]">
        <h1 className="max-w-[682px] text-[46px] font-medium leading-[0.96] tracking-[-0.06em] text-black sm:text-[54px] md:text-[64px] md:leading-[72px]">
          <span className="text-[#757575]">Get Your Campus</span>
          <br />
          <span className="text-black">Wi-Fi Credentials.</span>
        </h1>

        <p className="mt-4 max-w-[474px] text-[16px] leading-[1.22] text-[#5A5A5A] sm:text-[18px] md:mt-2 md:text-[18px] md:leading-[22px]">
          Enter your CUG number below to retrieve your personal internet
          password and access locations.
        </p>
      </section>

      <section className="mt-9 flex w-full max-w-[466px] flex-col items-center gap-4 md:mt-11">
        <div className="w-full rounded-[8px] bg-[#EDEEF2]">
          <input
            value={cugNumber}
            onChange={(event) => onCugChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && canSubmit) {
                onSubmit();
              }
            }}
            placeholder="Enter your CUG number e.g 7012345678"
            className="h-12 w-full rounded-[8px] bg-transparent px-4 text-[14px] leading-5 text-[#1E1E1E] outline-none placeholder:text-[#64748B]"
            inputMode="numeric"
            autoComplete="off"
          />
        </div>

        <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
          <button
            type="button"
            onClick={onSubmit}
            disabled={!canSubmit}
            className="h-11 rounded-[8px] bg-[#33CB63] px-4 text-[14px] font-medium text-white transition-colors hover:bg-[#28ba58] disabled:cursor-not-allowed disabled:opacity-60"
          >
            Claim password
          </button>

          <button
            type="button"
            onClick={onShowGuide}
            className="h-11 rounded-[8px] bg-[#F0F2FA] px-4 text-[14px] font-medium text-[#1E1E1E] transition-colors hover:bg-[#e8ebf6]"
          >
            How to connect
          </button>
        </div>

        <div className="flex items-center gap-2 text-center text-[#975102]">
          <InfoIcon className="size-5 shrink-0" />
          <p className="text-[14px] leading-5">
            This benefit is only accessible to CUG numbers
          </p>
        </div>
      </section>

      <section className="mt-[60px] flex w-full max-w-[1040px] flex-col items-center sm:mt-[80px] md:mt-[92px]">
        <div className="relative h-[290px] w-full max-w-[1040px] sm:h-[420px] md:h-[544px]">
          <Image
            src={ASSETS.wifi}
            alt=""
            fill
            className="object-contain"
            sizes="(max-width: 640px) 100vw, 1040px"
            priority
          />

          <div className="absolute inset-0 hidden sm:block">
            {HOTSPOTS.map((hotspot) => (
              <HotspotBadge
                key={hotspot.label}
                label={hotspot.label}
                widthClassName={hotspot.widthClassName}
                className={`absolute ${hotspot.desktopClassName}`}
                tailClassName={hotspot.tailClassName}
              />
            ))}
          </div>
        </div>

        <div className="mt-6 flex w-full max-w-[640px] flex-wrap justify-center gap-3 sm:hidden">
          {HOTSPOTS.map((hotspot) => (
            <HotspotBadge
              key={hotspot.label}
              label={hotspot.label}
              widthClassName={hotspot.widthClassName}
              tailClassName="right-[26px]"
            />
          ))}
        </div>
      </section>
    </div>
  );
}

export default function Home() {
  const router = useRouter();
  const [cugNumber, setCugNumber] = useState("");
  const [ui, setUi] = useState<UiState>(() => {
    if (typeof window === "undefined") {
      return { kind: "idle" };
    }

    const savedSuccess = sessionStorage.getItem("wifi_success");

    if (!savedSuccess) {
      return { kind: "idle" };
    }

    sessionStorage.removeItem("wifi_success");

    return {
      kind: "verify",
      credential: JSON.parse(savedSuccess) as LookupCredential,
    };
  });
  const [copied, setCopied] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  const canSubmit = cugNumber.trim().length > 0;

  async function lookup() {
    const cug = cugNumber.trim();

    if (!cug) {
      return;
    }

    setUi({ kind: "loading" });
    const res = await fetch("/api/wifi-credentials/lookup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cugNumber: cug }),
    });

    if (res.status === 404) {
      setUi({ kind: "notFound" });
      return;
    }

    if (res.status === 409) {
      setUi({ kind: "alreadyClaimed" });
      return;
    }

    const body = await res.json().catch(() => null);

    if (body?.ok && body?.requires_otp) {
      router.push(`/otp?cug=${body.cugNumber}`);
      return;
    }

    if (!res.ok || !body || !("ok" in body) || body.ok !== true) {
      setUi({ kind: "notFound" });
      return;
    }

    if (body.credential.status === "claimed") {
      setUi({ kind: "alreadyClaimed" });
      return;
    }

    setUi({ kind: "verify", credential: body.credential });
  }

  async function claim() {
    if (ui.kind !== "verify") {
      return;
    }

    setUi({ kind: "loading" });
    const res = await fetch("/api/wifi-credentials/claim", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cugNumber: ui.credential.cug_number }),
    });

    if (res.status === 404) {
      setUi({ kind: "notFound" });
      return;
    }

    if (res.status === 409) {
      setUi({ kind: "alreadyClaimed" });
      return;
    }

    const body = (await res.json().catch(() => null)) as
      | { ok: true; credential: ClaimedCredential }
      | { ok: false; error: string }
      | null;

    if (!res.ok || !body || !("ok" in body) || body.ok !== true) {
      setUi({ kind: "notFound" });
      return;
    }

    setUi({ kind: "success", credential: body.credential });
  }

  const showBaseLayout =
    ui.kind === "idle" || ui.kind === "notFound" || ui.kind === "alreadyClaimed";

  return (
    <div className="relative min-h-screen bg-white">
      {ui.kind === "loading" && <LoadingOverlay />}

      {showBaseLayout && (
        <LandingView
          cugNumber={cugNumber}
          canSubmit={canSubmit}
          onCugChange={setCugNumber}
          onSubmit={lookup}
          onShowGuide={() => setShowGuide(true)}
        />
      )}

      {showGuide && <HowToConnectModal onClose={() => setShowGuide(false)} />}
      {ui.kind === "notFound" && (
        <NotFoundModal onClose={() => setUi({ kind: "idle" })} />
      )}
      {ui.kind === "alreadyClaimed" && (
        <AlreadyClaimedModal onClose={() => setUi({ kind: "idle" })} />
      )}

      {(ui.kind === "verify" || ui.kind === "success") && (
        <div className="flex min-h-screen flex-col items-center justify-center px-4 py-20">
          <CloseChip onClick={() => setUi({ kind: "idle" })} />

          <div className="mx-auto w-full max-w-[430px]">
            <div className="flex flex-col items-center gap-8">
              <div className="w-full">
                <div className="flex flex-col items-center gap-6">
                  <div className="flex flex-col items-center gap-4 text-center">
                    <div className="grid size-11 place-items-center rounded-full bg-[#F5F5F5] text-[#757575]">
                      <Wifi className="size-6" />
                    </div>
                    <div>
                      <p className="text-[24px] font-medium leading-9 text-[#1E1E1E]">
                        Your Internet Credential
                      </p>
                      <p className="mt-2 text-[14px] leading-4 text-[#757575]">
                        Stay connected each time you&apos;re around these areas.
                      </p>
                    </div>
                  </div>

                  <div className="h-px w-full bg-black/10" />

                  <div className="w-full space-y-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-2">
                        <div className="grid size-11 place-items-center rounded-full bg-[#F5F5F5] text-[#B3B3B3]">
                          <svg
                            className="size-6"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.6"
                          >
                            <path d="M12 12a4.5 4.5 0 100-9 4.5 4.5 0 000 9Z" />
                            <path
                              d="M4 21a8 8 0 0116 0"
                              strokeLinecap="round"
                            />
                          </svg>
                        </div>
                        <p className="text-[13px] font-medium text-[#B3B3B3] sm:text-[14px]">
                          Name
                        </p>
                      </div>
                      <p className="text-[15px] font-bold text-[#5A5A5A] sm:text-[16px]">
                        {ui.credential.full_name}
                      </p>
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-2">
                        <div className="grid size-11 place-items-center rounded-full bg-[#F5F5F5] text-[#B3B3B3]">
                          <svg
                            className="size-6"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.6"
                          >
                            <path
                              d="M7 20v-7a5 5 0 0110 0v7"
                              strokeLinecap="round"
                            />
                            <path d="M9 4h6" strokeLinecap="round" />
                          </svg>
                        </div>
                        <p className="text-[13px] font-medium text-[#B3B3B3] sm:text-[14px]">
                          Department
                        </p>
                      </div>
                      <p className="text-[15px] font-bold text-[#5A5A5A] sm:text-[16px]">
                        {ui.credential.department}
                      </p>
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-2">
                        <div className="grid size-11 place-items-center rounded-full bg-[#F5F5F5] text-[#B3B3B3]">
                          <svg
                            className="size-6"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.6"
                          >
                            <path d="M17 10h-1V8a4 4 0 10-8 0v2H7a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2Z" />
                          </svg>
                        </div>
                        <p className="text-[13px] font-medium text-[#B3B3B3] sm:text-[14px]">
                          Your Internet password
                        </p>
                      </div>

                      {ui.kind === "verify" ? (
                        <p className="text-[15px] font-bold text-[#5A5A5A] sm:text-[16px]">
                          ******************
                        </p>
                      ) : (
                        <div className="flex items-center gap-2">
                          <p className="text-[15px] font-bold text-[#5A5A5A] sm:text-[16px]">
                            {ui.credential.password}
                          </p>
                          <button
                            type="button"
                            onClick={async () => {
                              await navigator.clipboard.writeText(
                                ui.credential.password,
                              );
                              setCopied(true);
                              window.setTimeout(() => setCopied(false), 2500);
                            }}
                            className="grid size-6 place-items-center text-[#757575] hover:text-black"
                            aria-label="Copy password"
                          >
                            <svg
                              className="size-5"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.6"
                            >
                              <path d="M9 9h10v12H9V9Z" />
                              <path
                                d="M5 15H4a1 1 0 01-1-1V4a1 1 0 011-1h10a1 1 0 011 1v1"
                                strokeLinecap="round"
                              />
                            </svg>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={ui.kind === "verify" ? claim : () => setUi({ kind: "idle" })}
                className="h-[48px] w-full rounded-[8px] bg-[#33CB63] text-[14px] font-medium text-white transition-all hover:bg-[#2bb356]"
              >
                {ui.kind === "verify" ? "Claim password" : "Done"}
              </button>
            </div>

            <p className="mt-6 text-center text-[13px] font-medium text-[#757575] sm:text-[14px]">
              {ui.kind === "verify"
                ? "To access your password click on the button"
                : "Keep this password secure."}
            </p>
          </div>
        </div>
      )}

      {copied && <PasswordClaimedToast onClose={() => setCopied(false)} />}
    </div>
  );
}
