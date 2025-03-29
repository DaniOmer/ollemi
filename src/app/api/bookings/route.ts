import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const body = await request.json();

    // Vérifier si l'utilisateur est authentifié
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
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
      .eq("day_of_week", new Date(body.start_time).toLocaleLowerCase());

    if (!openingHours || !openingHours[0]?.open) {
      return NextResponse.json(
        { error: "L'établissement est fermé à cette date" },
        { status: 400 }
      );
    }

    // Créer la réservation
    const { data, error } = await supabase.from("appointments").insert([
      {
        company_id: body.company_id,
        service_id: body.service_id,
        client_id: session.user.id,
        client_name: body.client_name,
        client_email: body.client_email,
        client_phone: body.client_phone,
        start_time: body.start_time,
        end_time: body.end_time,
        notes: body.notes,
        status: "pending",
      },
    ]);

    if (error) throw error;

    return NextResponse.json(data[0]);
  } catch (error) {
    console.error("Erreur lors de la création de la réservation:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de la réservation" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get("companyId");

    if (!companyId) {
      return NextResponse.json(
        { error: "ID de l'entreprise requis" },
        { status: 400 }
      );
    }

    // Récupérer les réservations pour l'entreprise
    const { data, error } = await supabase
      .from("appointments")
      .select(
        `
        *,
        services (
          name,
          duration,
          price
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
