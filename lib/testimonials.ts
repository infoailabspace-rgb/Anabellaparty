export type Testimonial = {
  text: string;
  author: string;
  event: string;
  rating: number; // 1–5
};

// [JĀAPSTIPRINA] — Robertam: 3–5 reālas atsauksmes ar vārdiem.
export const testimonials: Testimonial[] = [
  {
    text: "Foto kaste bija mūsu kāzu ballītes highlight! Viesi to nemaz negribēja atstāt, un izdrukas sanāca lieliskas.",
    author: "Laura & Jānis",
    event: "Kāzas",
    rating: 5,
  },
  {
    text: "Profesionāla komanda, viss laikā un skaisti. Bērni bija sajūsmā par piepūšamo pili.",
    author: "Kristīne",
    event: "Bērnu ballīte",
    rating: 5,
  },
  {
    text: "Aukstās dzirksteles radīja neaizmirstamu momentu pirmajai dejai. Noteikti rezervēsim atkal!",
    author: "Artūrs",
    event: "Kāzas",
    rating: 5,
  },
  {
    text: "Korporatīvajam pasākumam pasūtījām foto kasti un audio grāmatu — abi bija tieši mērķī. Iesakām!",
    author: "SIA „Rīgas nams”",
    event: "Korporatīvais pasākums",
    rating: 5,
  },
];
