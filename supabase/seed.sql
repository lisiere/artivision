-- Seed : templates catalogue €/m² HT (conversion TTC→HT ÷ 1,10 depuis prix_renovation.json quand présent)
-- Spécialités : même grille pour le MVP (copie identique) — affinage métier plus tard.

insert into public.catalog_templates (specialty, room_type, tier, price_min_ht, price_max_ht, included_services)
values
  -- salle_de_bain (JSON TTC → HT)
  ('default', 'salle_de_bain', 'economique', round(900::numeric / 1.10, 2), round(1200::numeric / 1.10, 2), array['Sanitaires standards', 'Faïence entrée de gamme']::text[]),
  ('default', 'salle_de_bain', 'standard', round(1200::numeric / 1.10, 2), round(1800::numeric / 1.10, 2), array['Douche ou baignoire', 'Faïence milieu de gamme']::text[]),
  ('default', 'salle_de_bain', 'premium', round(1800::numeric / 1.10, 2), round(3500::numeric / 1.10, 2), array['Matériaux nobles', 'Équipements premium']::text[]),
  ('default', 'cuisine', 'economique', round(700::numeric / 1.10, 2), round(1000::numeric / 1.10, 2), array['Revêtements sol/murs entrée de gamme', 'Mise aux normes électrique simple']::text[]),
  ('default', 'cuisine', 'standard', round(1000::numeric / 1.10, 2), round(1500::numeric / 1.10, 2), array['Crédence qualité', 'Prises multiples']::text[]),
  ('default', 'cuisine', 'premium', round(1500::numeric / 1.10, 2), round(3000::numeric / 1.10, 2), array['Finitions haut de gamme', 'Éclairage intégré']::text[]),
  ('default', 'salon', 'economique', round(300::numeric / 1.10, 2), round(500::numeric / 1.10, 2), array['Sol stratifié', 'Peinture mate']::text[]),
  ('default', 'salon', 'standard', round(500::numeric / 1.10, 2), round(800::numeric / 1.10, 2), array['Parquet stratifié HD', 'Points lumineux']::text[]),
  ('default', 'salon', 'premium', round(800::numeric / 1.10, 2), round(1500::numeric / 1.10, 2), array['Parquet massif', 'Éclairage scénographique']::text[]),
  -- chambre / autre : grille alignée backend (base × tier_mult × low/high factor)
  ('default', 'chambre', 'economique', round((85 * 0.78 * 0.85)::numeric, 2), round((85 * 0.78 * 1.15)::numeric, 2), array['Sol stratifié', 'Peinture']::text[]),
  ('default', 'chambre', 'standard', round((85 * 1.0 * 0.85)::numeric, 2), round((85 * 1.0 * 1.15)::numeric, 2), array['Parquet stratifié', 'Éclairage']::text[]),
  ('default', 'chambre', 'premium', round((85 * 1.32 * 0.85)::numeric, 2), round((85 * 1.32 * 1.15)::numeric, 2), array['Finitions premium']::text[]),
  ('default', 'autre', 'economique', round((110 * 0.78 * 0.85)::numeric, 2), round((110 * 0.78 * 1.15)::numeric, 2), array['Finitions propres']::text[]),
  ('default', 'autre', 'standard', round((110 * 1.0 * 0.85)::numeric, 2), round((110 * 1.0 * 1.15)::numeric, 2), array['Finitions contemporaines']::text[]),
  ('default', 'autre', 'premium', round((110 * 1.32 * 0.85)::numeric, 2), round((110 * 1.32 * 1.15)::numeric, 2), array['Finitions haut de gamme']::text[]),
  -- pièces « techniques » : même ordre de grandeur que salon (placeholder MVP)
  ('default', 'wc', 'economique', round(350::numeric / 1.10, 2), round(550::numeric / 1.10, 2), array['Carrelage mural', 'Sanitaire standard']::text[]),
  ('default', 'wc', 'standard', round(500::numeric / 1.10, 2), round(750::numeric / 1.10, 2), array['Faïence grand format']::text[]),
  ('default', 'wc', 'premium', round(750::numeric / 1.10, 2), round(1100::numeric / 1.10, 2), array['Finitions premium']::text[]),
  ('default', 'bureau', 'economique', round(320::numeric / 1.10, 2), round(520::numeric / 1.10, 2), array['Peinture', 'Sol stratifié']::text[]),
  ('default', 'bureau', 'standard', round(480::numeric / 1.10, 2), round(720::numeric / 1.10, 2), array['Sol stratifié HD']::text[]),
  ('default', 'bureau', 'premium', round(700::numeric / 1.10, 2), round(1100::numeric / 1.10, 2), array['Finitions bureau premium']::text[]),
  ('default', 'buanderie', 'economique', round(380::numeric / 1.10, 2), round(580::numeric / 1.10, 2), array['Évacuations', 'Carrelage']::text[]),
  ('default', 'buanderie', 'standard', round(520::numeric / 1.10, 2), round(780::numeric / 1.10, 2), array['Meuble vasque simple']::text[]),
  ('default', 'buanderie', 'premium', round(720::numeric / 1.10, 2), round(1050::numeric / 1.10, 2), array['Agencement sur mesure']::text[]),
  ('default', 'couloir', 'economique', round(280::numeric / 1.10, 2), round(480::numeric / 1.10, 2), array['Peinture', 'Sol vinyle']::text[]),
  ('default', 'couloir', 'standard', round(420::numeric / 1.10, 2), round(650::numeric / 1.10, 2), array['Parquet stratifié']::text[]),
  ('default', 'couloir', 'premium', round(620::numeric / 1.10, 2), round(950::numeric / 1.10, 2), array['Parquet massif', 'Moulures']::text[])
on conflict (specialty, room_type, tier) do nothing;

-- Copies métier (même chiffres — à personnaliser dans le produit plus tard)
insert into public.catalog_templates (specialty, room_type, tier, price_min_ht, price_max_ht, included_services)
select s.specialty, t.room_type, t.tier, t.price_min_ht, t.price_max_ht, t.included_services
from public.catalog_templates t
cross join (
  select unnest(array[
    'plombier',
    'electricien',
    'peintre',
    'carreleur',
    'cuisiniste',
    'salle_de_bain_sp',
    'tout_corps_etat'
  ]) as specialty
) s
where t.specialty = 'default'
on conflict (specialty, room_type, tier) do nothing;
