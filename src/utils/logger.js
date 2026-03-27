const prefix = "[SPA]";
const LOG_KEY = "spa.logs.v1";
const MAX_LOG_ITEMS = 250;

function write(level, event, payload) {
  const entry = {
    ts: new Date().toISOString(),
    level,
    event,
    payload: payload ?? null,
  };
  const line = `${prefix} ${JSON.stringify(entry)}`;
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.info(line);

  try {
    const current = JSON.parse(sessionStorage.getItem(LOG_KEY) ?? "[]");
    const next = [...current, entry].slice(-MAX_LOG_ITEMS);
    sessionStorage.setItem(LOG_KEY, JSON.stringify(next));
  } catch {
    // Ignore session storage failures.
  }
}

export const logger = {
  info: (event, payload) => write("info", event, payload),
  warn: (event, payload) => write("warn", event, payload),
  error: (event, payload) => write("error", event, payload),
  action: (name, detail) => write("action", name, detail),
};
