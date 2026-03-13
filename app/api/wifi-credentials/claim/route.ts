import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/src/lib/supabase";
import { buildCugCandidates } from "@/src/lib/cug";

export async function POST(req: Request) {
  const { cugNumber } = (await req.json().catch(() => ({}))) as {
    cugNumber?: string;
  };

  const candidates = buildCugCandidates(cugNumber ?? "");
  if (candidates.length === 0) {
    return NextResponse.json(
      { ok: false, error: "missing_cug_number" },
      { status: 400 }
    );
  }

  const supabase = getSupabaseServerClient();
  let data = null;

  // STEP 1: Search the database for the CUG number
  for (const cug of candidates) {
    const res = await supabase
      .from("wifi_credentials")
      .select("cug_number, full_name, department, status, password")
      .eq("cug_number", cug)
      .maybeSingle();

    if (res.error) {
      return NextResponse.json(
        { ok: false, error: "db_error" },
        { status: 500 }
      );
    }

    if (res.data) {
      data = res.data;
      break;
    }
  }

  // STEP 2: Check the results and trigger the right UI states

  // State A: Not Found
  if (!data) {
    return NextResponse.json(
      { ok: false, error: "not_found" },
      { status: 404 }
    );
  }

  // State B: Already Claimed
  if (data.status === "claimed") {
    return NextResponse.json(
      { ok: false, error: "already_claimed" },
      { status: 409 }
    );
  }

  // State C: Success / Unclaimed -> GENERATE OTP!
  console.log("=== CUG FOUND! GENERATING OTP ===");
  
  // 1. Generate a random 6-digit number
  const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
  
  // We log it here so you can see the "text message" in your Cursor terminal!
  console.log(`📱 SMS SENT TO ${data.cug_number}: Your OTP is ${generatedOtp}`);

  // 2. Save it to your new Supabase column
  const { error: updateError } = await supabase
    .from("wifi_credentials")
    .update({ otp_code: generatedOtp })
    .eq("cug_number", data.cug_number);

  if (updateError) {
    return NextResponse.json(
      { ok: false, error: "db_error" },
      { status: 500 }
    );
  }

  // 3. Tell the frontend to move to the OTP page
  return NextResponse.json({
    ok: true,
    requires_otp: true,
    cugNumber: data.cug_number, // We send this back so the next page knows who is logging in
  });
}