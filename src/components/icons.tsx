import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

export function MenuIcon({ className, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 26 20"
      fill="none"
      aria-hidden="true"
      className={className}
      {...props}
    >
      <path
        d="M1 2.2h24"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M1 10h15.5"
        stroke="#c6a14e"
        strokeWidth="1.8"
        strokeLinecap="round"
        className="transition-colors duration-300 group-hover:stroke-[#e2cc96]"
      />
      <path
        d="M1 17.8h24"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function CloseIcon({ className, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
      {...props}
    >
      <path
        d="M6 6l12 12M18 6L6 18"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function ChevronLeftIcon({ className, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
      {...props}
    >
      <path
        d="M14.5 6.5L9 12l5.5 5.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function MapPinIcon({ className, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
      {...props}
    >
      <path
        d="M12 21s6.5-5.6 6.5-11A6.5 6.5 0 0 0 5.5 10c0 5.4 6.5 11 6.5 11Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="10" r="2.2" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

export function ChevronRightIcon({ className, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
      {...props}
    >
      <path
        d="M9.5 6.5L15 12l-5.5 5.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CalendarIcon({ className, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
      {...props}
    >
      <rect
        x="3.5"
        y="5.5"
        width="17"
        height="15"
        rx="2.6"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <path
        d="M3.5 10.2h17M8.2 3.4v3.6M15.8 3.4v3.6"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <circle cx="8.4" cy="14.2" r="1.05" fill="currentColor" />
      <circle cx="12" cy="14.2" r="1.05" fill="currentColor" />
    </svg>
  );
}

export function InfoIcon({ className, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
      {...props}
    >
      <circle cx="12" cy="12" r="8.6" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M12 11v5.2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="12" cy="7.9" r="1.05" fill="currentColor" />
    </svg>
  );
}

export function LockIcon({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className} {...props}>
      <rect x="4.5" y="10.5" width="15" height="10" rx="2.4" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M8.2 10.5V7.9a3.8 3.8 0 0 1 7.6 0v2.6"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <circle cx="12" cy="15.4" r="1.25" fill="currentColor" />
    </svg>
  );
}

export function MailIcon({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className} {...props}>
      <rect x="3" y="5.5" width="18" height="13" rx="2.6" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="m4.2 7.6 6.5 4.6c.8.6 1.8.6 2.6 0l6.5-4.6"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function PhoneIcon({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className} {...props}>
      <path
        d="M8.2 3.8 9.9 7.4c.2.5.1 1-.3 1.3L8 10c.8 2.1 2.4 3.7 4.5 4.6l1.3-1.6c.3-.4.9-.5 1.3-.3l3.6 1.7c.5.2.7.8.5 1.3l-1 2.2c-.3.6-.9 1-1.6.9-6-.6-10.7-5.3-11.3-11.3-.1-.7.3-1.3.9-1.6l2.2-1c.5-.2 1.1 0 1.3.5Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function BuildingIcon({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className} {...props}>
      <path
        d="M4.5 20.5V6.8L12 3.5l7.5 3.3v13.7"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path d="M3 20.5h18" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path
        d="M9.6 20.5v-4.3h4.8v4.3"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="10.3" r="1.5" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}

/* ---------- Chess piece icons (decorative line art) ---------- */

type PieceProps = IconProps & { title?: string };

function PieceBase() {
  return (
    <path
      d="M7.4 20.7h9.2c0-1.8-1-3-2.5-3.4H9.9c-1.5.4-2.5 1.6-2.5 3.4Z"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinejoin="round"
    />
  );
}

export function PawnIcon({ className, ...props }: PieceProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className} {...props}>
      <circle cx="12" cy="6.4" r="2.6" stroke="currentColor" strokeWidth="1.3" />
      <path
        d="M10.1 10.1c.2 2.7-.5 5.1-1.7 7.2h7.2c-1.2-2.1-1.9-4.5-1.7-7.2"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <path d="M9.3 10.1h5.4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <PieceBase />
    </svg>
  );
}

export function RookIcon({ className, ...props }: PieceProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className} {...props}>
      <path
        d="M6.9 9.1V4.7h2.2v1.7h1.8V4.7h2.2v1.7h1.8V4.7h2.2v4.4Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <path
        d="M8.5 9.1 8 17.3h8l-.5-8.2"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <PieceBase />
    </svg>
  );
}

export function BishopIcon({ className, ...props }: PieceProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className} {...props}>
      <circle cx="12" cy="3.9" r="1.15" stroke="currentColor" strokeWidth="1.2" />
      <path
        d="M12 5.6c2.3 2.4 3.6 4.7 3.6 7 0 2-1 3.6-1.8 4.7H10.2C9.4 16.2 8.4 14.6 8.4 12.6c0-2.3 1.3-4.6 3.6-7Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <path d="M13.4 9.2 11 11.9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <PieceBase />
    </svg>
  );
}

export function KnightIcon({ className, ...props }: PieceProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className} {...props}>
      <path
        d="M9.6 17.3c-.1-2.6.9-4.3 2.7-5.6 1-.7 1.6-1.3 1.9-2.1l-2.5.9c-1.1.4-2.3-.1-2.8-1.1l-.5-1.1 3.4-2.7V3.9l2.1 1.2 1-1c2.7 1.2 4.3 3.8 4.3 6.8v6.4Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <circle cx="10.4" cy="8" r="0.6" fill="currentColor" />
      <PieceBase />
    </svg>
  );
}

export function QueenIcon({ className, ...props }: PieceProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className} {...props}>
      <path
        d="m8 17.3-1.6-9.6 3.3 2.7L12 6.6l2.3 3.8 3.3-2.7L16 17.3Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <circle cx="6.4" cy="6.4" r="1.15" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="12" cy="4.7" r="1.2" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="17.6" cy="6.4" r="1.15" stroke="currentColor" strokeWidth="1.2" />
      <PieceBase />
    </svg>
  );
}

export function KingIcon({ className, ...props }: PieceProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className} {...props}>
      <path
        d="M12 2.9v4.3M10.2 4.5h3.6"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
      <path
        d="M8 17.3c-1.1-3.4-1.4-5.9.7-6.8 1.3-.6 2.5.1 3.3 1.6.8-1.5 2-2.2 3.3-1.6 2.1.9 1.8 3.4.7 6.8Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <PieceBase />
    </svg>
  );
}
