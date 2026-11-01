import {
  BishopIcon,
  KingIcon,
  KnightIcon,
  PawnIcon,
  QueenIcon,
  RookIcon,
} from "@/components/icons";
import type { TeamPerson } from "@/lib/content-model";
import { cn } from "@/utils/cn";

const PIECE_LIST = [KingIcon, QueenIcon, RookIcon, BishopIcon, KnightIcon, PawnIcon];

/** يختار قطعة ثابتة لكل شخص انطلاقاً من معرّفه */
function pieceFor(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return PIECE_LIST[hash % PIECE_LIST.length];
}

type MemberPhotoProps = {
  member: TeamPerson;
  /** نسبة العرض إلى الارتفاع */
  className?: string;
  /** حجم أكبر لبطاقة الرئيس */
  featured?: boolean;
};

/**
 * يعرض صورة العضو إن وُجدت، وإلا يعرض صورة نائبة أنيقة
 * بهوية النادي (أزرق ملكي + لمسة ذهبية) قابلة للاستبدال لاحقاً.
 */
export default function MemberPhoto({
  member,
  className,
  featured = false,
}: MemberPhotoProps) {
  if (member.photo?.url) {
    return (
      <img
        src={member.photo.url}
        alt={`صورة ${member.nameAr} — ${member.roleAr}`}
        width={member.photo.width ?? 800}
        height={member.photo.height ?? 1000}
        loading="lazy"
        decoding="async"
        draggable={false}
        className={cn("h-full w-full select-none object-cover object-center", className)}
      />
    );
  }

  return <PlaceholderPortrait seed={member.id} featured={featured} className={className} />;
}

function PlaceholderPortrait({
  seed,
  featured,
  className,
}: {
  seed: string;
  featured: boolean;
  className?: string;
}) {
  const PieceIcon = pieceFor(seed);

  return (
    <div
      role="img"
      aria-label="صورة شخصية غير متوفرة بعد"
      className={cn(
        "relative h-full w-full overflow-hidden bg-[linear-gradient(160deg,#eef3fa_0%,#e2eaf6_52%,#d8e3f2_100%)]",
        className
      )}
    >
      {/* نقشة رقعة الشطرنج */}
      <div
        aria-hidden="true"
        className="chessboard-surface absolute inset-0 opacity-60 [mask-image:linear-gradient(to_top,black,transparent_78%)]"
      />

      {/* حلقة ذهبية خفيفة */}
      <span
        aria-hidden="true"
        className="absolute -right-8 -top-8 h-28 w-28 rounded-full border border-gold/25"
      />

      {/* الصورة الظلّية */}
      <svg
        aria-hidden="true"
        viewBox="0 0 120 120"
        className="absolute inset-0 h-full w-full"
        preserveAspectRatio="xMidYMax meet"
      >
        <defs>
          <linearGradient id={`sil-${seed}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0a2b5c" stopOpacity="0.34" />
            <stop offset="100%" stopColor="#0a2b5c" stopOpacity="0.17" />
          </linearGradient>
        </defs>
        <circle cx="60" cy="46" r="20" fill={`url(#sil-${seed})`} />
        <path
          d="M19 120c0-21.6 18.4-36 41-36s41 14.4 41 36Z"
          fill={`url(#sil-${seed})`}
        />
      </svg>

      {/* قطعة الشطرنج */}
      <span
        aria-hidden="true"
        className={cn(
          "absolute left-1/2 grid -translate-x-1/2 place-items-center rounded-full border border-gold/40 bg-white/85 text-royal shadow-[0_6px_16px_-10px_rgba(7,31,66,0.6)] backdrop-blur-sm",
          featured ? "top-5 h-12 w-12" : "top-3.5 h-9 w-9"
        )}
      >
        <PieceIcon className={featured ? "h-7 w-7" : "h-5 w-5"} />
      </span>

      {/* إشارة أن الصورة نائبة */}
      <span className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1.5 bg-royal-deep/72 px-2 py-1.5 backdrop-blur-sm">
        <span aria-hidden="true" className="h-[5px] w-[5px] rotate-45 bg-gold" />
        <span className="font-arabic text-[9.5px] font-medium text-white/90 sm:text-[10px]">
          لم تُضَف صورة بعد
        </span>
      </span>
    </div>
  );
}
