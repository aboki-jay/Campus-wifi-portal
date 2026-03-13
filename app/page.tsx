"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

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
      className="absolute right-[200px] top-[106px] flex items-center gap-1 rounded-[8px] border border-[#D9D9D9] bg-[#F5F5F5] py-[2px] pl-[6px] pr-[8px] text-[14px] font-medium leading-[18px] text-black"
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
            <Image src={ASSETS.notFound} alt="" fill className="object-cover" />
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
      <div className="flex flex-col gap-4 p-5">
        <div className="relative h-[259px] w-[591px] max-w-full overflow-hidden">
          <div className="absolute left-[266px] top-[-25px] size-[372px]">
            <Image
              src={ASSETS.alreadyClaimed}
              alt=""
              fill
              className="object-cover"
            />
          </div>
          <p className="absolute left-6 top-[92px] w-[253px] text-[32px] font-bold leading-[38px] text-[#1E1E1E]">
            Credentials Already Claimed.
          </p>
          <p className="absolute left-6 top-[174px] w-[288px] text-[16px] text-[#757575]">
            Your password has been claimed already
          </p>
        </div>
        <p className="text-[14px] leading-[1.546] text-[#1E1E1E]">
          Your password has been claimed already. Kindly visit our office at
          Floral building at SUB
        </p>
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
  const [cugNumber, setCugNumber] = useState("");
  const [ui, setUi] = useState<UiState>({ kind: "idle" });
  const [copied, setCopied] = useState(false);

  const canSubmit = useMemo(() => cugNumber.trim().length > 0, [cugNumber]);

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

    const body = (await res.json().catch(() => null)) as
      | { ok: true; credential: LookupCredential }
      | { ok: false; error: string }
      | null;

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
      {ui.kind === "loading" && (
        <LoadingOverlay />
      )}

      {showBaseLayout && (
        <>
          <div className="absolute left-1/2 top-[30px] h-[149.9px] w-[212px] -translate-x-1/2">
            <Image
              src={ASSETS.logo}
              alt="Dodopho Consultancy"
              fill
              className="object-contain"
              priority
            />
          </div>

          <div className="absolute left-1/2 top-[210px] flex w-[682px] -translate-x-1/2 flex-col items-center gap-[44px]">
            <div className="w-full text-center not-italic">
              <h1
                className="text-center text-[62px] font-extrabold leading-[120%] tracking-[-1.28px] text-black bg-white"
                style={{ fontFamily: "Geist", backgroundClip: "unset", WebkitBackgroundClip: "unset" }}
              >
                <span className="text-[#757575]">Get Your Campus</span>{" "}
                <br />
                Wi-Fi Credentials.
              </h1>
              <p className="mx-auto mt-2 w-[474px] text-[18px] leading-[22px] text-[#5A5A5A]">
                Enter your CUG number below to retrieve your personal internet
                password and access locations.
              </p>
            </div>

            <div className="flex w-full flex-col items-center gap-4">
              <div className="w-[502px]">
                <input
                  value={cugNumber}
                  onChange={(e) => setCugNumber(e.target.value)}
                  placeholder="Enter your CUG number e.g 70457688473992"
                  className="h-[44px] w-full rounded-[8px] bg-[#EDEEF2] px-3 text-[14px] text-[#111] placeholder:text-[#64748B] outline-none"
                  inputMode="numeric"
                />
              </div>
              <button
                type="button"
                onClick={lookup}
                disabled={!canSubmit}
                className="h-[40px] w-[382px] rounded-[8px] bg-[#33CB63] text-[14px] font-medium leading-6 text-white disabled:opacity-60"
              >
                Claim password
              </button>
              <div className="flex items-center gap-2">
                <div className="grid size-6 place-items-center text-[#975102]">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path
                      d="M12 2a10 10 0 100 20 10 10 0 000-20Zm0 7.2a1.1 1.1 0 110 2.2 1.1 1.1 0 010-2.2Zm1.25 10.05h-2.5V12h2.5v7.25Z"
                      fill="currentColor"
                    />
                  </svg>
                </div>
                <p className="text-center text-[16px] text-[#975102]">
                  This benefit is only accessible to CUG numbers
                </p>
              </div>
            </div>
          </div>

          <div className="absolute left-1/2 top-[658px] h-[544px] w-[1040px] -translate-x-1/2 rounded-[24px] bg-white shadow-[0_40px_80px_rgba(0,0,0,0.06)]">
            <div className="relative h-full w-full overflow-hidden rounded-[24px] bg-white">
              <Image
                src={ASSETS.wifi}
                alt=""
                fill
                className="object-cover"
                priority={false}
              />

              {/* Wi‑Fi location pins – positioned to match Figma layout */}
              <div className="pointer-events-none absolute inset-0">
                {/* Top right bubble */}
                <div className="pointer-events-auto absolute right-[5%] top-[6%] rotate-[20deg]">
                  <div className="flex h-[57px] w-[210px] items-center gap-2 rounded-full bg-white px-3 py-2 text-[12px] font-medium text-[#1E1E1E] shadow-[0_20px_40px_rgba(0,0,0,0.12)]">
                    <div className="grid size-7 place-items-center rounded-full bg-[#FFE9B8] text-[#BF6A02]">
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
                          r="7"
                          stroke="currentColor"
                          strokeWidth="1.6"
                        />
                        <path
                          d="M9.5 12.5a3.3 3.3 0 015 0"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                        />
                        <path
                          d="M12 15.25h.01"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </svg>
                    </div>
                    <span className="truncate">FUNAABACADEMICB2</span>
                  </div>
                </div>

                {/* Top left bubble */}
                <div className="pointer-events-auto absolute left-[12%] top-[20%] -rotate-[22deg]">
                  <div className="flex h-[57px] w-[196px] items-center gap-2 rounded-full bg-white px-3 py-2 text-[12px] font-medium text-[#1E1E1E] shadow-[0_20px_40px_rgba(0,0,0,0.12)]">
                    <div className="grid size-7 place-items-center rounded-full bg-[#FFE9B8] text-[#BF6A02]">
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
                          r="7"
                          stroke="currentColor"
                          strokeWidth="1.6"
                        />
                        <path
                          d="M9.5 12.5a3.3 3.3 0 015 0"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                        />
                        <path
                          d="M12 15.25h.01"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </svg>
                    </div>
                    <span className="truncate">FUNAAB‑DUFARMS</span>
                  </div>
                </div>

                {/* Center top bubble */}
                <div className="pointer-events-auto absolute left-1/2 top-[5%] -translate-x-1/2">
                  <div className="flex h-[57px] w-[233px] items-center gap-2 rounded-full bg-white px-3 py-2 text-[12px] font-medium text-[#1E1E1E] shadow-[0_20px_40px_rgba(0,0,0,0.12)]">
                    <div className="grid size-7 place-items-center rounded-full bg-[#FFE9B8] text-[#BF6A02]">
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
                          r="7"
                          stroke="currentColor"
                          strokeWidth="1.6"
                        />
                        <path
                          d="M9.5 12.5a3.3 3.3 0 015 0"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                        />
                        <path
                          d="M12 15.25h.01"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </svg>
                    </div>
                    <span className="truncate">SUG AP RADIO</span>
                  </div>
                </div>

                {/* Bottom left bubble */}
                <div className="pointer-events-auto absolute left-[10%] bottom-[18%]">
                  <div className="flex h-[57px] w-[233px] items-center gap-2 rounded-full bg-white px-3 py-2 text-[12px] font-medium text-[#1E1E1E] shadow-[0_20px_40px_rgba(0,0,0,0.12)]">
                    <div className="grid size-7 place-items-center rounded-full bg-[#FFE9B8] text-[#BF6A02]">
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
                          r="7"
                          stroke="currentColor"
                          strokeWidth="1.6"
                        />
                        <path
                          d="M9.5 12.5a3.3 3.3 0 015 0"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                        />
                        <path
                          d="M12 15.25h.01"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </svg>
                    </div>
                    <span className="truncate">FUNAABCOLMAS</span>
                  </div>
                </div>

                {/* Right mid bubble */}
                <div className="pointer-events-auto absolute right-[8%] top-[32%] rotate-7">
                  <div className="flex h-[57px] w-[192px] items-center gap-2 rounded-full bg-white px-3 py-2 text-[12px] font-medium text-[#1E1E1E] shadow-[0_20px_40px_rgba(0,0,0,0.12)]">
                    <div className="grid size-7 place-items-center rounded-full bg-[#FFE9B8] text-[#BF6A02]">
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
                          r="7"
                          stroke="currentColor"
                          strokeWidth="1.6"
                        />
                        <path
                          d="M9.5 12.5a3.3 3.3 0 015 0"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                        />
                        <path
                          d="M12 15.25h.01"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </svg>
                    </div>
                    <span className="truncate">FUNAAB‑ENGINEERING</span>
                  </div>
                </div>

                {/* Bottom center bubble */}
                <div className="pointer-events-auto absolute bottom-[8%] left-1/2 -translate-x-1/2">
                  <div className="flex h-[57px] w-[210px] items-center gap-2 rounded-full bg-white px-3 py-2 text-[12px] font-medium text-[#1E1E1E] shadow-[0_20px_40px_rgba(0,0,0,0.12)]">
                    <div className="grid size-7 place-items-center rounded-full bg-[#FFE9B8] text-[#BF6A02]">
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
                          r="7"
                          stroke="currentColor"
                          strokeWidth="1.6"
                        />
                        <path
                          d="M9.5 12.5a3.3 3.3 0 015 0"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                        />
                        <path
                          d="M12 15.25h.01"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </svg>
                    </div>
                    <span className="truncate">COLANIMPHASE2</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {ui.kind === "notFound" && (
        <NotFoundModal onClose={() => setUi({ kind: "idle" })} />
      )}

      {ui.kind === "alreadyClaimed" && (
        <AlreadyClaimedModal onClose={() => setUi({ kind: "idle" })} />
      )}

      {(ui.kind === "verify" || ui.kind === "success") && (
        <>
          <CloseChip onClick={() => setUi({ kind: "idle" })} />
          <div className="absolute left-1/2 top-[199px] w-[430px] -translate-x-1/2">
            <div className="flex flex-col items-center gap-8">
              <div className="w-full">
                <div className="flex flex-col items-center gap-6">
                  <div className="flex flex-col items-center gap-4 text-center">
                    <div className="grid size-11 place-items-center rounded-full bg-[#F5F5F5] text-[#757575]">
                      <svg
                        className="size-6"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden="true"
                      >
                        <path
                          d="M12 2a10 10 0 100 20 10 10 0 000-20Z"
                          stroke="currentColor"
                          strokeWidth="1.6"
                        />
                        <path
                          d="M7.5 11.5a6.2 6.2 0 019 0M9.5 14a3.3 3.3 0 015 0"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                        />
                        <path
                          d="M12 17.25h.01"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                        />
                      </svg>
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

                  <div className="w-full space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="grid size-11 place-items-center rounded-full bg-[#F5F5F5] text-[#B3B3B3]">
                          <svg
                            className="size-6"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            aria-hidden="true"
                          >
                            <path
                              d="M12 12a4.5 4.5 0 100-9 4.5 4.5 0 000 9Z"
                              stroke="currentColor"
                              strokeWidth="1.6"
                            />
                            <path
                              d="M4 21a8 8 0 0116 0"
                              stroke="currentColor"
                              strokeWidth="1.6"
                              strokeLinecap="round"
                            />
                          </svg>
                        </div>
                        <p className="text-[14px] font-medium text-[#B3B3B3]">
                          Name
                        </p>
                      </div>
                      <p className="text-[16px] font-bold text-[#5A5A5A]">
                        {ui.kind === "verify"
                          ? ui.credential.fullName
                          : ui.credential.fullName}
                      </p>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="grid size-11 place-items-center rounded-full bg-[#F5F5F5] text-[#B3B3B3]">
                          <svg
                            className="size-6"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            aria-hidden="true"
                          >
                            <path
                              d="M7 20v-7a5 5 0 0110 0v7"
                              stroke="currentColor"
                              strokeWidth="1.6"
                              strokeLinecap="round"
                            />
                            <path
                              d="M9 4h6"
                              stroke="currentColor"
                              strokeWidth="1.6"
                              strokeLinecap="round"
                            />
                          </svg>
                        </div>
                        <p className="text-[14px] font-medium text-[#B3B3B3]">
                          Department
                        </p>
                      </div>
                      <p className="text-[16px] font-bold text-[#5A5A5A]">
                        {ui.kind === "verify"
                          ? ui.credential.department
                          : ui.credential.department}
                      </p>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="grid size-11 place-items-center rounded-full bg-[#F5F5F5] text-[#B3B3B3]">
                          <svg
                            className="size-6"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            aria-hidden="true"
                          >
                            <path
                              d="M17 10h-1V8a4 4 0 10-8 0v2H7a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2Z"
                              stroke="currentColor"
                              strokeWidth="1.6"
                            />
                          </svg>
                        </div>
                        <p className="whitespace-pre text-[14px] font-medium text-[#B3B3B3]">
                          Your  Internet password
                        </p>
                      </div>

                      {ui.kind === "verify" ? (
                        <p className="text-[16px] font-bold text-[#5A5A5A]">
                          ******************
                        </p>
                      ) : (
                        <div className="flex items-center gap-2">
                          <p className="text-[16px] font-bold text-[#5A5A5A]">
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
                              xmlns="http://www.w3.org/2000/svg"
                              aria-hidden="true"
                            >
                              <path
                                d="M9 9h10v12H9V9Z"
                                stroke="currentColor"
                                strokeWidth="1.6"
                              />
                              <path
                                d="M5 15H4a1 1 0 01-1-1V4a1 1 0 011-1h10a1 1 0 011 1v1"
                                stroke="currentColor"
                                strokeWidth="1.6"
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
                className="h-10 w-full rounded-[8px] bg-[#33CB63] text-[14px] font-medium leading-6 text-white"
              >
                {ui.kind === "verify" ? "Claim password" : "Claimed"}
              </button>
            </div>
          </div>

          <p className="absolute left-1/2 top-[638px] -translate-x-1/2 text-center text-[14px] font-medium leading-6 text-[#757575]">
            {ui.kind === "verify"
              ? "To access your password click on the button"
              : "Keep this password secure."}
          </p>
        </>
      )}
      {copied && <PasswordClaimedToast onClose={() => setCopied(false)} />}
    </div>
  );
}
