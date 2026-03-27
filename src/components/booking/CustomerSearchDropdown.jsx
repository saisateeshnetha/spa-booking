import { useMemo, useState, useRef } from "react";
import { Search, Sparkles } from "lucide-react";

const CLIENTS = [
  { name: "Akiko Goma", phone: "+65 9876 5432" },
  { name: "Beng Shun Qiu", phone: "+65 9123 1001" },
  { name: "Chang Yeh Hong", phone: "+65 9000 2211" },
  { name: "Diwakar Reddy", phone: "+65 8333 4411" },
  { name: "Eric Tan", phone: "+65 8111 2222" },
  { name: "Felicia Wang Johannsdottir", phone: "+65 9777 8888" },
  { name: "Akira Tanaka", phone: "+65 9001 0001" },
  { name: "Akira Lim", phone: "+65 9001 0002" },
  { name: "Akira Chua", phone: "+65 9001 0003" },
];

function highlightName(name, q) {
  if (!q) return <span className="font-semibold text-[#111827]">{name}</span>;
  const lower = name.toLowerCase();
  const idx = lower.indexOf(q.toLowerCase());
  if (idx !== 0)
    return <span className="font-semibold text-[#111827]">{name}</span>;
  const match = name.slice(0, q.length);
  const rest = name.slice(q.length);
  return (
    <span className="font-semibold">
      <span className="text-[#B45309]">{match}</span>
      <span className="text-[#111827]">{rest}</span>
    </span>
  );
}

export function CustomerSearchDropdown({ onSelect }) {
  const [q, setQ] = useState("");
  const searchInputRef = useRef(null);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return CLIENTS;
    return CLIENTS.filter((c) => c.name.toLowerCase().startsWith(s));
  }, [q]);

  return (
    <div className="rounded-lg bg-white shadow-[0_10px_40px_rgba(15,23,42,0.12)]">
      <div className="flex items-center gap-2 border-b border-[#F3F4F6] px-3 py-2.5 text-[#9333EA]">
        <button
          type="button"
          className="rounded p-0.5 hover:bg-[#F3E8FF]"
          aria-label="Customer directory"
          onClick={() => searchInputRef.current?.focus()}
        >
          <Sparkles className="h-4 w-4" />
        </button>
        <div className="text-[14px] font-semibold">Customer</div>
      </div>
      <div className="p-2">
        <div className="flex h-10 items-center gap-2 rounded-lg bg-[#F5F5F5] px-3">
          <button
            type="button"
            className="flex shrink-0 text-[#9CA3AF] hover:text-[#374151]"
            aria-label="Focus search"
            onClick={() => searchInputRef.current?.focus()}
          >
            <Search className="h-4 w-4" />
          </button>
          <input
            ref={searchInputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search..."
            className="h-full w-full bg-transparent text-[14px] text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none"
          />
        </div>
        <div className="mt-2 max-h-[220px] overflow-y-auto rounded-lg bg-white scrollbar-thin">
          {filtered.map((c, idx) => {
            const active = idx === 0 && q.trim().length >= 2;
            return (
              <button
                key={c.name + c.phone}
                type="button"
                onClick={() => onSelect?.(c)}
                className={`flex w-full flex-col items-start px-3 py-2 text-left ${
                  active ? "bg-[#3E2723]" : "hover:bg-[#F9FAFB]"
                }`}
              >
                <div className="text-[14px] leading-tight">
                  {active ? (
                    <span className="font-semibold text-white">
                      <span className="text-[#B45309]">
                        {c.name.slice(0, q.trim().length)}
                      </span>
                      <span className="text-white">
                        {c.name.slice(q.trim().length)}
                      </span>
                    </span>
                  ) : (
                    highlightName(c.name, q.trim())
                  )}
                </div>
                <div
                  className={`mt-0.5 text-[12px] ${active ? "text-white/80" : "text-[#9CA3AF]"}`}
                >
                  {c.phone}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
