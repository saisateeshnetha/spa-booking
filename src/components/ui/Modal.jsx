import { X } from "lucide-react";

export function Modal({
  open,
  title,
  children,
  onClose,
  widthClass = "max-w-xl",
}) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm"
      onClick={onClose}
      role="presentation"
    >
      <div
        className={`relative w-full ${widthClass} rounded-lg bg-white shadow-xl`}
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        {title ? (
          <div className="flex items-center justify-between border-b border-[#E5E7EB] px-6 py-4">
            <div className="text-[16px] font-semibold text-[#111827]">
              {title}
            </div>
            <button
              type="button"
              className="rounded-md p-1 text-[#6B7280] hover:bg-[#F3F4F6]"
              onClick={onClose}
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        ) : null}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
