import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Get the current user's company_id
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: companyUser } = await supabase
      .from("companies")
      .select("company_id")
      .eq("user_id", user.id)
      .single();

    if (!companyUser) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    const { data: categories, error } = await supabase
      .from("service_categories")
      .select("*")
      .eq("company_id", companyUser.company_id)
      .order("name");

    if (error) throw error;

    return NextResponse.json(categories);
  } catch (error) {
    return NextResponse.json(
      { error: "Error fetching categories" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Get the current user's company_id
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: companyUser } = await supabase
      .from("companies")
      .select("company_id")
      .eq("user_id", user.id)
      .single();

    if (!companyUser) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    const body = await request.json();
    const { name, description } = body;

    const { data: category, error } = await supabase
      .from("service_categories")
      .insert([
        {
          name,
          description,
          company_id: companyUser.company_id,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(category);
  } catch (error) {
    return NextResponse.json(
      { error: "Error creating category" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const body = await request.json();
    const { id, name, description } = body;

    const { data: category, error } = await supabase
      .from("service_categories")
      .update({ name, description })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(category);
  } catch (error) {
    return NextResponse.json(
      { error: "Error updating category" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Category ID is required" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("service_categories")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Error deleting category" },
      { status: 500 }
    );
  }
}
