import { memo, useMemo } from "react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Check, Coffee, DollarSign, Phone, User } from "lucide-react";
import { BOOKING_CARD } from "../../utils/constants.js";
import { getBookingCardBackground } from "../../utils/bookingVisual.js";

const iconWrap =
  "flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold leading-none";

export const AppointmentBlock = memo(function AppointmentBlock({
  booking,
  onClick,
  isSelected,
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: `booking-${booking.id}`,
    });

  const accent = BOOKING_CARD[booking.cardKey]?.bg ?? "#94A3B8";

  const style = useMemo(
    () => ({
      background: getBookingCardBackground(booking),
      borderLeft: `3px solid ${accent}`,
      top: booking.topPx,
      height: booking.heightPx,
      minHeight: 40,
      boxShadow: isSelected ? "0 0 0 2px #F59E0B" : undefined,
      transform: transform ? CSS.Transform.toString(transform) : undefined,
      zIndex: isDragging ? 40 : 10,
      opacity: isDragging ? 0.92 : 1,
    }),
    [accent, booking, isDragging, isSelected, transform],
  );

  return (
    <button
      type="button"
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(booking);
      }}
      className="absolute left-1 right-1 z-10 overflow-hidden rounded-md border border-black/[0.06] p-2 text-left transition-[box-shadow] hover:z-20 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50"
      style={style} 
    >
      <div className="text-[11px] font-bold leading-snug text-[#111827]">
        {booking.durationMin} Min /  {booking.service}
      </div>
      <div className="mt-0.5 text-[10px] font-semibold text-[#374151]">
        {booking.clientPhone}
      </div>
      <div className="text-[10px] font-medium text-[#374151]">
        {booking.clientName}
      </div>
      <div className="mt-1 flex flex-wrap items-center gap-0.5">
        {booking.requestedTherapist ? (
          <span
            className={`${iconWrap} border border-[#D4AF37]/60 bg-white text-[#B45309]`}
            title="Requested therapist"
          >
            T
          </span>
        ) : null}
        {booking.requestedRoom ? (
          <span
            className={`${iconWrap} border border-[#3B82F6]/40 bg-white text-[#1D4ED8]`}
            title="Room preference"
          >
            R
          </span>
        ) : null}
        <span className={`${iconWrap} bg-emerald-600 text-white`}>
          <Check className="h-2.5 w-2.5" strokeWidth={3} />
        </span>
        <span className={`${iconWrap} bg-sky-600 text-white`}>C</span>
        <span className={`${iconWrap} bg-amber-500 text-white`}>
          <DollarSign className="h-2.5 w-2.5" />
        </span>
        <span className={`${iconWrap} bg-violet-600 text-white`}>
          <Phone className="h-2.5 w-2.5" />
        </span>
        <span className={`${iconWrap} bg-rose-600 text-white`}>
          <User className="h-2.5 w-2.5" />
        </span>
        <span className={`${iconWrap} bg-neutral-600 text-white`}>
          <Coffee className="h-2.5 w-2.5" />
        </span>
      </div>
    </button>
  );
});
