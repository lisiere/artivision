import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type ArtisanOnboardingBody = {
  company_name: string;
  siret?: string;
  specialties: string[];
  primary_color?: string;
  logo_url?: string | null;
  phone?: string | null;
  city?: string | null;
  region?: string | null;
  email?: string | null;
};

export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser();

    if (authErr || !user) {
      return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
    }

    const body = (await req.json()) as ArtisanOnboardingBody;
    const company = typeof body.company_name === "string" ? body.company_name.trim() : "";
    if (!company) {
      return NextResponse.json({ error: "Le nom d’entreprise est requis." }, { status: 400 });
    }

    const specs = Array.isArray(body.specialties) ? body.specialties.map(String) : [];
    if (specs.length === 0) {
      return NextResponse.json({ error: "Choisissez au moins une spécialité." }, { status: 400 });
    }

    const email = (body.email?.trim() || user.email || "").trim();
    if (!email) {
      return NextResponse.json({ error: "Email requis (profil ou formulaire)." }, { status: 400 });
    }

    const primary = typeof body.primary_color === "string" && body.primary_color.startsWith("#")
      ? body.primary_color
      : "#0F172A";

    const { data: upserted, error: upErr } = await supabase
      .from("artisans")
      .upsert(
        {
          user_id: user.id,
          company_name: company,
          siret: body.siret?.trim() || null,
          specialties: specs,
          logo_url: body.logo_url?.trim() || null,
          primary_color: primary,
          phone: body.phone?.trim() || null,
          email,
          city: body.city?.trim() || null,
          region: body.region?.trim() || null,
          onboarding_completed: true,
          onboarding_step: 4,
        },
        { onConflict: "user_id" },
      )
      .select("id")
      .single();

    if (upErr || !upserted?.id) {
      console.error(upErr);
      return NextResponse.json(
        { error: upErr?.message || "Impossible d’enregistrer le profil artisan." },
        { status: 500 },
      );
    }

    const artisanId = upserted.id as string;

    await supabase.from("pricing_catalogs").delete().eq("artisan_id", artisanId);

    const { data: templates, error: tplErr } = await supabase
      .from("catalog_templates")
      .select("room_type,tier,price_min_ht,price_max_ht,included_services")
      .eq("specialty", "default");

    if (tplErr || !templates?.length) {
      console.error(tplErr);
      return NextResponse.json(
        { error: "Templates catalogue introuvables. Appliquez supabase/seed.sql sur votre projet." },
        { status: 500 },
      );
    }

    const rows = templates.map((t) => ({
      artisan_id: artisanId,
      room_type: t.room_type,
      tier: t.tier,
      price_min_ht: t.price_min_ht,
      price_max_ht: t.price_max_ht,
      included_services: t.included_services ?? [],
      is_enabled: true,
    }));

    const { error: insErr } = await supabase.from("pricing_catalogs").insert(rows);
    if (insErr) {
      console.error(insErr);
      return NextResponse.json({ error: insErr.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, artisan_id: artisanId });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
