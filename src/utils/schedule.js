import {
  SCHEDULE_END_MIN,
  SCHEDULE_START_MIN,
  SLOT_HEIGHT_PX,
  SLOT_MINUTES,
} from "./constants.js";

export function minutesToTopPx(startMin) {
  const rel = startMin - SCHEDULE_START_MIN;
  return (rel / SLOT_MINUTES) * SLOT_HEIGHT_PX;
}

export function durationToHeightPx(durationMin) {
  return (durationMin / SLOT_MINUTES) * SLOT_HEIGHT_PX;
}

export function totalScheduleHeightPx() {
  const span = SCHEDULE_END_MIN - SCHEDULE_START_MIN;
  return (span / SLOT_MINUTES) * SLOT_HEIGHT_PX;
}

export function formatTimeLabel(minutesFromMidnight) {
  const h24 = Math.floor(minutesFromMidnight / 60);
  const m = minutesFromMidnight % 60;
  const ampm = h24 >= 12 ? "PM" : "AM";
  const h12 = h24 % 12 || 12;
  const mm = String(m).padStart(2, "0");
  return `${h12}.${mm} ${ampm}`;
}

export function slotIndexFromMinutes(minutesFromMidnight) {
  return Math.floor((minutesFromMidnight - SCHEDULE_START_MIN) / SLOT_MINUTES);
}

export function totalSlotCount() {
  return (SCHEDULE_END_MIN - SCHEDULE_START_MIN) / SLOT_MINUTES;
}

export function hourStartMinutesList() {
  const list = [];
  for (let m = SCHEDULE_START_MIN; m < SCHEDULE_END_MIN; m += 60) {
    list.push(m);
  }
  return list;
}
