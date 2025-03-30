import { NextResponse } from "next/server";
import {
  supabase,
  extractToken,
  createAuthClient,
} from "@/lib/supabase/client";

export async function GET(
  request: Request,
  { params }: { params: { id: string; serviceId: string } }
) {
  const { id, serviceId } = await params;

  const { data, error } = await supabase
    .from("service_categories")
    .select("*")
    .eq("service_id", serviceId);

  if (error) {
    console.error("Error fetching service categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch service categories" },
      { status: 500 }
    );
  }

  return NextResponse.json(data);
}

export async function POST(
  request: Request,
  { params }: { params: { id: string; serviceId: string } }
) {
  const { id, serviceId } = await params;
  const body = await request.json();
  const token = extractToken(request);
  if (!token)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabaseWithAuth = createAuthClient(token);

  const { data, error } = await supabaseWithAuth
    .from("service_categories")
    .insert(body)
    .select()
    .single();

  if (error) {
    console.error("Error creating service category:", error);
    return NextResponse.json(
      { error: "Failed to create service category" },
      { status: 500 }
    );
  }

  return NextResponse.json(data);
}
