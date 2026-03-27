import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Download } from "lucide-react";
import { THERAPISTS } from "../../utils/constants.js";
import { useAppStore } from "../../store/useAppStore.js";
import { logger } from "../../utils/logger.js";

const MOCK_SALES = [
  {
    id: "s1",
    client: "Victoria Baker",
    phone: "92214668",
    amount: 188.0,
    date: "2025-08-16",
  },
  {
    id: "s2",
    client: "Yashika Yeo",
    phone: "93369589",
    amount: 96.5,
    date: "2025-08-15",
  },
  {
    id: "s3",
    client: "Gerald Tan",
    phone: "93369589",
    amount: 72.0,
    date: "2025-08-14",
  },
];

const MOCK_TX = [
  { id: "t1", ref: "TX-10021", type: "Payment", amount: 188.0, time: "10:12" },
  { id: "t2", ref: "TX-10020", type: "Refund", amount: -20.0, time: "09:40" },
];

export function TabPlaceholderContent({ tab }) {
  const bookings = useAppStore((s) => s.bookings);
  const salesSortKey = useAppStore((s) => s.salesSortKey);
  const salesSortDir = useAppStore((s) => s.salesSortDir);
  const setSalesSort = useAppStore((s) => s.setSalesSort);
  const showToast = useAppStore((s) => s.showToast);

  const [page, setPage] = useState(1);
  const pageSize = 5;

  const clients = useMemo(() => {
    const map = new Map();
    bookings.forEach((b) => {
      const key = b.clientPhone;
      if (!map.has(key)) map.set(key, { phone: key, name: b.clientName });
    });
    return [...map.values()];
  }, [bookings]);

  const sortedSales = useMemo(() => {
    const rows = [...MOCK_SALES];
    const dir = salesSortDir === "asc" ? 1 : -1;
    rows.sort((a, b) => {
      if (salesSortKey === "amount") return (a.amount - b.amount) * dir;
      if (salesSortKey === "name")
        return a.client.localeCompare(b.client) * dir;
      return a.date.localeCompare(b.date) * dir;
    });
    return rows;
  }, [salesSortKey, salesSortDir]);

  const pagedClients = useMemo(() => {
    const start = (page - 1) * pageSize;
    return clients.slice(start, start + pageSize);
  }, [clients, page]);

  const totalPages = Math.max(1, Math.ceil(clients.length / pageSize));

  if (tab === "therapists") {
    return (
      <div className="min-h-0 flex-1 overflow-auto bg-white p-4">
        <div className="mb-3 text-[14px] font-semibold text-[#111827]">
          Therapists
        </div>
        <table className="w-full border-collapse text-left text-[13px]">
          <thead>
            <tr className="border-b border-[#E5E7EB] text-[#6B7280]">
              <th className="py-2 pr-2 font-medium">#</th>
              <th className="py-2 pr-2 font-medium">Name</th>
              <th className="py-2 font-medium">Gender</th>
            </tr>
          </thead>
          <tbody>
            {[...THERAPISTS].map((t) => (
              <tr key={t.id} className="border-b border-[#F3F4F6]">
                <td className="py-2 pr-2">{t.number}</td>
                <td className="py-2 pr-2 font-medium text-[#111827]">
                  {t.name}
                </td>
                <td className="py-2">{t.gender}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (tab === "sales") {
    return (
      <div className="min-h-0 flex-1 overflow-auto bg-white p-4">
        <div className="mb-3 text-[14px] font-semibold text-[#111827]">
          Sales
        </div>
        <table className="w-full border-collapse text-left text-[13px]">
          <thead>
            <tr className="border-b border-[#E5E7EB] text-[#6B7280]">
              <th className="py-2 pr-2 font-medium">
                <button
                  type="button"
                  className="inline-flex items-center gap-1 hover:text-[#111827]"
                  onClick={() => setSalesSort("name")}
                >
                  Client
                  {salesSortKey === "name" ? (
                    salesSortDir === "asc" ? (
                      <ArrowUp className="h-3 w-3" />
                    ) : (
                      <ArrowDown className="h-3 w-3" />
                    )
                  ) : null}
                </button>
              </th>
              <th className="py-2 pr-2 font-medium">Phone</th>
              <th className="py-2 pr-2 font-medium">
                <button
                  type="button"
                  className="inline-flex items-center gap-1 hover:text-[#111827]"
                  onClick={() => setSalesSort("amount")}
                >
                  Amount
                  {salesSortKey === "amount" ? (
                    salesSortDir === "asc" ? (
                      <ArrowUp className="h-3 w-3" />
                    ) : (
                      <ArrowDown className="h-3 w-3" />
                    )
                  ) : null}
                </button>
              </th>
              <th className="py-2 font-medium">
                <button
                  type="button"
                  className="inline-flex items-center gap-1 hover:text-[#111827]"
                  onClick={() => setSalesSort("date")}
                >
                  Date
                  {salesSortKey === "date" ? (
                    salesSortDir === "asc" ? (
                      <ArrowUp className="h-3 w-3" />
                    ) : (
                      <ArrowDown className="h-3 w-3" />
                    )
                  ) : null}
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedSales.map((r) => (
              <tr key={r.id} className="border-b border-[#F3F4F6]">
                <td className="py-2 pr-2 font-medium text-[#111827]">
                  {r.client}
                </td>
                <td className="py-2 pr-2">{r.phone}</td>
                <td className="py-2 pr-2">S${r.amount.toFixed(2)}</td>
                <td className="py-2">{r.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (tab === "clients") {
    return (
      <div className="min-h-0 flex-1 overflow-auto bg-white p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="text-[14px] font-semibold text-[#111827]">
            Clients
          </div>
          <div className="flex items-center gap-2 text-[12px] text-[#6B7280]">
            <button
              type="button"
              className="rounded border border-[#E5E7EB] px-2 py-1 hover:bg-[#F9FAFB]"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Prev
            </button>
            <span>
              {page} / {totalPages}
            </span>
            <button
              type="button"
              className="rounded border border-[#E5E7EB] px-2 py-1 hover:bg-[#F9FAFB]"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </button>
          </div>
        </div>
        <table className="w-full border-collapse text-left text-[13px]">
          <thead>
            <tr className="border-b border-[#E5E7EB] text-[#6B7280]">
              <th className="py-2 pr-2 font-medium">Name</th>
              <th className="py-2 font-medium">Phone</th>
            </tr>
          </thead>
          <tbody>
            {pagedClients.map((c) => (
              <tr key={c.phone} className="border-b border-[#F3F4F6]">
                <td className="py-2 pr-2 font-medium text-[#111827]">
                  {c.name}
                </td>
                <td className="py-2">{c.phone}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (tab === "transactions") {
    return (
      <div className="min-h-0 flex-1 overflow-auto bg-white p-4">
        <div className="mb-3 text-[14px] font-semibold text-[#111827]">
          Transactions
        </div>
        <table className="w-full border-collapse text-left text-[13px]">
          <thead>
            <tr className="border-b border-[#E5E7EB] text-[#6B7280]">
              <th className="py-2 pr-2 font-medium">Ref</th>
              <th className="py-2 pr-2 font-medium">Type</th>
              <th className="py-2 pr-2 font-medium">Amount</th>
              <th className="py-2 font-medium">Time</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_TX.map((r) => (
              <tr key={r.id} className="border-b border-[#F3F4F6]">
                <td className="py-2 pr-2 font-medium text-[#111827]">
                  {r.ref}
                </td>
                <td className="py-2 pr-2">{r.type}</td>
                <td className="py-2 pr-2">S${r.amount.toFixed(2)}</td>
                <td className="py-2">{r.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (tab === "reports") {
    return (
      <div className="min-h-0 flex-1 overflow-auto bg-white p-4">
        <div className="mb-3 text-[14px] font-semibold text-[#111827]">
          Reports
        </div>
        <p className="mb-4 text-[13px] text-[#6B7280]">
          Export booking summaries for the selected outlet.
        </p>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-lg border border-[#D1D5DB] bg-white px-4 py-2 text-[13px] font-semibold text-[#111827] hover:bg-[#F9FAFB]"
          onClick={() => {
            const csv =
              "date,client,phone\n2025-08-16,Victoria Baker,92214668\n";
            const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "spa-report-demo.csv";
            a.click();
            URL.revokeObjectURL(url);
            logger.action("reports.download.csv");
            showToast("Report downloaded", "success");
          }}
        >
          <Download className="h-4 w-4" />
          Export CSV
        </button>
      </div>
    );
  }

  return null;
}
