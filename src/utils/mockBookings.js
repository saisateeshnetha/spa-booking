import {
  BOOKING_CARD,
  SCHEDULE_END_MIN,
  SCHEDULE_START_MIN,
  THERAPISTS,
} from "./constants.js";

const servicePool = [
  { name: "60 Min Tui Na / Acupressure", cardKey: "tuiNa" },
  { name: "60 Min Slimming Massage", cardKey: "slimming" },
  { name: "60 Min Tui Na for Kids", cardKey: "kids" },
  { name: "60 Min Swedish / Relaxing Massage", cardKey: "swedish" },
  { name: "120 Mins Body Therapy", cardKey: "bodyTherapy" },
  { name: "30 Mins Foot Reflexology", cardKey: "foot" },
];

const names = [
  "Victoria Baker",
  "Yashika Yeo",
  "Gerald Tan",
  "Ava Lim",
  "Darren Lee",
  "Nora Ibrahim",
  "Khai Lin",
  "Emily Tan",
];

function seeded(index) {
  const x = Math.sin(index * 9301 + 49297) * 233280;
  return Math.abs(x - Math.floor(x));
}

function randomInt(index, min, maxInclusive) {
  return Math.floor(seeded(index) * (maxInclusive - min + 1)) + min;
}

export function buildSeedBookings(count = 2000) {
  const list = [];
  const span = SCHEDULE_END_MIN - SCHEDULE_START_MIN;
  for (let i = 0; i < count; i += 1) {
    const service = servicePool[i % servicePool.length];
    const therapist = THERAPISTS[i % THERAPISTS.length];
    const durationPool = [30, 45, 60, 90, 120];
    const durationMin = durationPool[i % durationPool.length];
    const maxOffset = Math.max(0, span - durationMin);
    const startOffset = randomInt(i + 11, 0, maxOffset);
    const roughStart = SCHEDULE_START_MIN + startOffset;
    const startMin = Math.floor(roughStart / 15) * 15;
    const status =
      i % 17 === 0
        ? "completed"
        : i % 9 === 0
          ? "checkIn"
          : i % 16 === 0
            ? "cancelled"
            : "confirmed";
    const clientName = names[i % names.length];
    list.push({
      id: `seed-${i + 1}`,
      therapistId: therapist.id,
      therapist,
      startMin,
      durationMin,
      service: service.name,
      clientPhone: `9${String(1000000 + i).slice(-7)}`,
      clientName,
      status,
      cardKey: service.cardKey,
      bg: BOOKING_CARD[service.cardKey]?.bg ?? "#E5E7EB",
      room: i % 5 === 0 ? "806 Couples Room" : undefined,
      requests: i % 4 === 0 ? "Soft, China" : undefined,
      notes: i % 3 === 0 ? "Please avoid strong essential oils." : undefined,
      requestedTherapist: i % 7 === 0,
      requestedRoom: i % 11 === 0,
    });
  }
  return list;
}
