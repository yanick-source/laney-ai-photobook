export interface StickerCategory {
  id: string;
  label: string;
  icon: string;
  items: StickerItem[];
}

export interface StickerItem {
  id: string;
  src: string;
  alt: string;
}

// Official Microsoft Repo for STATIC 3D Emojis (High Res, Transparent PNGs)
// Pattern: assets/[Folder Name]/3D/[file_name]_3d.png
const BASE_URL = "https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets";

export const STICKER_LIBRARY: StickerCategory[] = [
  {
    id: 'travel',
    label: 'Travel',
    icon: '✈️',
    items: [
      { id: 'tr-1', alt: 'Airplane', src: `${BASE_URL}/Airplane/3D/airplane_3d.png` },
      { id: 'tr-2', alt: 'Camera', src: `${BASE_URL}/Camera%20with%20flash/3D/camera_with_flash_3d.png` },
      { id: 'tr-3', alt: 'Globe', src: `${BASE_URL}/Globe%20showing%20Europe-Africa/3D/globe_showing_europe-africa_3d.png` },
      { id: 'tr-4', alt: 'Luggage', src: `${BASE_URL}/Luggage/3D/luggage_3d.png` },
      { id: 'tr-5', alt: 'Beach Umbrella', src: `${BASE_URL}/Umbrella%20on%20ground/3D/umbrella_on_ground_3d.png` },
      { id: 'tr-6', alt: 'Passport', src: `${BASE_URL}/Passport%20control/3D/passport_control_3d.png` },
    ]
  },
  {
    id: 'wedding',
    label: 'Wedding',
    icon: '💍',
    items: [
      { id: 'wd-1', alt: 'Ring', src: `${BASE_URL}/Ring/3D/ring_3d.png` },
      { id: 'wd-2', alt: 'Cake', src: `${BASE_URL}/Birthday%20cake/3D/birthday_cake_3d.png` },
      { id: 'wd-3', alt: 'Bouquet', src: `${BASE_URL}/Bouquet/3D/bouquet_3d.png` },
      { id: 'wd-4', alt: 'Champagne', src: `${BASE_URL}/Bottle%20with%20popping%20cork/3D/bottle_with_popping_cork_3d.png` },
      { id: 'wd-5', alt: 'Love Letter', src: `${BASE_URL}/Love%20letter/3D/love_letter_3d.png` },
      { id: 'wd-6', alt: 'Dove', src: `${BASE_URL}/Dove/3D/dove_3d.png` },
    ]
  },
  {
    id: 'baby',
    label: 'Baby',
    icon: '👶',
    items: [
      { id: 'bb-1', alt: 'Baby Bottle', src: `${BASE_URL}/Baby%20bottle/3D/baby_bottle_3d.png` },
      { id: 'bb-2', alt: 'Teddy Bear', src: `${BASE_URL}/Teddy%20bear/3D/teddy_bear_3d.png` },
      { id: 'bb-3', alt: 'Baby Angel', src: `${BASE_URL}/Baby%20angel/3D/baby_angel_3d.png` },
      { id: 'bb-4', alt: 'Safety Pin', src: `${BASE_URL}/Safety%20pin/3D/safety_pin_3d.png` },
      { id: 'bb-5', alt: 'Balloon', src: `${BASE_URL}/Balloon/3D/balloon_3d.png` },
    ]
  },
  {
    id: 'fun',
    label: 'Fun',
    icon: '⭐',
    items: [
      { id: 'sh-1', alt: 'Star', src: `${BASE_URL}/Glowing%20star/3D/glowing_star_3d.png` },
      { id: 'sh-2', alt: 'Heart', src: `${BASE_URL}/Heart%20with%20arrow/3D/heart_with_arrow_3d.png` },
      { id: 'sh-3', alt: 'Sparkles', src: `${BASE_URL}/Sparkles/3D/sparkles_3d.png` },
      { id: 'sh-4', alt: 'Party Popper', src: `${BASE_URL}/Party%20popper/3D/party_popper_3d.png` },
      { id: 'sh-5', alt: 'Fire', src: `${BASE_URL}/Fire/3D/fire_3d.png` },
    ]
  },
  {
    id: 'food',
    label: 'Food',
    icon: '🍕',
    items: [
      { id: 'fd-1', alt: 'Pizza', src: `${BASE_URL}/Pizza/3D/pizza_3d.png` },
      { id: 'fd-2', alt: 'Burger', src: `${BASE_URL}/Hamburger/3D/hamburger_3d.png` },
      { id: 'fd-3', alt: 'Ice Cream', src: `${BASE_URL}/Soft%20ice%20cream/3D/soft_ice_cream_3d.png` },
      { id: 'fd-4', alt: 'Donut', src: `${BASE_URL}/Doughnut/3D/doughnut_3d.png` },
    ]
  }
];