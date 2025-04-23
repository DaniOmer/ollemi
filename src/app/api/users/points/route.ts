import { NextResponse } from "next/server";
import { extractToken, createAuthClient } from "@/lib/supabase/client";

export async function GET(request: Request) {
  try {
    // Get token from the request
    const token = extractToken(request);
    if (!token)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Create a new Supabase client with the token
    const supabaseWithAuth = createAuthClient(token);

    // Get the user with the token
    const { data, error } = await supabaseWithAuth.auth.getUser();

    if (error || !data.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user total points
    const { data: userPoints, error: pointsError } = await supabaseWithAuth
      .from("user_points")
      .select("total_points")
      .eq("user_id", data.user.id)
      .single();

    if (pointsError && pointsError.code !== "PGRST116") {
      // PGRST116 is "no rows returned" - in this case we just return 0 points
      console.error("Error fetching user points:", pointsError);
      return NextResponse.json(
        { error: "Error fetching user points" },
        { status: 500 }
      );
    }

    const totalPoints = userPoints?.total_points || 0;

    // Get points history
    const { data: pointsHistory, error: historyError } = await supabaseWithAuth
      .from("user_points_history")
      .select("id, amount, reason, created_at")
      .eq("user_id", data.user.id)
      .order("created_at", { ascending: false })
      .limit(10);

    if (historyError) {
      console.error("Error fetching user points history:", historyError);
      return NextResponse.json(
        { error: "Error fetching user points history" },
        { status: 500 }
      );
    }

    // Format the history
    const formattedHistory = pointsHistory.map((entry) => ({
      id: entry.id,
      amount: entry.amount,
      reason: entry.reason,
      date: entry.created_at,
    }));

    return NextResponse.json({
      total: totalPoints,
      history: formattedHistory,
    });
  } catch (error) {
    console.error("Get user points error:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching user points" },
      { status: 500 }
    );
  }
}
