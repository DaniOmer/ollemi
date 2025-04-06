import { NextResponse } from "next/server";
import {
  extractToken,
  createAuthClient,
  supabase,
} from "@/lib/supabase/client";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const token = extractToken(request);
    if (!token) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const supabaseWithAuth = createAuthClient(token);

    const { id: companyId } = await params;

    if (!companyId) {
      return NextResponse.json(
        { error: "ID de l'entreprise requis" },
        { status: 400 }
      );
    }

    // Récupérer les réservations pour l'entreprise
    const { data, error } = await supabaseWithAuth
      .from("appointments")
      .select(
        `
        *,
        service:services (
          id,
          name,
          duration,
          price
        ),
        customer:users (
          id,
          first_name,
          last_name,
          email,
          phone
        )
      `
      )
      .eq("company_id", companyId)
      .order("start_time", { ascending: true });

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error("Erreur lors de la récupération des réservations:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des réservations" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const token = extractToken(request);
    if (!token) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const supabaseWithAuth = createAuthClient(token);
    const body = await request.json();

    const { data: user, error: authError } =
      await supabaseWithAuth.auth.getUser();

    if (!user) {
      console.error("Unauthorized access", authError);
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 }
      );
    }

    // Get all user informations
    const { data: userData, error: userError } = await supabaseWithAuth
      .from("users")
      .select("*")
      .eq("id", user.user?.id)
      .single();

    if (userError) {
      console.error(
        "Erreur lors de la récupération des informations de l'utilisateur:",
        userError
      );
      return NextResponse.json(
        { error: "Error while fetching user informations" },
        { status: 500 }
      );
    }

    // Vérifier la disponibilité du créneau
    const { data: existingAppointments } = await supabase
      .from("appointments")
      .select("*")
      .eq("company_id", body.company_id)
      .eq("status", "confirmed")
      .or(`start_time.lte.${body.end_time},end_time.gte.${body.start_time}`);

    if (existingAppointments && existingAppointments.length > 0) {
      return NextResponse.json(
        { error: "Ce créneau n'est plus disponible" },
        { status: 400 }
      );
    }

    // Vérifier si le créneau est dans les horaires d'ouverture
    const { data: openingHours } = await supabase
      .from("opening_hours")
      .select("*")
      .eq("company_id", body.company_id)
      .eq("day_of_week", new Date(body.start_time).getDay().toLocaleString());

    if (!openingHours || !openingHours[0]?.open) {
      console.log(
        "L'établissement est fermé à cette date :",
        new Date(body.start_time).getDay().toLocaleString()
      );
      return NextResponse.json(
        { error: "L'établissement est fermé à cette date" },
        { status: 400 }
      );
    }

    // Créer la réservation
    const { data, error } = await supabaseWithAuth
      .from("appointments")
      .insert([
        {
          company_id: body.company_id,
          service_id: body.service.id,
          client_id: userData.id,
          client_name: userData.first_name + " " + userData.last_name,
          client_email: userData.email,
          client_phone: userData.phone,
          start_time: body.start_time,
          end_time: body.end_time,
          notes: body.notes,
          status: "pending",
        },
      ])
      .select("*")
      .single();

    if (error) {
      console.error("Erreur lors de la création de la réservation:", error);
      return NextResponse.json(
        { error: "Error while creating the booking" },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Erreur lors de la création de la réservation:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de la réservation" },
      { status: 500 }
    );
  }
}
