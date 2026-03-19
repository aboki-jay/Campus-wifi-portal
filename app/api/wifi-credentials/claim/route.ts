import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/src/lib/supabase";
import { buildCugCandidates } from "@/src/lib/cug";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    
    // 🛡️ SECURITY CHECK 1: The Data Type Armor
    // This forces whatever the frontend sends (even a raw number) into a clean string.
    const rawCug = String(body.cugNumber || "").trim();

    if (!rawCug) {
      return NextResponse.json({ ok: false, error: "Missing CUG number" }, { status: 400 });
    }

    const candidates = buildCugCandidates(rawCug);
    const supabase = getSupabaseServerClient();
    let userData = null;

    // 🛡️ SECURITY CHECK 2: Find the exact user record first
    for (const cug of candidates) {
      const { data, error } = await supabase
        .from("wifi_credentials")
        .select("*")
        .eq("cug_number", cug)
        .maybeSingle();

      if (data) {
        userData = data;
        break;
      }
    }

    // If we looped through all candidates and found nothing
    if (!userData) {
      return NextResponse.json({ ok: false, error: "CUG not found" }, { status: 404 });
    }

    // 🛡️ SECURITY CHECK 3: The Double-Click Defender (Idempotency)
    // If they already claimed it (or tapped the button twice), just give them the 
    // password again instead of throwing an error and scaring them!
    if (userData.status === "claimed") {
      return NextResponse.json({
        ok: true,
        credential: {
          cugNumber: userData.cug_number,
          fullName: userData.full_name,
          department: userData.department,
          status: "claimed",
          password: userData.password,
        },
      });
    }

    // 🛡️ SECURITY CHECK 4: The Final Update & Clean Slate
    const { error: updateError } = await supabase
      .from("wifi_credentials")
      .update({ 
        status: "claimed",
        otp_code: null,      // Wipe any leftover OTPs
        failed_attempts: 0,  // Reset their strikes
        locked_until: null   // Remove any locks
      })
      .eq("cug_number", userData.cug_number);

    if (updateError) {
      console.error("Database Update Error:", updateError);
      return NextResponse.json({ ok: false, error: "Failed to update status" }, { status: 500 });
    }

    // SUCCESS! Hand over the credentials.
    return NextResponse.json({
      ok: true,
      credential: {
        cugNumber: userData.cug_number,
        fullName: userData.full_name,
        department: userData.department,
        status: "claimed",
        password: userData.password,
      },
    });

  } catch (error) {
    // A massive try/catch block so if ANYTHING goes wrong, the server doesn't crash.
    console.error("=== CLAIM API CRITICAL ERROR ===", error);
    return NextResponse.json({ ok: false, error: "Internal Server Error" }, { status: 500 });
  }
}