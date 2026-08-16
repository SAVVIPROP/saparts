import type { ReactNode } from "react";
import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number | string };

function I({ size = 16, className, strokeWidth = 1.6, fill = "none", ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={fill}
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
      {...rest}
    />
  );
}

export function ChevronDown(p: IconProps) {
  return (
    <I {...p}>
      <path d="m6 9 6 6 6-6" />
    </I>
  );
}
export function ChevronRight(p: IconProps) {
  return (
    <I {...p}>
      <path d="m9 18 6-6-6-6" />
    </I>
  );
}
export function Menu(p: IconProps) {
  return (
    <I {...p}>
      <path d="M4 6h16M4 12h16M4 18h16" />
    </I>
  );
}
export function Search(p: IconProps) {
  return (
    <I {...p}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </I>
  );
}
export function X(p: IconProps) {
  return (
    <I {...p}>
      <path d="M18 6 6 18M6 6l12 12" />
    </I>
  );
}
export function MapPin(p: IconProps) {
  return (
    <I {...p}>
      <path d="M12 21s7-5.3 7-11a7 7 0 1 0-14 0c0 5.7 7 11 7 11z" />
      <circle cx="12" cy="10" r="2.2" />
    </I>
  );
}
export function Globe(p: IconProps) {
  return (
    <I {...p}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
    </I>
  );
}
export function Building2(p: IconProps) {
  return (
    <I {...p}>
      <path d="M6 21V5a1 1 0 0 1 1-1h7a1 1 0 0 1 1 1v16M6 21h14M10 8h2M10 12h2M10 16h2M17 21v-8h3v8" />
    </I>
  );
}
export function Star(p: IconProps) {
  return (
    <I {...p}>
      <path d="m12 3 2.6 5.4 6 .9-4.3 4.2 1 5.9L12 16.8 6.7 19.4l1-5.9L3.4 9.3l6-.9z" />
    </I>
  );
}
export function BookOpen(p: IconProps) {
  return (
    <I {...p}>
      <path d="M12 6c-2-1.5-5-2-8-2v14c3 0 6 .5 8 2 2-1.5 5-2 8-2V4c-3 0-6 .5-8 2z" />
    </I>
  );
}
export function Briefcase(p: IconProps) {
  return (
    <I {...p}>
      <rect x="3" y="7" width="18" height="13" rx="1" />
      <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 13h18" />
    </I>
  );
}
export function Award(p: IconProps) {
  return (
    <I {...p}>
      <circle cx="12" cy="9" r="5" />
      <path d="m8.5 13.5-1 7 4.5-2.5 4.5 2.5-1-7" />
    </I>
  );
}
export function Users(p: IconProps) {
  return (
    <I {...p}>
      <circle cx="9" cy="8" r="3" />
      <path d="M3 19a6 6 0 0 1 12 0" />
      <circle cx="17" cy="9" r="2.2" />
      <path d="M16 19a5 5 0 0 0-1.5-3.5" />
    </I>
  );
}
export function Heart(p: IconProps) {
  return (
    <I {...p}>
      <path d="M19.5 12.6 12 20l-7.5-7.4A4.5 4.5 0 1 1 12 6.6a4.5 4.5 0 1 1 7.5 6" />
    </I>
  );
}
export function PawPrint(p: IconProps) {
  return (
    <I {...p}>
      <circle cx="7" cy="9" r="1.6" />
      <circle cx="17" cy="9" r="1.6" />
      <circle cx="10" cy="6" r="1.4" />
      <circle cx="14" cy="6" r="1.4" />
      <path d="M8 16c1.5-2 6.5-2 8 0 1 1.2-1 3-4 3s-5-1.8-4-3z" />
    </I>
  );
}
export function Plane(p: IconProps) {
  return (
    <I {...p}>
      <path d="M21 3 3 10.5l7 2.5L12.5 21z" />
    </I>
  );
}
export function LayoutGrid(p: IconProps) {
  return (
    <I {...p}>
      <rect x="3" y="3" width="8" height="8" />
      <rect x="13" y="3" width="8" height="8" />
      <rect x="3" y="13" width="8" height="8" />
      <rect x="13" y="13" width="8" height="8" />
    </I>
  );
}
export function Home(p: IconProps) {
  return (
    <I {...p}>
      <path d="M4 11 12 4l8 7v9H4z" />
      <path d="M9 20v-6h6v6" />
    </I>
  );
}
export function Hotel(p: IconProps) {
  return (
    <I {...p}>
      <path d="M3 21V8l9-5 9 5v13" />
      <path d="M9 21v-6h6v6" />
    </I>
  );
}
export function Crown(p: IconProps) {
  return (
    <I {...p}>
      <path d="m3 16 3-9 6 5 6-5 3 9H3z" />
      <path d="M3 16h18v3H3z" />
    </I>
  );
}
export function Newspaper(p: IconProps) {
  return (
    <I {...p}>
      <rect x="4" y="4" width="16" height="16" />
      <path d="M8 8h8M8 12h8M8 16h5" />
    </I>
  );
}
export function Map(p: IconProps) {
  return (
    <I {...p}>
      <path d="m9 4 6 2 6-2v16l-6 2-6-2-6 2V6z" />
      <path d="M9 4v16M15 6v16" />
    </I>
  );
}
export function TrendingUp(p: IconProps) {
  return (
    <I {...p}>
      <path d="M3 17 10 10l4 4 7-7" />
      <path d="M14 7h7v7" />
    </I>
  );
}
export function Coffee(p: IconProps) {
  return (
    <I {...p}>
      <path d="M4 9h13v6a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z" />
      <path d="M17 10h2a3 3 0 0 1 0 6h-2" />
    </I>
  );
}
export function ArrowRight(p: IconProps) {
  return (
    <I {...p}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </I>
  );
}
export function Bookmark(p: IconProps) {
  return (
    <I {...p}>
      <path d="M6 4h12v17l-6-3-6 3z" />
    </I>
  );
}
export function Share2(p: IconProps) {
  return (
    <I {...p}>
      <circle cx="18" cy="5" r="2.4" />
      <circle cx="6" cy="12" r="2.4" />
      <circle cx="18" cy="19" r="2.4" />
      <path d="m8.2 10.8 7.6-4.6M8.2 13.2l7.6 4.6" />
    </I>
  );
}
export function Trash2(p: IconProps) {
  return (
    <I {...p}>
      <path d="M4 7h16M9 7V5h6v2M7 7l1 13h8l1-13" />
    </I>
  );
}
export function MessageSquare(p: IconProps) {
  return (
    <I {...p}>
      <path d="M4 5h16v12H8l-4 4z" />
    </I>
  );
}
export function Send(p: IconProps) {
  return (
    <I {...p}>
      <path d="M21 3 3 10.5l7 2.5L12.5 21z" />
    </I>
  );
}
export function Loader2(p: IconProps) {
  return (
    <I {...p} className={`animate-spin ${p.className ?? ""}`}>
      <path d="M12 3a9 9 0 1 1-9 9" />
    </I>
  );
}
export function Wifi(p: IconProps) {
  return (
    <I {...p}>
      <path d="M5 12a10 10 0 0 1 14 0M8 15a6 6 0 0 1 8 0" />
      <circle cx="12" cy="19" r="1.2" fill="currentColor" />
    </I>
  );
}
export function Utensils(p: IconProps) {
  return (
    <I {...p}>
      <path d="M7 3v8M5 3v5a2 2 0 0 0 4 0V3M7 11v10M16 3v7a2 2 0 0 0 2 2h0V3M16 21V12" />
    </I>
  );
}
export function Dumbbell(p: IconProps) {
  return (
    <I {...p}>
      <path d="M4 10v4M7 8v8M17 8v8M20 10v4M7 12h10" />
    </I>
  );
}
export function Car(p: IconProps) {
  return (
    <I {...p}>
      <path d="M4 15h16l-1.5-6H5.5zM6 15v3M18 15v3M7 11l1.5-3h7L17 11" />
    </I>
  );
}
export function ExternalLink(p: IconProps) {
  return (
    <I {...p}>
      <path d="M14 5h5v5M19 5 10 14" />
      <path d="M9 6H6v12h12v-3" />
    </I>
  );
}
export function Bed(p: IconProps) {
  return (
    <I {...p}>
      <path d="M3 18V9h8a5 5 0 0 1 5 5v4M3 14h18M3 18h18" />
    </I>
  );
}
export function Check(p: IconProps) {
  return (
    <I {...p}>
      <path d="m5 13 4 4 10-10" />
    </I>
  );
}
export function DollarSign(p: IconProps) {
  return (
    <I {...p}>
      <path d="M12 3v18M16 7.5C16 6 14.2 5 12 5S8 6 8 7.8 9.8 10 12 10s4 1 4 2.8S14.2 16 12 16 8 15 8 13.5" />
    </I>
  );
}
export function Landmark(p: IconProps) {
  return (
    <I {...p}>
      <path d="M4 20h16M6 20V10m4 10V10m4 10V10m4 10V10M3 10h18L12 4z" />
    </I>
  );
}
export function Sun(p: IconProps) {
  return (
    <I {...p}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 3v2M12 19v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M3 12h2M19 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
    </I>
  );
}
export function CalendarDays(p: IconProps) {
  return (
    <I {...p}>
      <rect x="3" y="5" width="18" height="16" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </I>
  );
}
export function Coins(p: IconProps) {
  return (
    <I {...p}>
      <ellipse cx="9" cy="8" rx="6" ry="3" />
      <path d="M3 8v6c0 1.7 2.7 3 6 3s6-1.3 6-3V8" />
      <path d="M15 10.5c2.8.4 5 1.7 5 3.5v4c0 1.9-2.7 3.5-6 3.5-1.5 0-2.9-.3-4-.9" />
    </I>
  );
}
export function Shield(p: IconProps) {
  return (
    <I {...p}>
      <path d="M12 3 5 6v6c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6z" />
    </I>
  );
}
export function Phone(p: IconProps) {
  return (
    <I {...p}>
      <path d="M7 3h4l1 4-2.5 1.5a12 12 0 0 0 6 6L17 12l4 1v4c0 1-1 3-8 3S3 18 3 11 6 3 7 3z" />
    </I>
  );
}
export function CheckCircle(p: IconProps) {
  return (
    <I {...p}>
      <circle cx="12" cy="12" r="9" />
      <path d="m8 12 3 3 5-6" />
    </I>
  );
}
export function Info(p: IconProps) {
  return (
    <I {...p}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v6M12 7h.01" />
    </I>
  );
}
export function Clock(p: IconProps) {
  return (
    <I {...p}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v6l4 2" />
    </I>
  );
}
export function Thermometer(p: IconProps) {
  return (
    <I {...p}>
      <path d="M10 14V5a2 2 0 1 1 4 0v9a3.5 3.5 0 1 1-4 0z" />
    </I>
  );
}
export function Calculator(p: IconProps) {
  return (
    <I {...p}>
      <rect x="5" y="3" width="14" height="18" />
      <path d="M8 7h8M8 12h2M12 12h2M16 12h0M8 16h2M12 16h2M16 16h0" />
    </I>
  );
}
export function FileText(p: IconProps) {
  return (
    <I {...p}>
      <path d="M7 3h7l5 5v13H7z" />
      <path d="M14 3v5h5M9 13h6M9 17h6" />
    </I>
  );
}
export function SlidersHorizontal(p: IconProps) {
  return (
    <I {...p}>
      <path d="M4 8h16M4 16h16M10 5v6M16 13v6" />
    </I>
  );
}

export const ICON_MAP: Record<string, (p: IconProps) => ReactNode> = {
  Users,
  DollarSign,
  Building2,
  Landmark,
  Star,
  Sun,
  Plane,
  CalendarDays,
  Coins,
  Shield,
  Wifi,
  Phone,
  Car,
  CheckCircle,
  Info,
  MapPin,
  Clock,
  Globe,
  Thermometer,
};
