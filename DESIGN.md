# Refonte design — Eylow

## Direction visuelle
Fond noir profond partout, avec une symbiose rose/violet inspirée d'Apple Music
et de l'écosystème Apple : halos de couleur diffus, verre dépoli (glassmorphism),
coins arrondis généreux, dégradés de texte, et une police système (Inter, avec
`-apple-system` en priorité pour afficher la vraie SF Pro sur les appareils Apple).

Composants clés retravaillés :
- **Nav** : pill flottante en verre dépoli.
- **Hero** : halos rose/violet animés + visualiseur audio en dégradé.
- **Morceaux** : liste façon Apple Music, pochette dégradée avec bouton play au survol.
- **Lecteur** : mini-player flottant en bas d'écran, en verre.
- **Intro** : séquence de chargement épurée, dégradé de texte, sans effet glitch.

## Paroles synchronisées au rythme (nouveau composant `LyricsView`)
Le champ `lyrics` reste un simple texte en base — aucune migration nécessaire.
Deux modes automatiques :

1. **Synchronisation exacte** : si le texte collé est au format LRC standard
   (`[mm:ss.xx] texte`, exporté par la plupart des logiciels de sous-titrage
   audio/karaoké), chaque ligne a un horodatage précis et le défilement colle
   parfaitement à la voix.
2. **Estimation intelligente** (par défaut, texte brut sans minutage) : les
   lignes sont réparties sur la durée réelle du morceau au prorata de leur
   longueur en caractères, ce qui donne un rythme de lecture crédible même
   sans minutage manuel.

Dans les deux cas :
- Un **balayage mot par mot** façon karaoké illumine la ligne en cours.
- La ligne active **pulse en direct avec l'énergie audio** du morceau (analyse
  du spectre de fréquences via Web Audio API), donnant l'impression que le
  texte respire avec la musique.
- Vue plein écran immersive avec fond flouté animé, façon "paroles" d'Apple Music.

Pour un calage parfait sur un morceau précis, il suffit de coller ses paroles
au format LRC dans le champ existant depuis l'interface admin — aucun
changement de base de données requis.

## Ce qui n'a pas changé
Architecture Next.js / Supabase, routes API, authentification admin, upload
audio et photo : tout reste identique, seule la couche visuelle et le panneau
de paroles ont été refaits.
