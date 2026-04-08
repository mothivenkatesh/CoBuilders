import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: conversation, error } = await supabase
    .from("conversations")
    .select("*")
    .eq("id", sessionId)
    .eq("user_id", user.id)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 404 });

  const { data: messages } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", sessionId)
    .order("created_at", { ascending: true });

  return NextResponse.json({ ...conversation, messages: messages || [] });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Delete messages first (FK constraint), then conversation
  await supabase.from("messages").delete().eq("conversation_id", sessionId);
  await supabase.from("memories").delete().eq("conversation_id", sessionId);

  const { error } = await supabase
    .from("conversations")
    .delete()
    .eq("id", sessionId)
    .eq("user_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ deleted: true });
}
