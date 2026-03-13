import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/src/lib/supabase";

export async function POST(req: Request) {
  const { cugNumber, otp } = await req.json().catch(() => ({}));

  if (!cugNumber || !otp) {
    return NextResponse.json({ ok: false, error: "Missing data" }, { status: 400 });
  }

  const supabase = getSupabaseServerClient();

  // 1. Find the user in the database
  const { data, error } = await supabase
    .from("wifi_credentials")
    .select("*")
    .eq("cug_number", cugNumber)
    .single();

  if (error || !data) {
    return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  }

  // 2. Check if the typed OTP matches the database OTP
  if (data.otp_code !== otp) {
    return NextResponse.json({ ok: false, error: "Invalid OTP" }, { status: 401 });
  }

  // 3. SUCCESS! Mark as claimed and clear the OTP so it can't be used again
  await supabase
    .from("wifi_credentials")
    .update({ status: "claimed", otp_code: null })
    .eq("cug_number", cugNumber);

  // 4. Send the exact Wi-Fi password back to the frontend
  return NextResponse.json({
    ok: true,
    credential: {
      cugNumber: data.cug_number,
      fullName: data.full_name,
      department: data.department,
      status: "claimed",
      password: data.password // The hidden gem!
    }
  });
}