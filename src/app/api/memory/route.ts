import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const startupId = searchParams.get("startupId");
  const memoryType = searchParams.get("type");

  if (!startupId) return NextResponse.json({ error: "startupId required" }, { status: 400 });

  let query = supabase
    .from("memories")
    .select("*")
    .eq("startup_id", startupId)
    .eq("user_id", user.id)
    .eq("is_superseded", false)
    .order("created_at", { ascending: false });

  if (memoryType) {
    query = query.eq("memory_type", memoryType);
  }

  const { data, error } = await query;

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data);
}
