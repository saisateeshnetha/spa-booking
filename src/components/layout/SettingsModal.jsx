import { Upload, Download } from "lucide-react";
import { Modal } from "../ui/Modal.jsx";
import { useAppStore } from "../../store/useAppStore.js";
import { logger } from "../../utils/logger.js";

export function SettingsModal() {
  const open = useAppStore((s) => s.settingsModalOpen);
  const closeSettings = useAppStore((s) => s.closeSettings);
  const showToast = useAppStore((s) => s.showToast);

  return (
    <Modal
      open={open}
      title="Settings"
      onClose={closeSettings}
      widthClass="max-w-md"
    >
      <div className="space-y-4 text-[14px] text-[#374151]">
        <p className="text-[13px] leading-relaxed">
          Manage preferences for this workstation. Changes apply to your session
          only.
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-lg border border-[#D1D5DB] bg-white px-4 py-2 text-[13px] font-medium text-[#111827] hover:bg-[#F9FAFB]"
            onClick={() => {
              logger.action("settings.download");
              showToast("Preferences exported", "success");
            }}
          >
            <Download className="h-4 w-4" />
            Download preferences
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-lg border border-[#D1D5DB] bg-white px-4 py-2 text-[13px] font-medium text-[#111827] hover:bg-[#F9FAFB]"
            onClick={() => {
              logger.action("settings.upload");
              showToast("Upload dialog would open (demo)", "info");
            }}
          >
            <Upload className="h-4 w-4" />
            Upload preferences
          </button>
        </div>
      </div>
    </Modal>
  );
}
