"use client";

import Image from "next/image";
import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type CredentialStatus = "unclaimed" | "claimed" | string;

type LookupCredential = {
  cugNumber: string;
  fullName: string;
  department: string;
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

const ASSETS = {
  logo: "/8c61e5aa887dac818254a63f90dcea65973a45ac.png",
  wifi: "/81d89fdb093acc3c15c1c14ed6692e3af4c156d3.png",
  notFound: "/38df8bc5a73ab2364418df1e7050401784a0fca5.png",
  alreadyClaimed: "/641085efe6785d884e8639682858244205e8cfb5.png",
} as const;

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
            We’re checking our system for your internet credentials
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

function NotFoundModal({ onClose }: { onClose: () => void }) {
  return (
    <ModalShell tone="warning" onClose={onClose}>
      <div className="flex flex-col gap-4 p-5">
        <div className="relative h-[259px] w-[591px] max-w-full overflow-hidden">
          <div className="absolute left-[168px] top-[-64px] h-[387px] w-[580px]">
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
            Please check your spelling or visit our office at Floral building at
            SUB
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
        <div className="absolute right-[-40px] top-[-20px] size-[250px] sm:size-[372px] opacity-20 sm:opacity-100 pointer-events-none z-0">
          <Image
            src={ASSETS.alreadyClaimed}
            alt=""
            fill
            className="object-contain sm:object-cover"
              sizes="(max-width: 640px) 250px, 372px"
          />
        </div>
        <div className="relative z-10 flex flex-col gap-6 w-full sm:w-[60%] pt-10 pb-4">
          <h2 className="text-[28px] sm:text-[32px] font-bold leading-tight text-[#1E1E1E]">
            Credentials Already Claimed.
          </h2>
          <p className="text-[14px] sm:text-[16px] leading-[1.546] text-[#757575]">
            Your password has been claimed already. Kindly visit our office at the
            Floral building at SUB.
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

export default function Home() {
  const router = useRouter(); 
  const [cugNumber, setCugNumber] = useState("");
  const [ui, setUi] = useState<UiState>({ kind: "idle" });
  const [copied, setCopied] = useState(false);

  const canSubmit = useMemo(() => cugNumber.trim().length > 0, [cugNumber]);

  useEffect(() => {
    const savedSuccess = sessionStorage.getItem("wifi_success");
    if (savedSuccess) {
      const credential = JSON.parse(savedSuccess);
      setUi({ kind: "verify", credential }); 
      sessionStorage.removeItem("wifi_success");
    }
  }, []);

  async function lookup() {
    const cug = cugNumber.trim();
    if (!cug) return;

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

    const body = (await res.json().catch(() => null));

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
    if (ui.kind !== "verify") return;

    setUi({ kind: "loading" });
    const res = await fetch("/api/wifi-credentials/claim", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cugNumber: ui.credential.cugNumber }),
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
        <div className="mx-auto flex w-full max-w-[1040px] flex-col items-center px-4 pt-10 pb-20 sm:pt-12">
          
          {/* LOGO */}
          <div className="relative h-[100px] w-[150px] shrink-0 sm:h-[130px] sm:w-[190px]">
            <Image
              src={ASSETS.logo}
              alt="Dodopho Consultancy"
              fill
              className="object-contain"
              sizes="(max-width: 640px) 150px, 190px"
              priority
            />
          </div>

          {/* HEADER TEXT */}
          <div className="mt-8 flex w-full max-w-[682px] flex-col items-center text-center sm:mt-10">
            <h1 className="text-[32px] font-extrabold leading-[1.2] tracking-[-0.04em] text-black sm:text-[40px] md:text-[62px]">
              <span className="text-[#757575]">Get Your Campus</span> <br />
              Wi-Fi Credentials.
            </h1>
            <p className="mt-4 w-full max-w-[474px] text-[14px] leading-relaxed text-[#5A5A5A] sm:text-[16px]">
              Enter your CUG number below to retrieve your personal internet
              password and access locations.
            </p>
          </div>

          {/* FORM AREA */}
          <div className="mt-8 flex w-full max-w-[600px] flex-col items-center gap-4">
            <div className="flex w-full flex-col items-center justify-center gap-4 sm:flex-row">
              <div className="w-full">
                <input
                  value={cugNumber}
                  onChange={(e) => setCugNumber(e.target.value)}
                  placeholder="Enter your CUG number e.g 70457688473992"
                  className="h-[48px] w-full rounded-[8px] bg-[#EDEEF2] px-4 text-[14px] text-[#111] placeholder:text-[#64748B] outline-none transition-all focus:ring-2 focus:ring-[#33CB63]/50"
                  inputMode="numeric"
                />
              </div>
              <button
                type="button"
                onClick={lookup}
                disabled={!canSubmit}
                className="h-[48px] w-full shrink-0 rounded-[8px] bg-[#33CB63] text-[14px] font-medium text-white transition-all hover:bg-[#2bb356] disabled:opacity-60 sm:w-[160px]"
              >
                Claim password
              </button>
            </div>

            <div className="mt-1 flex items-center gap-2 px-2 text-center">
              <div className="grid size-5 place-items-center text-[#975102]">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2a10 10 0 100 20 10 10 0 000-20Zm0 7.2a1.1 1.1 0 110 2.2 1.1 1.1 0 010-2.2Zm1.25 10.05h-2.5V12h2.5v7.25Z" fill="currentColor" />
                </svg>
              </div>
              <p className="text-[13px] text-[#975102] sm:text-[14px]">
                This benefit is only accessible to CUG numbers
              </p>
            </div>
          </div>

          {/* WIFI MAP */}
          <div className="relative mt-12 h-[340px] w-full shrink-0 overflow-hidden rounded-[24px] bg-white shadow-[0_20px_40px_rgba(0,0,0,0.08)] sm:mt-16 sm:h-[420px] md:h-[544px] md:shadow-[0_40px_80px_rgba(0,0,0,0.06)]">
            <Image
              src={ASSETS.wifi}
              alt=""
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 1040px"
              loading="eager"
              priority={false}
            />

            <div className="pointer-events-none absolute inset-0">
              {/* Top right bubble */}
              <div className="pointer-events-auto absolute right-[5%] top-[6%] rotate-[20deg]">
                <div className="flex h-[57px] w-[210px] items-center gap-2 rounded-full bg-white px-3 py-2 text-[12px] font-medium text-[#1E1E1E] shadow-[0_20px_40px_rgba(0,0,0,0.12)]">
                  <div className="grid size-7 place-items-center rounded-full bg-[#FFE9B8] text-[#BF6A02]">
                    <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                      <circle cx="12" cy="12" r="7" /><path d="M9.5 12.5a3.3 3.3 0 015 0" strokeLinecap="round" /><path d="M12 15.25h.01" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </div>
                  <span className="truncate">FUNAABACADEMICB2</span>
                </div>
              </div>

              {/* Top left bubble */}
              <div className="pointer-events-auto absolute left-[12%] top-[20%] -rotate-[22deg]">
                <div className="flex h-[57px] w-[196px] items-center gap-2 rounded-full bg-white px-3 py-2 text-[12px] font-medium text-[#1E1E1E] shadow-[0_20px_40px_rgba(0,0,0,0.12)]">
                  <div className="grid size-7 place-items-center rounded-full bg-[#FFE9B8] text-[#BF6A02]">
                    <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                      <circle cx="12" cy="12" r="7" /><path d="M9.5 12.5a3.3 3.3 0 015 0" strokeLinecap="round" /><path d="M12 15.25h.01" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </div>
                  <span className="truncate">FUNAAB‑DUFARMS</span>
                </div>
              </div>

              {/* Center top bubble */}
              <div className="pointer-events-auto absolute left-1/2 top-[5%] -translate-x-1/2">
                <div className="flex h-[57px] w-[233px] items-center gap-2 rounded-full bg-white px-3 py-2 text-[12px] font-medium text-[#1E1E1E] shadow-[0_20px_40px_rgba(0,0,0,0.12)]">
                  <div className="grid size-7 place-items-center rounded-full bg-[#FFE9B8] text-[#BF6A02]">
                    <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                      <circle cx="12" cy="12" r="7" /><path d="M9.5 12.5a3.3 3.3 0 015 0" strokeLinecap="round" /><path d="M12 15.25h.01" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </div>
                  <span className="truncate">SUG AP RADIO</span>
                </div>
              </div>

              {/* Bottom left bubble */}
              <div className="pointer-events-auto absolute bottom-[18%] left-[10%]">
                <div className="flex h-[57px] w-[233px] items-center gap-2 rounded-full bg-white px-3 py-2 text-[12px] font-medium text-[#1E1E1E] shadow-[0_20px_40px_rgba(0,0,0,0.12)]">
                  <div className="grid size-7 place-items-center rounded-full bg-[#FFE9B8] text-[#BF6A02]">
                    <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                      <circle cx="12" cy="12" r="7" /><path d="M9.5 12.5a3.3 3.3 0 015 0" strokeLinecap="round" /><path d="M12 15.25h.01" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </div>
                  <span className="truncate">FUNAABCOLMAS</span>
                </div>
              </div>

              {/* Right mid bubble */}
              <div className="pointer-events-auto absolute right-[8%] top-[32%] rotate-6">
                <div className="flex h-[57px] w-[192px] items-center gap-2 rounded-full bg-white px-3 py-2 text-[12px] font-medium text-[#1E1E1E] shadow-[0_20px_40px_rgba(0,0,0,0.12)]">
                  <div className="grid size-7 place-items-center rounded-full bg-[#FFE9B8] text-[#BF6A02]">
                    <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                      <circle cx="12" cy="12" r="7" /><path d="M9.5 12.5a3.3 3.3 0 015 0" strokeLinecap="round" /><path d="M12 15.25h.01" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </div>
                  <span className="truncate">FUNAAB‑ENGINEERING</span>
                </div>
              </div>

              {/* Bottom center bubble */}
              <div className="pointer-events-auto absolute bottom-[8%] left-1/2 -translate-x-1/2">
                <div className="flex h-[57px] w-[210px] items-center gap-2 rounded-full bg-white px-3 py-2 text-[12px] font-medium text-[#1E1E1E] shadow-[0_20px_40px_rgba(0,0,0,0.12)]">
                  <div className="grid size-7 place-items-center rounded-full bg-[#FFE9B8] text-[#BF6A02]">
                    <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                      <circle cx="12" cy="12" r="7" /><path d="M9.5 12.5a3.3 3.3 0 015 0" strokeLinecap="round" /><path d="M12 15.25h.01" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </div>
                  <span className="truncate">COLANIMPHASE2</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODALS */}
      {ui.kind === "notFound" && <NotFoundModal onClose={() => setUi({ kind: "idle" })} />}
      {ui.kind === "alreadyClaimed" && <AlreadyClaimedModal onClose={() => setUi({ kind: "idle" })} />}

      {/* VERIFY / SUCCESS VIEW (Responsive fix applied here too!) */}
      {(ui.kind === "verify" || ui.kind === "success") && (
        <div className="flex min-h-screen flex-col items-center justify-center px-4 py-20">
          <CloseChip onClick={() => setUi({ kind: "idle" })} />
          
          <div className="mx-auto w-full max-w-[430px]">
            <div className="flex flex-col items-center gap-8">
              <div className="w-full">
                <div className="flex flex-col items-center gap-6">
                  <div className="flex flex-col items-center gap-4 text-center">
                    <div className="grid size-11 place-items-center rounded-full bg-[#F5F5F5] text-[#757575]">
                      <svg className="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                        <path d="M12 2a10 10 0 100 20 10 10 0 000-20Z" /><path d="M7.5 11.5a6.2 6.2 0 019 0M9.5 14a3.3 3.3 0 015 0" strokeLinecap="round" /><path d="M12 17.25h.01" strokeWidth="2.5" strokeLinecap="round" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-[24px] font-medium leading-9 text-[#1E1E1E]">Your Internet Credential</p>
                      <p className="mt-2 text-[14px] leading-4 text-[#757575]">Stay connected each time you&apos;re around these areas.</p>
                    </div>
                  </div>

                  <div className="h-px w-full bg-black/10" />

                  <div className="w-full space-y-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-2">
                        <div className="grid size-11 place-items-center rounded-full bg-[#F5F5F5] text-[#B3B3B3]">
                          <svg className="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                            <path d="M12 12a4.5 4.5 0 100-9 4.5 4.5 0 000 9Z" /><path d="M4 21a8 8 0 0116 0" strokeLinecap="round" />
                          </svg>
                        </div>
                        <p className="text-[13px] font-medium text-[#B3B3B3] sm:text-[14px]">Name</p>
                      </div>
                      <p className="text-[15px] font-bold text-[#5A5A5A] sm:text-[16px]">{ui.credential.fullName}</p>
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-2">
                        <div className="grid size-11 place-items-center rounded-full bg-[#F5F5F5] text-[#B3B3B3]">
                          <svg className="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                            <path d="M7 20v-7a5 5 0 0110 0v7" strokeLinecap="round" /><path d="M9 4h6" strokeLinecap="round" />
                          </svg>
                        </div>
                        <p className="text-[13px] font-medium text-[#B3B3B3] sm:text-[14px]">Department</p>
                      </div>
                      <p className="text-[15px] font-bold text-[#5A5A5A] sm:text-[16px]">{ui.credential.department}</p>
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-2">
                        <div className="grid size-11 place-items-center rounded-full bg-[#F5F5F5] text-[#B3B3B3]">
                          <svg className="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                            <path d="M17 10h-1V8a4 4 0 10-8 0v2H7a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2Z" />
                          </svg>
                        </div>
                        <p className="text-[13px] font-medium text-[#B3B3B3] sm:text-[14px]">Your Internet password</p>
                      </div>

                      {ui.kind === "verify" ? (
                        <p className="text-[15px] font-bold text-[#5A5A5A] sm:text-[16px]">******************</p>
                      ) : (
                        <div className="flex items-center gap-2">
                          <p className="text-[15px] font-bold text-[#5A5A5A] sm:text-[16px]">{ui.credential.password}</p>
                          <button
                            type="button"
                            onClick={async () => {
                              await navigator.clipboard.writeText(ui.credential.password);
                              setCopied(true);
                              window.setTimeout(() => setCopied(false), 2500);
                            }}
                            className="grid size-6 place-items-center text-[#757575] hover:text-black"
                            aria-label="Copy password"
                          >
                            <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                              <path d="M9 9h10v12H9V9Z" /><path d="M5 15H4a1 1 0 01-1-1V4a1 1 0 011-1h10a1 1 0 011 1v1" strokeLinecap="round" />
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
              {ui.kind === "verify" ? "To access your password click on the button" : "Keep this password secure."}
            </p>
          </div>
        </div>
      )}

      {copied && <PasswordClaimedToast onClose={() => setCopied(false)} />}
    </div>
  );
}