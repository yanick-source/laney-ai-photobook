export interface FontOption {
  value: string;
  label: string;
  category: "sans-serif" | "serif" | "display" | "handwriting" | "monospace";
}

export const FONT_LIBRARY: FontOption[] = [
  // --- Sans Serif (Clean, Modern) ---
  { value: "Inter", label: "Inter", category: "sans-serif" },
  { value: "Roboto", label: "Roboto", category: "sans-serif" },
  { value: "Open Sans", label: "Open Sans", category: "sans-serif" },
  { value: "Montserrat", label: "Montserrat", category: "sans-serif" },
  { value: "Lato", label: "Lato", category: "sans-serif" },
  { value: "Poppins", label: "Poppins", category: "sans-serif" },
  { value: "Raleway", label: "Raleway", category: "sans-serif" },
  { value: "Oswald", label: "Oswald", category: "sans-serif" },
  { value: "Quicksand", label: "Quicksand", category: "sans-serif" },
  { value: "Nunito", label: "Nunito", category: "sans-serif" },

  // --- Serif (Elegant, Classic) ---
  { value: "Playfair Display", label: "Playfair Display", category: "serif" },
  { value: "Merriweather", label: "Merriweather", category: "serif" },
  { value: "Lora", label: "Lora", category: "serif" },
  { value: "PT Serif", label: "PT Serif", category: "serif" },
  { value: "Roboto Slab", label: "Roboto Slab", category: "serif" },
  { value: "Cinzel", label: "Cinzel", category: "serif" },
  { value: "Libre Baskerville", label: "Libre Baskerville", category: "serif" },
  { value: "Cormorant Garamond", label: "Cormorant", category: "serif" },

  // --- Handwriting & Script (Personal, Fun) ---
  { value: "Dancing Script", label: "Dancing Script", category: "handwriting" },
  { value: "Pacifico", label: "Pacifico", category: "handwriting" },
  { value: "Caveat", label: "Caveat", category: "handwriting" },
  { value: "Satisfy", label: "Satisfy", category: "handwriting" },
  { value: "Great Vibes", label: "Great Vibes", category: "handwriting" },
  { value: "Sacramento", label: "Sacramento", category: "handwriting" },
  { value: "Indie Flower", label: "Indie Flower", category: "handwriting" },
  { value: "Permanent Marker", label: "Permanent Marker", category: "handwriting" },
  { value: "Amatic SC", label: "Amatic SC", category: "handwriting" },
  { value: "Shadows Into Light", label: "Shadows Into Light", category: "handwriting" },

  // --- Display (Bold, Unique) ---
  { value: "Lobster", label: "Lobster", category: "display" },
  { value: "Abril Fatface", label: "Abril Fatface", category: "display" },
  { value: "Bebas Neue", label: "Bebas Neue", category: "display" },
  { value: "Anton", label: "Anton", category: "display" },
  { value: "Righteous", label: "Righteous", category: "display" },
  { value: "Comfortaa", label: "Comfortaa", category: "display" },
  { value: "Fredoka One", label: "Fredoka", category: "display" },
  { value: "Monoton", label: "Monoton", category: "display" },
];