export interface Track {
  id: string;
  name: string;
  url: string;
  duration: string | null;
  size: string | null;
  storage_path: string | null;
  lyrics: string | null;
  created_at?: string;
}

export interface SiteSettings {
  artist_name: string;
  hero_tagline: string;
  hero_desc: string;
  about_text_1: string;
  about_text_2: string;
  stat_eps: string;
  stat_years: string;
  photo_url: string | null;
  email: string;
  instagram_url: string;
  bandlab_url: string;
}

export const DEFAULT_SETTINGS: SiteSettings = {
  artist_name: "Eylow",
  hero_tagline: "Artiste · Compositeur",
  hero_desc: "Autodidacte. J'explore les frontières du son.",
  about_text_1:
    "Musicien depuis l'enfance, je compose des univers sonores qui transcendent les genres. Ma musique est un voyage entre la mélodie et l'électronique, l'ambient et les rythmes organiques du rap français et du Cameroun, ma terre natale.",
  about_text_2: "Chaque son est une décision consciente, un choix délibéré.",
  stat_eps: "01",
  stat_years: "5+",
  photo_url: null,
  email: "lowcreative.contact@gmail.com",
  instagram_url:
    "https://www.instagram.com/eylovv_?igsh=MWp6MHdoNm93YjJveA%3D%3D&utm_source=qr",
  bandlab_url: "https://www.bandlab.com/olk_eylow",
};
