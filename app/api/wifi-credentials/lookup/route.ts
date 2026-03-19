import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/src/lib/supabase";
import { buildCugCandidates } from "@/src/lib/cug";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { cugNumber } = body as { cugNumber?: string };

  const candidates = buildCugCandidates(cugNumber ?? "");

  if (candidates.length === 0) {
    return NextResponse.json({ ok: false, error: "missing_cug_number" }, { status: 400 });
  }

  const supabase = getSupabaseServerClient();
  let data = null;

  for (const cug of candidates) {
    const res = await supabase
      .from("wifi_credentials")
      .select("cug_number, full_name, department, status, password")
      .eq("cug_number", cug)
      .maybeSingle();

    if (res.error) {
      return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
    }

    if (res.data) {
      data = res.data;
      break;
    }
  }

  if (!data) {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }

  if (data.status === "claimed") {
    return NextResponse.json({ ok: false, error: "already_claimed" }, { status: 409 });
  }

  // 1. Generate the OTP and Set Expiry
  const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();

  const expiryTime = new Date();
  expiryTime.setMinutes(expiryTime.getMinutes() + 5);

  // 2. Save to Database FIRST
  const { error: updateError } = await supabase
    .from("wifi_credentials")
    .update({ 
      otp_code: generatedOtp,
      otp_expires_at: expiryTime.toISOString(),
      failed_attempts: 0,
      locked_until: null 
    })
    .eq("cug_number", data.cug_number);

  // If the database fails, stop here. Don't send a text!
  if (updateError) {
    console.log("=== 5. ERROR SAVING OTP TO DATABASE ===", updateError);
    return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
  }

  // 3. 📱 THE SMS INTEGRATION (With Free Dev Mode)
  // We only reach this point if the database successfully saved the OTP.
  const termiiKey = process.env.TERMII_API_KEY;

  if (!termiiKey || termiiKey === "pending") {
    // 🛠️ DEV MODE: Just print it to the terminal so you can test the UI for free
    console.log(`[DEV MODE] 📱 SMS WOULD SEND TO ${data.cug_number}: Your OTP is ${generatedOtp}`);
  } else {
    // 🚀 PRODUCTION MODE: Send the real text via Termii
    let termiiNumber = data.cug_number;
    if (termiiNumber.startsWith("0")) termiiNumber = "234" + termiiNumber.slice(1);
    else if (termiiNumber.length === 10) termiiNumber = "234" + termiiNumber;

    try {
      const smsRes = await fetch("https://api.ng.termii.com/api/sms/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: termiiNumber,
          from: "N-Alert",
          sms: `Your Campus Wi-Fi OTP is ${generatedOtp}. It expires in 5 minutes. Do not share this code.`,
          type: "plain",
          channel: "dnd",
          api_key: termiiKey,
        }),
      });
      
      if (!smsRes.ok) console.warn("Termii API rejected the request:", await smsRes.json());
    } catch (err) {
      console.error("Critical error contacting Termii:", err);
    }
  }

  // 4. Send Success to the Frontend
  return NextResponse.json({
    ok: true,
    requires_otp: true,
    cugNumber: data.cug_number, 
  });
}