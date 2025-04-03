import { NextRequest, NextResponse } from "next/server";
import { extractToken } from "@/lib/supabase/client";
import { createAuthClient } from "@/lib/supabase/client";

export async function POST(req: NextRequest) {
  try {
    const { bucket, path } = await req.json();

    if (!bucket || !path) {
      return NextResponse.json(
        { error: "Bucket and path are required" },
        { status: 400 }
      );
    }

    // Get token from the request
    const token = extractToken(req);
    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Create a new Supabase client with the token
    const supabaseWithAuth = createAuthClient(token);

    // Get the authenticated user to use their ID in the path
    const { data: userData, error: userError } =
      await supabaseWithAuth.auth.getUser();

    if (userError || !userData.user) {
      return NextResponse.json(
        { error: "Failed to authenticate user" },
        { status: 401 }
      );
    }

    // Ensure the path starts with the user's ID
    // If the path already includes a folder structure, make sure the first folder is the user's ID
    const userId = userData.user.id;
    let finalPath = path;

    // Check if the path already starts with the user ID
    if (!finalPath.startsWith(`${userId}/`)) {
      // If path has slashes, replace the first folder with the user ID
      if (finalPath.includes("/")) {
        const pathParts = finalPath.split("/");
        pathParts[0] = userId;
        finalPath = pathParts.join("/");
      } else {
        // If there's no folder structure, prepend the user ID
        finalPath = `${userId}/${finalPath}`;
      }
    }

    // Generate a signed URL for uploading
    const { data, error } = await supabaseWithAuth.storage
      .from(bucket)
      .createSignedUploadUrl(finalPath);

    if (error) {
      console.error("Error generating signed URL:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error generating signed URL:", error);
    return NextResponse.json(
      { error: "Failed to generate signed URL" },
      { status: 500 }
    );
  }
}
