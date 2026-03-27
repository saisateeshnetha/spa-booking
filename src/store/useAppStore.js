import { create } from "zustand";
import {
  OUTLETS,
  THERAPISTS,
  VISIBLE_THERAPIST_COLUMNS,
} from "../utils/constants.js";
import { buildSeedBookings } from "../utils/mockBookings.js";
import { logger } from "../utils/logger.js";
import { bookingService } from "../services/bookingService.js";
import { authService } from "../services/authService.js";

const CACHE_KEY = "spa.bookings.v1";

function defaultTherapistFilter() {
  return Object.fromEntries(THERAPISTS.map((t) => [t.id, true]));
}

function readCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function saveCache(bookings) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(bookings));
  } catch {
    // Ignore cache write failures (private mode/quota issues).
  }
}

export const useAppStore = create((set) => ({
  searchQuery: "",
  selectedDate: new Date(),
  displayIntervalLabel: "15 Min",

  /** @type {'home' | 'therapists' | 'sales' | 'clients' | 'transactions' | 'reports'} */
  activeNavTab: "home",
  setActiveNavTab: (activeNavTab) =>
    set({
      activeNavTab,
      notificationsOpen: false,
      profileMenuOpen: false,
      outletDropdownOpen: false,
      displayDropdownOpen: false,
      filterPanelOpen: false,
    }),

  outletName: OUTLETS[0].name,
  selectedOutletId: OUTLETS[0].id,
  outlets: OUTLETS,
  outletDropdownOpen: false,
  toggleOutletDropdown: () =>
    set((s) => ({
      outletDropdownOpen: !s.outletDropdownOpen,
      displayDropdownOpen: false,
      filterPanelOpen: false,
    })),
  closeOutletDropdown: () => set({ outletDropdownOpen: false }),
  selectOutlet: (selectedOutletId) =>
    set((s) => {
      const o = s.outlets.find((x) => x.id === selectedOutletId);
      return {
        selectedOutletId,
        outletName: o?.name ?? s.outletName,
        outletDropdownOpen: false,
      };
    }),

  displayDropdownOpen: false,
  toggleDisplayDropdown: () =>
    set((s) => ({
      displayDropdownOpen: !s.displayDropdownOpen,
      outletDropdownOpen: false,
      filterPanelOpen: false,
    })),
  closeDisplayDropdown: () => set({ displayDropdownOpen: false }),
  setDisplayIntervalLabel: (displayIntervalLabel) =>
    set({ displayIntervalLabel, displayDropdownOpen: false }),

  therapistWindowStart: 0,
  shiftTherapistWindow: (delta) =>
    set((s) => {
      const maxStart = Math.max(
        0,
        THERAPISTS.length - VISIBLE_THERAPIST_COLUMNS,
      );
      const next = Math.min(
        maxStart,
        Math.max(0, s.therapistWindowStart + delta),
      );
      return { therapistWindowStart: next };
    }),

  filterPanelOpen: false,
  toggleFilterPanel: () =>
    set((s) => ({
      filterPanelOpen: !s.filterPanelOpen,
      outletDropdownOpen: false,
      displayDropdownOpen: false,
    })),
  closeFilterPanel: () => set({ filterPanelOpen: false }),

  /** Schedule filters (assessment: gender, status, therapist list) */
  filterGender: "all",
  setFilterGender: (filterGender) => set({ filterGender }),
  filterStatus: {
    confirmed: true,
    checkIn: true,
    cancelled: true,
    completed: true,
  },
  toggleFilterStatus: (key) =>
    set((s) => ({
      filterStatus: { ...s.filterStatus, [key]: !s.filterStatus[key] },
    })),
  therapistFilter: defaultTherapistFilter(),
  toggleTherapistFilter: (id) =>
    set((s) => ({
      therapistFilter: { ...s.therapistFilter, [id]: !s.therapistFilter[id] },
    })),
  selectAllTherapistsFilter: () =>
    set({ therapistFilter: defaultTherapistFilter() }),
  resetScheduleFilters: () =>
    set({
      filterGender: "all",
      filterStatus: {
        confirmed: true,
        checkIn: true,
        cancelled: true,
        completed: true,
      },
      therapistFilter: defaultTherapistFilter(),
    }),

  notificationsOpen: false,
  toggleNotifications: () =>
    set((s) => ({
      notificationsOpen: !s.notificationsOpen,
      profileMenuOpen: false,
    })),
  closeNotifications: () => set({ notificationsOpen: false }),

  profileMenuOpen: false,
  toggleProfileMenu: () =>
    set((s) => ({
      profileMenuOpen: !s.profileMenuOpen,
      notificationsOpen: false,
    })),
  closeProfileMenu: () => set({ profileMenuOpen: false }),

  settingsModalOpen: false,
  openSettings: () => set({ settingsModalOpen: true, profileMenuOpen: false }),
  closeSettings: () => set({ settingsModalOpen: false }),

  searchFocusTick: 0,
  requestSearchFocus: () =>
    set((s) => ({ searchFocusTick: s.searchFocusTick + 1 })),
  runToolbarSearch: () => {
    logger.action("search.toolbar.run");
  },

  toastMessage: null,
  /** @type {'info' | 'success' | 'error'} */
  toastVariant: "info",
  showToast: (toastMessage, toastVariant = "info") =>
    set({ toastMessage, toastVariant }),
  clearToast: () => set({ toastMessage: null }),

  /** @type {'name' | 'amount' | 'date'} */
  salesSortKey: "date",
  salesSortDir: "desc",
  setSalesSort: (salesSortKey) =>
    set((s) => ({
      salesSortKey,
      salesSortDir:
        s.salesSortKey === salesSortKey
          ? s.salesSortDir === "asc"
            ? "desc"
            : "asc"
          : "asc",
    })),

  /** @type {'idle' | 'new' | 'view' | 'edit' | 'cancelled'} */
  panelMode: "idle",
  cancelModalOpen: false,
  loading: false,
  lastError: "",

  selectedBooking: null,

  /** Local cache */
  bookings: readCache() ?? buildSeedBookings(2000),

  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSelectedDate: (selectedDate) => set({ selectedDate }),
  openNewBooking: (prefill) => {
    logger.action("booking.new.open", prefill);
    set({
      panelMode: "new",
      selectedBooking: prefill ?? null,
    });
  },
  openBooking: (booking) => {
    logger.action("booking.select", { id: booking?.id });
    set({ panelMode: "view", selectedBooking: booking });
  },
  editBooking: (booking) => {
    logger.action("booking.edit", { id: booking?.id });
    set({ panelMode: "edit", selectedBooking: booking });
  },
  showCancelled: (booking) => {
    set({ panelMode: "cancelled", selectedBooking: booking });
  },
  closePanel: () => set({ panelMode: "idle", selectedBooking: null }),
  openCancelModal: () => {
    set({ cancelModalOpen: true });
  },
  closeCancelModal: () => set({ cancelModalOpen: false }),

  upsertBooking: (booking) => {
    set((s) => {
      const idx = s.bookings.findIndex((b) => b.id === booking.id);
      const next =
        idx === -1
          ? [...s.bookings, booking]
          : s.bookings.map((b, i) => (i === idx ? booking : b));
      logger.action("booking.upsert", { id: booking.id });
      saveCache(next);
      return { bookings: next };
    });
  },

  removeBooking: (id) => {
    set((s) => {
      const next = s.bookings.filter((b) => b.id !== id);
      saveCache(next);
      return { bookings: next };
    });
    logger.action("booking.remove", { id });
  },

  moveBooking: (id, patch) => {
    set((s) => {
      const bookings = s.bookings.map((b) => {
        if (b.id !== id) return b;
        const next = { ...b, ...patch };
        if (patch.therapistId) {
          const th = THERAPISTS.find((t) => t.id === patch.therapistId);
          if (th) next.therapist = th;
        }
        return next;
      });
      saveCache(bookings);
      return { bookings };
    });
    logger.action("booking.move", { id, patch });
  },

  checkInBooking: async (id) => {
    const ref = String(id);
    set((s) => {
      const selected = s.bookings.find((b) => b.id === ref);
      const targetBookingId = String(selected?.bookingId ?? selected?.id ?? ref);
      const next = s.bookings.map((b) =>
        String(b.bookingId ?? b.id) === targetBookingId
          ? { ...b, status: "checkIn" }
          : b,
      );
      saveCache(next);
      const sel =
        s.selectedBooking?.id === ref
          ? { ...s.selectedBooking, status: "checkIn" }
          : s.selectedBooking;
      return { bookings: next, selectedBooking: sel };
    });
    logger.action("booking.checkIn", { id: ref });
    try {
      const token = await authService.ensureAuth();
      const selected = useAppStore.getState().bookings.find((b) => b.id === ref);
      const apiId = String(selected?.bookingId ?? ref);
      await bookingService.updateStatus(apiId, "Check-in (In Progress)", token);
      set({ lastError: "" });
      logger.info("booking.checkIn.api", { id: apiId });
    } catch (error) {
      set({ lastError: "Check-in updated locally (API status update failed)." });
      logger.error("booking.checkIn.failed", { id: ref, message: error?.message });
    }
  },

  checkoutBooking: async (id) => {
    const ref = String(id);
    set((s) => {
      const selected = s.bookings.find((b) => b.id === ref);
      const targetBookingId = String(selected?.bookingId ?? selected?.id ?? ref);
      const next = s.bookings.map((b) =>
        String(b.bookingId ?? b.id) === targetBookingId
          ? { ...b, status: "completed" }
          : b,
      );
      saveCache(next);
      return {
        bookings: next,
        selectedBooking:
          s.selectedBooking?.id === ref
            ? { ...s.selectedBooking, status: "completed" }
            : s.selectedBooking,
      };
    });
    logger.action("booking.checkout", { id: ref });
    try {
      const token = await authService.ensureAuth();
      const selected = useAppStore.getState().bookings.find((b) => b.id === ref);
      const apiId = String(selected?.bookingId ?? ref);
      await bookingService.updateStatus(apiId, "Completed", token);
      set({ lastError: "" });
      logger.info("booking.checkout.api", { id: apiId });
    } catch (error) {
      set({
        lastError: "Checkout updated locally (API status update failed).",
      });
      logger.error("booking.checkout.failed", { id: ref, message: error?.message });
    }
  },

  setError: (lastError) => set({ lastError }),

  fetchBookings: async () => {
    if (useAppStore.getState().loading) return;
    set({ loading: true, lastError: "" });
    try {
      let token = await authService.ensureAuth();
      let apiBookings;
      try {
        apiBookings = await bookingService.list(token);
      } catch (error) {
        if (error?.response?.status !== 401) throw error;
        token = await authService.ensureAuth(true);
        apiBookings = await bookingService.list(token);
      }
      const safeList = Array.isArray(apiBookings) ? apiBookings : [];
      // Empty API data is still a valid response; keep UI online without fallback warning.
      saveCache(safeList);
      set({ bookings: safeList, loading: false, lastError: "" });
      logger.info("booking.fetch.success", { count: safeList.length });
      return;
    } catch (error) {
      const cached = readCache();
      if (cached?.length) {
        set({
          bookings: cached,
          loading: false,
          lastError: `Using cached data (API unavailable: ${error?.message ?? "request failed"}).`,
        });
        logger.warn("booking.fetch.cached", { count: cached.length });
        return;
      }
      const fallback = buildSeedBookings(2000);
      saveCache(fallback);
      set({
        bookings: fallback,
        loading: false,
        lastError: "API unavailable, loaded local demo data.",
      });
      logger.error("booking.fetch.fallback", { message: error?.message });
    }
  },

  createBooking: async (draft) => {
    const tmpId = `tmp-${Date.now()}`;
    const optimistic = {
      id: tmpId,
      bookingId: tmpId,
      therapistId: draft.therapistId ?? THERAPISTS[0].id,
      therapist:
        THERAPISTS.find(
          (t) => t.id === (draft.therapistId ?? THERAPISTS[0].id),
        ) ?? THERAPISTS[0],
      startMin: draft.startMin ?? 9 * 60,
      durationMin: draft.durationMin ?? 60,
      service: draft.service ?? "Service",
      clientPhone: draft.clientPhone ?? "",
      clientName: draft.clientName ?? "Walk-in Client",
      status: "confirmed",
      cardKey: "tuiNa",
      bg: "#DBEAFE",
      notes: draft.notes ?? "",
      room: draft.room ?? "",
      requests: draft.requests ?? "",
      requestedTherapist: Boolean(draft.requestedTherapist),
      requestedRoom: Boolean(draft.requestedRoom),
    };
    set((s) => {
      const next = [...s.bookings, optimistic];
      saveCache(next);
      return { bookings: next, panelMode: "view", selectedBooking: optimistic };
    });
    logger.action("booking.created.optimistic", { id: optimistic.id });

    try {
      const token = await authService.ensureAuth();
      const created = await bookingService.create(draft, token);
      set((s) => {
        const next = s.bookings.map((b) =>
          b.id === optimistic.id ? created : b,
        );
        saveCache(next);
        return { bookings: next, selectedBooking: created, lastError: "" };
      });
      logger.info("booking.created.api", { id: created.id });
      return created;
    } catch (error) {
      set({ lastError: "Booking saved locally (API create failed)." });
      logger.error("booking.create.failed", { message: error?.message });
      return optimistic;
    }
  },

  saveBooking: async (booking) => {
    set((s) => {
      const next = s.bookings.map((b) => (b.id === booking.id ? booking : b));
      saveCache(next);
      return { bookings: next, selectedBooking: booking };
    });
    try {
      const token = await authService.ensureAuth();
      const apiId = String(booking.bookingId ?? booking.id);
      const updated = await bookingService.update(apiId, booking, token);
      set((s) => {
        const next = s.bookings.map((b) => (b.id === booking.id ? updated : b));
        saveCache(next);
        return { bookings: next, selectedBooking: updated, lastError: "" };
      });
      logger.info("booking.updated.api", { id: apiId });
      return updated;
    } catch (error) {
      set({ lastError: "Changes saved locally (API update failed)." });
      logger.error("booking.update.failed", {
        id: booking.id,
        message: error?.message,
      });
      return booking;
    }
  },

  cancelBooking: async (id) => {
    const ref = String(id);
    const selected = useAppStore.getState().bookings.find((b) => b.id === ref);
    const targetBookingId = String(selected?.bookingId ?? ref);
    set((s) => {
      const next = s.bookings.map((b) =>
        String(b.bookingId ?? b.id) === targetBookingId
          ? { ...b, status: "cancelled" }
          : b,
      );
      saveCache(next);
      return { bookings: next };
    });
    try {
      const token = await authService.ensureAuth();
      await bookingService.cancel(targetBookingId, {}, token);
      set({ lastError: "" });
      logger.info("booking.cancelled.api", { id: targetBookingId });
    } catch (error) {
      set({ lastError: "Booking cancelled locally (API cancel failed)." });
      logger.error("booking.cancel.failed", { id: ref, message: error?.message });
    }
  },

  deleteBooking: async (id) => {
    const ref = String(id);
    const previous = useAppStore.getState().bookings;
    const selected = previous.find((b) => b.id === ref);
    const targetBookingId = String(selected?.bookingId ?? ref);
    const next = previous.filter(
      (b) => String(b.bookingId ?? b.id) !== targetBookingId,
    );
    saveCache(next);
    set({ bookings: next, selectedBooking: null, panelMode: "idle" });
    try {
      const token = await authService.ensureAuth();
      await bookingService.destroy(targetBookingId, token);
      set({ lastError: "" });
      logger.info("booking.deleted.api", { id: targetBookingId });
    } catch (error) {
      set({ lastError: "Delete applied locally (API delete failed)." });
      logger.error("booking.delete.failed", { id: ref, message: error?.message });
    }
  },
}));
