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
      { status: 400 },
    );
  }

  const supabase = getSupabaseServerClient();
  let data:
    | {
        cug_number: string;
        full_name: string;
        department: string;
        status: string;
      }
    | null = null;

  for (const cug of candidates) {
    const res = await supabase
      .from("wifi_credentials")
      .select("cug_number, full_name, department, password, status")
      .eq("cug_number", cug)
      .maybeSingle();
    if (res.error) {
      return NextResponse.json(
        {
          ok: false,
          error: "db_error",
          db_error: {
            message: res.error.message,
            code: res.error.code,
            details: res.error.details,
            hint: res.error.hint,
          },
        },
        { status: 500 },
      );
    }
    if (res.data) {
      data = res.data;
      break;
    }
  }

  if (!data) {
    return NextResponse.json(
      { ok: false, error: "not_found" },
      { status: 404 },
    );
  }

  return NextResponse.json({
    ok: true,
    credential: {
      cugNumber: data.cug_number,
      fullName: data.full_name,
      department: data.department,
      status: data.status,
    },
  });
}

