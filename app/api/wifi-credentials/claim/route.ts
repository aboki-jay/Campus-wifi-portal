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
    console.log("=== SUPABASE QUERY START ===", { checkingCUG: cug });

    const res = await supabase
      .from("wifi_credentials")
      .select("cug_number, full_name, department, status, password")
      .eq("cug_number", cug)
      .maybeSingle();

    console.log("=== SUPABASE QUERY RESULT ===", { foundData: res.data, error: res.error });

    // If there is a database connection error, return 500
    if (res.error) {
      return NextResponse.json(
        {
          ok: false,
          error: "db_error",
          db_error: {
            message: res.error.message,
            code: res.error.code,
          },
        },
        { status: 500 }
      );
    }

    // If we found a match, save it and stop searching
    if (res.data) {
      data = res.data;
      break;
    }
  }

  // STEP 2: Check the results and trigger the right UI states

  // State A: Not Found (Triggers your Yellow Warning Modal)
  if (!data) {
    console.log("=== RESULT: CUG NOT FOUND ===");
    return NextResponse.json(
      { ok: false, error: "not_found" },
      { status: 404 }
    );
  }

  // State B: Already Claimed (Triggers your Padlock Modal)
  if (data.status === "claimed") {
    console.log("=== RESULT: ALREADY CLAIMED ===");
    return NextResponse.json(
      { ok: false, error: "already_claimed" },
      { status: 409 }
    );
  }

  // State C: Success / Unclaimed (Triggers your Success Modal)
  console.log("=== RESULT: SUCCESS! ===");
  return NextResponse.json({
    ok: true,
    credential: {
      cugNumber: data.cug_number,
      fullName: data.full_name,
      department: data.department,
      status: data.status,
      password: data.password, // Here is our missing password fix!
    },
  });
}