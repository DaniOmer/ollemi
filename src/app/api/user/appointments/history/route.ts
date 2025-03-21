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

    // Get current date
    const now = new Date();

    // Get past appointments for the user (appointments that have already occurred)
    const { data: appointments, error: appointmentsError } =
      await supabaseWithAuth
        .from("appointments")
        .select(
          "id, start_time, end_time, professional_id, service_id, status, notes"
        )
        .eq("client_id", data.user.id)
        .lt("end_time", now.toISOString())
        .order("start_time", { ascending: false })
        .limit(20);

    if (appointmentsError) {
      console.error(
        "Error fetching user appointment history:",
        appointmentsError
      );
      return NextResponse.json(
        { error: "Error fetching user appointment history" },
        { status: 500 }
      );
    }

    // Get professional details for the appointments
    const professionalIds = [
      ...new Set(appointments.map((a) => a.professional_id)),
    ];

    let professionals = {};

    if (professionalIds.length > 0) {
      const { data: professionalsData, error: professionalsError } =
        await supabaseWithAuth
          .from("professionals")
          .select("id, first_name, last_name, business_name")
          .in("id", professionalIds);

      if (!professionalsError && professionalsData) {
        professionals = professionalsData.reduce((acc, pro) => {
          acc[pro.id] = {
            name: `${pro.first_name} ${pro.last_name}`,
            businessName: pro.business_name || "",
          };
          return acc;
        }, {});
      }
    }

    // Get service details for the appointments
    const serviceIds = [...new Set(appointments.map((a) => a.service_id))];

    let services = {};

    if (serviceIds.length > 0) {
      const { data: servicesData, error: servicesError } =
        await supabaseWithAuth
          .from("services")
          .select("id, name, description, duration, price")
          .in("id", serviceIds);

      if (!servicesError && servicesData) {
        services = servicesData.reduce((acc, service) => {
          acc[service.id] = {
            name: service.name,
            description: service.description,
            duration: service.duration,
            price: service.price,
          };
          return acc;
        }, {});
      }
    }

    // Format the appointments
    const formattedAppointments = appointments.map((appointment) => ({
      id: appointment.id,
      start_time: appointment.start_time,
      end_time: appointment.end_time,
      status: appointment.status,
      notes: appointment.notes,
      service_id: appointment.service_id,
      service_name: services[appointment.service_id]?.name || "Unknown Service",
      service_price: services[appointment.service_id]?.price || 0,
      professional_id: appointment.professional_id,
      professional_name:
        professionals[appointment.professional_id]?.name ||
        "Unknown Professional",
      business_name:
        professionals[appointment.professional_id]?.businessName || "",
    }));

    return NextResponse.json(formattedAppointments);
  } catch (error) {
    console.error("Get user appointment history error:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching user appointment history" },
      { status: 500 }
    );
  }
}
