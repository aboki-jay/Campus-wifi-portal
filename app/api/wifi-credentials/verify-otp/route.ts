export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/src/lib/supabase";

export async function POST(req: Request) {
  const { cugNumber, otp } = await req.json().catch(() => ({}));

  if (!cugNumber || !otp) {
    return NextResponse.json({ ok: false, error: "Missing data" }, { status: 400 });
  }

  const supabase = getSupabaseServerClient();

  const { data, error } = await supabase
    .from("wifi_credentials")
    .select("*")
    .eq("cug_number", cugNumber)
    .single();

  if (error || !data) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });

  // 🛡️ CHECK 1: Is the user locked out?
  if (data.locked_until && new Date(data.locked_until) > new Date()) {
    const remainingMinutes = Math.ceil((new Date(data.locked_until).getTime() - new Date().getTime()) / 60000);
    return NextResponse.json({ ok: false, error: `Locked for ${remainingMinutes} minute(s).` }, { status: 429 });
  }

  // 🛡️ CHECK 2: Has the OTP expired? (5-minute rule)
  if (data.otp_expires_at && new Date(data.otp_expires_at) < new Date()) {
    return NextResponse.json({ ok: false, error: "OTP expired. Please go back and request a new one." }, { status: 400 });
  }

  // 🛡️ CHECK 3: Is the OTP wrong?
  if (data.otp_code !== otp) {
    const newAttempts = (data.failed_attempts || 0) + 1;
    let updatePayload: any = { failed_attempts: newAttempts };
    
    if (newAttempts >= 3) {
      const lockTime = new Date();
      // 👇 UX TWEAK: Changed to 10 minutes!
      lockTime.setMinutes(lockTime.getMinutes() + 10);
      updatePayload.locked_until = lockTime.toISOString();
    }

    await supabase.from("wifi_credentials").update(updatePayload).eq("cug_number", cugNumber);

    if (newAttempts >= 3) {
      // 👇 UX TWEAK: Error message updated to 10 minutes!
      return NextResponse.json({ ok: false, error: "Locked for 10 minutes." }, { status: 429 });
    }
    return NextResponse.json({ ok: false, error: "Invalid OTP" }, { status: 401 });
  }

  // SUCCESS! Clear the OTP, but do NOT mark as claimed yet!
  await supabase
    .from("wifi_credentials")
    .update({ 
      otp_code: null,
      otp_expires_at: null, // Clear expiry
      failed_attempts: 0,
      locked_until: null
    })
    .eq("cug_number", cugNumber);

  // 👇 CEO UPDATE: Passing all 7 fields to the frontend, but don't include the password yet!
  return NextResponse.json({
    ok: true,
    credential: {
      cugNumber: data.cug_number,
      cug_number: data.cug_number,
      full_name: data.full_name,
      department: data.department,
      college: data.college,
      level: data.level,
      matric_number: data.matric_number,
      status: "unclaimed" // Keeps the password masked on the frontend!
      // Notice: password is not returned here!
    }
  });
}