import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ startupId: string }> }
) {
  const { startupId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Verify ownership through startup
  const { data: startup } = await supabase
    .from("startups")
    .select("id")
    .eq("id", startupId)
    .eq("user_id", user.id)
    .single();

  if (!startup) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { data, error } = await supabase
    .from("validation_scores")
    .select("*")
    .eq("startup_id", startupId)
    .order("layer");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data);
}
