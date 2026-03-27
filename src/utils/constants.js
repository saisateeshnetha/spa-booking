export const HEADER_BG = "#332314";
export const NAV_ACTIVE = "#D4AF37";
export const THERAPIST_FEMALE = "#EC4899";
export const THERAPIST_MALE = "#3B82F6";

export const BOOKING_CARD = {
  tuiNa: { bg: "#BDE4F4", label: "Tui Na / Acupressure" },
  slimming: { bg: "#FADADD", label: "Slimming Massage" },
  kids: { bg: "#D1D5DB", label: "Tui Na for Kids" },
  swedish: { bg: "#CCF2F4", label: "Swedish / Relaxing Massage" },
  bodyTherapy: { bg: "#FCE4EC", label: "Body Therapy" },
  foot: { bg: "#E8F5E9", label: "Foot Reflexology" },
};

export const STATUS_THEME = {
  confirmed: { dot: "#3B82F6", cardTint: "#DBEAFE" },
  checkIn: { dot: "#EC4899", cardTint: "#FCE7F3" },
  cancelled: { dot: "#9CA3AF", cardTint: "#E5E7EB" },
  completed: { dot: "#9CA3AF", cardTint: "#E5E7EB" },
};

export const OUTLET_NAME = "Liat Towers";

export const NAV_TABS = [
  { id: "home", label: "Home" },
  { id: "therapists", label: "Therapists" },
  { id: "sales", label: "Sales" },
  { id: "clients", label: "Clients" },
  { id: "transactions", label: "Transactions" },
  { id: "reports", label: "Reports" },
];

export const OUTLETS = [
  { id: "liat-towers", name: "Liat Towers" },
  { id: "orchard", name: "Orchard" },
  { id: "marina", name: "Marina Bay" },
];

export const DISPLAY_INTERVAL_OPTIONS = ["15 Min", "30 Min", "60 Min"];

export const THERAPISTS = [
  { id: "1", name: "Chacha", gender: "Female", number: 1 },
  { id: "8", name: "James", gender: "Male", number: 8 },
  { id: "2", name: "Laksa", gender: "Female", number: 2 },
  { id: "3", name: "Lily", gender: "Female", number: 3 },
  { id: "5", name: "Mozza", gender: "Female", number: 5 },
  { id: "14", name: "Nina", gender: "Female", number: 14 },
  { id: "10", name: "Philip", gender: "Male", number: 10 },
  { id: "11", name: "Sakura", gender: "Female", number: 11 },
  { id: "12", name: "Summer", gender: "Female", number: 12 },
  { id: "13", name: "Yashika", gender: "Female", number: 13 },
  { id: "15", name: "Glory", gender: "Female", number: 15 },
];

export const SCHEDULE_START_MIN = 9 * 60;
export const SCHEDULE_END_MIN = 18 * 60;
export const SLOT_MINUTES = 15;

export const SLOT_HEIGHT_PX = 20;

export const TIME_COLUMN_WIDTH_PX = 88;
export const THERAPIST_COLUMN_WIDTH_PX = 168;
export const VISIBLE_THERAPIST_COLUMNS = 7;
