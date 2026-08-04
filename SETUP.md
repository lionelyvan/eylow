# Eylow — Mise en route

Le site a été entièrement reconstruit en Next.js (composants React, plus de fichier
HTML statique). Voici les étapes pour le faire tourner.

## 1. Variables d'environnement

Copie `.env.local.example` en `.env.local` et remplis :

```
NEXT_PUBLIC_SUPABASE_URL=...        # Project Settings > API
NEXT_PUBLIC_SUPABASE_ANON_KEY=...   # Project Settings > API (clé "anon public")
SUPABASE_SERVICE_ROLE_KEY=...       # Project Settings > API (clé "service_role" — SECRÈTE)
ADMIN_PASSWORD=...                  # le mot de passe pour activer le mode admin sur le site
SESSION_SECRET=...                  # valeur aléatoire, ex: openssl rand -hex 32
```

⚠️ `SUPABASE_SERVICE_ROLE_KEY` et `SESSION_SECRET` ne doivent **jamais** être commit ni
préfixées par `NEXT_PUBLIC_`. Elles ne sont utilisées que côté serveur (routes API).

Sur Vercel : Project Settings > Environment Variables, ajoute les 5 variables ci-dessus.

## 2. Base de données Supabase

Dans l'éditeur SQL de Supabase, exécute :

```sql
-- Table des morceaux (probablement déjà existante depuis l'ancien site)
create table if not exists tracks (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  url text not null,
  storage_path text,
  size text,
  duration text,
  lyrics text,
  created_at timestamptz default now()
);

-- Table des réglages éditables du site (nouveau — corrige le placeholder photo)
create table if not exists site_settings (
  id int primary key default 1,
  artist_name text,
  hero_tagline text,
  hero_desc text,
  about_text_1 text,
  about_text_2 text,
  stat_eps text,
  stat_years text,
  photo_url text,
  email text,
  instagram_url text,
  bandlab_url text
);

-- Sécurité : active les RLS et n'autorise QUE la lecture publique.
-- Les écritures passent désormais uniquement par les routes API (clé service_role
-- côté serveur, après vérification du mot de passe admin) — plus jamais depuis le
-- navigateur directement, contrairement à l'ancien site.
alter table tracks enable row level security;
alter table site_settings enable row level security;

create policy "Lecture publique des morceaux" on tracks
  for select using (true);

create policy "Lecture publique des réglages" on site_settings
  for select using (true);

-- Aucune policy INSERT/UPDATE/DELETE pour `anon` : ces routes bypassent les RLS
-- via la clé service_role côté serveur, donc l'admin fonctionne quand même.
```

## 3. Buckets de stockage

Dans Supabase > Storage, crée deux buckets **publics** :
- `musiques` (fichiers audio)
- `assets` (photo de l'artiste, futurs visuels)

## 4. Lancer le site

```bash
npm install
npm run dev
```

Puis va sur `http://localhost:3000`. Double-clique sur le petit point discret à côté
des liens de nav (en haut à droite) pour ouvrir la connexion admin, entre ton
`ADMIN_PASSWORD`, et tu peux uploader des morceaux, la photo, et supprimer des sons.

## Ce qui a changé par rapport à l'ancien site

- **Sécurité** : le mot de passe admin n'est plus dans le code source visible au
  navigateur. Toute action d'écriture (upload, suppression) passe par des routes API
  protégées par un cookie de session signé.
- **Photo d'artiste** : fonctionnelle (avant : simple placeholder visuel, aucun moyen
  de la changer).
- **Visualiseur** : réagit vraiment à l'audio en train de jouer (Web Audio API),
  au lieu de barres animées aléatoirement.
- **Intro cinématique** : nouvelle séquence de chargement scénarisée à l'arrivée sur
  le site (skippable, désactivée automatiquement si l'utilisateur préfère moins
  d'animations).
- **Architecture** : composants React réutilisables au lieu d'un unique fichier HTML
  de 1500 lignes — plus simple à faire évoluer.

## Pistes pour la suite (non fait, pour rester dans le périmètre demandé)

- Édition des textes (bio, tagline) directement depuis l'interface admin — la route
  `/api/settings` (PUT) existe déjà côté serveur, il ne manque qu'un petit formulaire
  admin pour l'exploiter.
- Compression/transcodage audio automatique à l'upload si tu veux réduire le poids
  des fichiers servis.
