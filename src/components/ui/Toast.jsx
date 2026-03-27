import { useEffect } from "react";
import { useAppStore } from "../../store/useAppStore.js";

export function Toast() {
  const toastMessage = useAppStore((s) => s.toastMessage);
  const toastVariant = useAppStore((s) => s.toastVariant);
  const clearToast = useAppStore((s) => s.clearToast);

  useEffect(() => {
    if (!toastMessage) return undefined;
    const t = setTimeout(() => clearToast(), 3200);
    return () => clearTimeout(t);
  }, [toastMessage, clearToast]);

  if (!toastMessage) return null;

  const bg =
    toastVariant === "error"
      ? "bg-red-700"
      : toastVariant === "success"
        ? "bg-emerald-700"
        : "bg-[#332314]";

  return (
    <div
      className={`pointer-events-none fixed bottom-6 left-1/2 z-[200] max-w-md -translate-x-1/2 rounded-lg px-4 py-3 text-center text-[13px] font-medium text-white shadow-lg ${bg}`}
      role="status"
    >
      {toastMessage}
    </div>
  );
}
