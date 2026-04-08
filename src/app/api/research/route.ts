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

  if (!startupId) return NextResponse.json({ error: "startupId required" }, { status: 400 });

  // Verify ownership
  const { data: startup } = await supabase
    .from("startups")
    .select("id")
    .eq("id", startupId)
    .eq("user_id", user.id)
    .single();

  if (!startup) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { data, error } = await supabase
    .from("competitor_intel")
    .select("*")
    .eq("startup_id", startupId)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data);
}
