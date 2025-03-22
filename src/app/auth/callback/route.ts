import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse, NextRequest } from "next/server";

/**
 * OAuth callback handler
 *
 * This route handles the callback from OAuth providers (like Google)
 * It exchanges the code for a session and redirects the user to the appropriate page
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const defaultLocale = "fr"; // Ajustez selon votre configuration

  if (code) {
    // Create a Supabase client using the cookies from the request
    const supabase = createRouteHandlerClient({ cookies });

    // Exchange the code for a session
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data?.session) {
      // Récupérer les informations de l'utilisateur
      const { data: userData, error: userError } = await supabase.auth.getUser(
        data.session.access_token
      );

      if (!userError && userData?.user) {
        // Récupérer le rôle de l'utilisateur depuis les métadonnées ou une requête à la base de données
        try {
          const { data: profileData } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", userData.user.id)
            .single();

          const userDataForCookie = {
            id: userData.user.id,
            email: userData.user.email,
            role: profileData?.role || "client", // Par défaut, rôle client
          };

          // Créer la réponse de redirection basée sur le rôle
          let redirectUrl;
          if (profileData?.role === "pro") {
            redirectUrl = new URL(
              `/${defaultLocale}/dashboard/pro`,
              request.url
            );
          } else if (profileData?.role === "client") {
            redirectUrl = new URL(
              `/${defaultLocale}/dashboard/client`,
              request.url
            );
          } else {
            redirectUrl = new URL(`/${defaultLocale}/dashboard`, request.url);
          }

          // Créer la réponse et définir le cookie
          const response = NextResponse.redirect(redirectUrl);

          // Ajouter le cookie à la réponse
          response.cookies.set({
            name: "user",
            value: JSON.stringify(userDataForCookie),
            path: "/",
            maxAge: 60 * 60 * 24 * 7, // 7 jours
            httpOnly: false, // Doit être false pour que le middleware puisse y accéder
          });

          return response;
        } catch (err) {
          console.error("Error fetching user role:", err);
        }
      }
    }
  }

  // Par défaut ou en cas d'erreur, rediriger vers la page d'accueil
  return NextResponse.redirect(new URL(`/${defaultLocale}`, request.url));
}
