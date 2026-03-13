import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/src/lib/supabase";
import { buildCugCandidates } from "@/src/lib/cug";

export async function POST(req: Request) {
  // TRACKER 1: What did the frontend actually send?
  const body = await req.json().catch(() => ({}));
  console.log("=== 1. FRONTEND SENT ===", body);

  const { cugNumber } = body as { cugNumber?: string };

  const candidates = buildCugCandidates(cugNumber ?? "");
  // TRACKER 2: What is Next.js searching for?
  console.log("=== 2. SEARCHING FOR THESE VARIATIONS ===", candidates);

  if (candidates.length === 0) {
    return NextResponse.json(
      { ok: false, error: "missing_cug_number" },
      { status: 400 }
    );
  }

  const supabase = getSupabaseServerClient();
  let data = null;

  for (const cug of candidates) {
    const res = await supabase
      .from("wifi_credentials")
      .select("cug_number, full_name, department, status, password")
      .eq("cug_number", cug)
      .maybeSingle();

    // TRACKER 3: What did Supabase say?
    console.log(`=== 3. SUPABASE RESULT FOR '${cug}' ===`, { 
      found: !!res.data, 
      error: res.error 
    });

    if (res.error) {
      return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
    }

    if (res.data) {
      data = res.data;
      break;
    }
  }

  if (!data) {
    console.log("=== 4. END RESULT: 404 NOT FOUND ===");
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }

  if (data.status === "claimed") {
    console.log("=== 4. END RESULT: 409 ALREADY CLAIMED ===");
    return NextResponse.json({ ok: false, error: "already_claimed" }, { status: 409 });
  }

  console.log("=== 4. END RESULT: SUCCESS! GENERATING OTP ===");
  
  const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
  console.log(`📱 SMS SENT TO ${data.cug_number}: Your OTP is ${generatedOtp}`);

  const { error: updateError } = await supabase
    .from("wifi_credentials")
    .update({ otp_code: generatedOtp })
    .eq("cug_number", data.cug_number);

  if (updateError) {
    console.log("=== 5. ERROR SAVING OTP TO DATABASE ===", updateError);
    return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    requires_otp: true,
    cugNumber: data.cug_number, 
  });
}