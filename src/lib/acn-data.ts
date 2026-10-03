export type Hue = "teal" | "purple" | "amber";

export type Store = {
  id: string;
  name: string;
  icon: string;
  cat: string;
  hue: Hue;
  dist: number; // in meters (20m - 50m outdoor, 5m - 20m indoor)
  item: string;
  open: number;
  tag: string;
  image: string; // Product photo of the item on special
  specialBadge?: string;
  lat: number; // simulated GPS latitude offset
  lng: number; // simulated GPS longitude offset
  bearing: number; // 0-360 degrees bearing angle from user location
  bleBeaconId?: string; // Indoor Bluetooth Low Energy node UUID
  rssi?: number; // BLE signal strength in dBm (-35 to -85)
};

// Curated high-quality, fast-loading Unsplash product photos for items on special
export const INDOOR: Store[] = [
  {
    id: "zara",
    name: "Zara",
    icon: "👗",
    cat: "Fashion",
    hue: "purple",
    dist: 6,
    item: "Oversized Wool Hoodie",
    open: 899,
    tag: "Hoodies",
    image:
      "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=600&q=80",
    specialBadge: "FLASH 40% OFF",
    lat: -33.92487,
    lng: 18.42405,
    bearing: 45, // North-East (Mall Aisle 1)
    bleBeaconId: "acn-ble-zara-01",
    rssi: -42,
  },
  {
    id: "nespresso",
    name: "Nespresso Bar",
    icon: "☕",
    cat: "Coffee aisle",
    hue: "amber",
    dist: 9,
    item: "Flat White + Croissant",
    open: 85,
    tag: "Coffee",
    image:
      "https://images.unsplash.com/photo-1509785307050-d4066910ec1e?auto=format&fit=crop&w=600&q=80",
    specialBadge: "MORNING COMBO",
    lat: -33.92492,
    lng: 18.42412,
    bearing: 90, // East (Central atrium)
    bleBeaconId: "acn-ble-nesp-02",
    rssi: -48,
  },
  {
    id: "istore",
    name: "iStore",
    icon: "📱",
    cat: "Electronics",
    hue: "teal",
    dist: 14,
    item: "AirPods Pro 2",
    open: 5499,
    tag: "Audio",
    image:
      "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=600&q=80",
    specialBadge: "MEMBER SPECIAL",
    lat: -33.92498,
    lng: 18.42395,
    bearing: 135, // South-East
    bleBeaconId: "acn-ble-apple-03",
    rssi: -58,
  },
  {
    id: "nike",
    name: "Nike Lab",
    icon: "👟",
    cat: "Sportswear",
    hue: "teal",
    dist: 11,
    item: "Pegasus 41 Running Shoes",
    open: 2599,
    tag: "Shoes",
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80",
    specialBadge: "RUNNER DROP",
    lat: -33.92483,
    lng: 18.42398,
    bearing: 180, // South
    bleBeaconId: "acn-ble-nike-04",
    rssi: -52,
  },
  {
    id: "sushi",
    name: "Kauai Sushi Bar",
    icon: "🍣",
    cat: "Food court",
    hue: "purple",
    dist: 17,
    item: "Salmon Rainbow Platter",
    open: 189,
    tag: "Sushi",
    image:
      "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=600&q=80",
    specialBadge: "CHEF SPECIAL",
    lat: -33.92478,
    lng: 18.42418,
    bearing: 225, // South-West
    bleBeaconId: "acn-ble-sushi-05",
    rssi: -64,
  },
  {
    id: "aesop",
    name: "Aesop",
    icon: "🧴",
    cat: "Beauty",
    hue: "amber",
    dist: 8,
    item: "Resurrection Hand Balm",
    open: 520,
    tag: "Skincare",
    image:
      "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=600&q=80",
    specialBadge: "LUXURY GIFT",
    lat: -33.92485,
    lng: 18.42422,
    bearing: 270, // West
    bleBeaconId: "acn-ble-aesop-06",
    rssi: -45,
  },
  {
    id: "hm",
    name: "H&M Studio",
    icon: "🧥",
    cat: "Fashion",
    hue: "purple",
    dist: 19,
    item: "Puffer Jacket",
    open: 1299,
    tag: "Jackets",
    image:
      "https://images.unsplash.com/photo-1544923246-77307dd654cb?auto=format&fit=crop&w=600&q=80",
    specialBadge: "SEASON CLEARANCE",
    lat: -33.92472,
    lng: 18.42411,
    bearing: 315, // North-West
    bleBeaconId: "acn-ble-hm-07",
    rssi: -68,
  },
  {
    id: "exclusive",
    name: "Exclusive Books",
    icon: "📚",
    cat: "Books",
    hue: "teal",
    dist: 13,
    item: "Signed Hardcover Bundle",
    open: 640,
    tag: "Books",
    image:
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80",
    specialBadge: "AUTHOR EXCLUSIVE",
    lat: -33.92479,
    lng: 18.42392,
    bearing: 0, // North
    bleBeaconId: "acn-ble-books-08",
    rssi: -55,
  },
  {
    id: "lindt",
    name: "Lindt Boutique",
    icon: "🍫",
    cat: "Confectionery",
    hue: "amber",
    dist: 5,
    item: "Truffle Gift Box",
    open: 320,
    tag: "Gifts",
    image:
      "https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=600&q=80",
    specialBadge: "BUY 1 GET 1",
    lat: -33.92484,
    lng: 18.42408,
    bearing: 60, // North-East
    bleBeaconId: "acn-ble-lindt-09",
    rssi: -38,
  },
];

export const OUTDOOR: Store[] = [
  {
    id: "vida",
    name: "Vida e Caffè",
    icon: "☕",
    cat: "Street café",
    hue: "amber",
    dist: 22,
    item: "Double Cappuccino",
    open: 48,
    tag: "Coffee",
    image:
      "https://images.unsplash.com/photo-1534778101976-62847782c213?auto=format&fit=crop&w=600&q=80",
    specialBadge: "2-FOR-1 COMMUTE",
    lat: -33.92505,
    lng: 18.42425,
    bearing: 30, // North-North-East
    bleBeaconId: "acn-gps-vida-10",
    rssi: -72,
  },
  {
    id: "incredible",
    name: "Incredible Connection",
    icon: "💻",
    cat: "Electronics",
    hue: "teal",
    dist: 41,
    item: "Mechanical Keyboard",
    open: 1899,
    tag: "Tech",
    image:
      "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=600&q=80",
    specialBadge: "GAMER DEALS",
    lat: -33.9252,
    lng: 18.42435,
    bearing: 75, // East-North-East
    bleBeaconId: "acn-gps-tech-11",
    rssi: -79,
  },
  {
    id: "adidas",
    name: "Adidas Originals",
    icon: "👟",
    cat: "Sneakers",
    hue: "teal",
    dist: 35,
    item: "Samba OG",
    open: 2199,
    tag: "Shoes",
    image:
      "https://images.unsplash.com/photo-1518002171953-a080ee817e1f?auto=format&fit=crop&w=600&q=80",
    specialBadge: "LIMITED DROP",
    lat: -33.92528,
    lng: 18.42415,
    bearing: 120, // East-South-East
    bleBeaconId: "acn-gps-adidas-12",
    rssi: -76,
  },
  {
    id: "kfc",
    name: "Mochi Ramen House",
    icon: "🍜",
    cat: "Restaurant",
    hue: "purple",
    dist: 28,
    item: "Tonkotsu Ramen",
    open: 165,
    tag: "Ramen",
    image:
      "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=600&q=80",
    specialBadge: "LUNCH SPECIAL",
    lat: -33.92518,
    lng: 18.42385,
    bearing: 160, // South-South-East
    bleBeaconId: "acn-gps-ramen-13",
    rssi: -74,
  },
  {
    id: "markham",
    name: "Markham",
    icon: "👔",
    cat: "Menswear",
    hue: "purple",
    dist: 46,
    item: "Slim Chino + Tee Combo",
    open: 799,
    tag: "Fashion",
    image:
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80",
    specialBadge: "SUMMER ESSENTIAL",
    lat: -33.92535,
    lng: 18.42375,
    bearing: 200, // South-South-West
    bleBeaconId: "acn-gps-mark-14",
    rssi: -82,
  },
  {
    id: "dischem",
    name: "Dis-Chem",
    icon: "💊",
    cat: "Pharmacy",
    hue: "teal",
    dist: 31,
    item: "Vitamin C Bundle",
    open: 260,
    tag: "Health",
    image:
      "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80",
    specialBadge: "HEALTH REWARDS",
    lat: -33.9251,
    lng: 18.42365,
    bearing: 240, // West-South-West
    bleBeaconId: "acn-gps-pharm-15",
    rssi: -75,
  },
  {
    id: "woolies",
    name: "Woolworths Food",
    icon: "🥑",
    cat: "Grocer",
    hue: "amber",
    dist: 49,
    item: "Weekend Brunch Box",
    open: 410,
    tag: "Groceries",
    image:
      "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80",
    specialBadge: "FRESH HARVEST",
    lat: -33.9254,
    lng: 18.4236,
    bearing: 280, // West-North-West
    bleBeaconId: "acn-gps-wool-16",
    rssi: -84,
  },
  {
    id: "cotton",
    name: "Cotton On",
    icon: "🧢",
    cat: "Streetwear",
    hue: "purple",
    dist: 38,
    item: "Graphic Hoodie",
    open: 499,
    tag: "Hoodies",
    image:
      "https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=600&q=80",
    specialBadge: "STREETWEAR DROP",
    lat: -33.92512,
    lng: 18.4235,
    bearing: 310, // North-West
    bleBeaconId: "acn-gps-cotton-17",
    rssi: -78,
  },
  {
    id: "sushi2",
    name: "Tokyo Street Sushi",
    icon: "🍣",
    cat: "Takeaway",
    hue: "amber",
    dist: 25,
    item: "Dragon Roll Combo",
    open: 210,
    tag: "Sushi",
    image:
      "https://images.unsplash.com/photo-1611143669185-af224c5e3252?auto=format&fit=crop&w=600&q=80",
    specialBadge: "DAILY SPECIAL",
    lat: -33.92475,
    lng: 18.42368,
    bearing: 345, // North-North-West
    bleBeaconId: "acn-gps-sushi2-18",
    rssi: -73,
  },
  {
    id: "samsung",
    name: "Samsung Experience",
    icon: "⌚",
    cat: "Electronics",
    hue: "teal",
    dist: 44,
    item: "Galaxy Watch 7",
    open: 5999,
    tag: "Wearables",
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80",
    specialBadge: "FLAGSHIP LAUNCH",
    lat: -33.92465,
    lng: 18.4242,
    bearing: 15, // North-North-East
    bleBeaconId: "acn-gps-sam-19",
    rssi: -80,
  },
  {
    id: "bike",
    name: "Cycle Lab",
    icon: "🚲",
    cat: "Outdoor",
    hue: "purple",
    dist: 33,
    item: "Smart Bike Light",
    open: 690,
    tag: "Cycling",
    image:
      "https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=600&q=80",
    specialBadge: "COMMUTER PACK",
    lat: -33.9249,
    lng: 18.42445,
    bearing: 100, // East
    bleBeaconId: "acn-gps-bike-20",
    rssi: -77,
  },
];

export const TICKS = [
  "Agent negotiating {tag}…",
  "Price dropped by {n}%…",
  "Checking stock levels…",
  "Loyalty points verified",
  "Counter-offer sent: R{p}",
  "Bundling discount detected",
  "Handshake signed ✓",
  "Comparing 3 nearby rivals…",
];

export const hueVar: Record<Hue, string> = {
  teal: "var(--primary)",
  purple: "var(--secondary)",
  amber: "var(--accent)",
};

export const fill = (t: string, s: Store) =>
  t
    .replace("{tag}", s.tag.toLowerCase())
    .replace("{n}", String(5 + Math.floor(Math.random() * 20)))
    .replace("{p}", String(Math.round(s.open * (0.7 + Math.random() * 0.2))));
