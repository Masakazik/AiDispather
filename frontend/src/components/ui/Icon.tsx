import {
  ArrowsDownUp,
  Bell,
  Buildings,
  CalendarBlank,
  ChartBar,
  ChatCircleDots,
  ChatsTeardrop,
  Check,
  CheckCircle,
  Checks,
  Download,
  Drop,
  Eye,
  FileText,
  Files,
  Gauge,
  Gear,
  GearSix,
  Globe,
  IdentificationBadge,
  Key,
  Lightning,
  MagnifyingGlass,
  MapPin,
  Paperclip,
  Robot,
  ShieldWarning,
  Sparkle,
  Stack,
  Thermometer,
  Ticket,
  Trash,
  UsersThree,
  Warning,
  WarningOctagon,
  X,
  type Icon as PhosphorIcon,
} from '@phosphor-icons/react';

/** Maps the design's `IconXxx` glyph names to Phosphor icon components. */
const GLYPHS: Record<string, PhosphorIcon> = {
  IconGauge: Gauge,
  IconTicket: Ticket,
  IconUsersThree: UsersThree,
  IconBuildings: Buildings,
  IconIdentificationBadge: IdentificationBadge,
  IconCalendarBlank: CalendarBlank,
  IconChecks: Checks,
  IconChartBar: ChartBar,
  IconFiles: Files,
  IconGearSix: GearSix,
  IconGear: Gear,
  IconBell: Bell,
  IconSparkle: Sparkle,
  IconMapPin: MapPin,
  IconPaperclip: Paperclip,
  IconChatCircleDots: ChatCircleDots,
  IconChatsTeardrop: ChatsTeardrop,
  IconWarningOctagon: WarningOctagon,
  IconWarning: Warning,
  IconDrop: Drop,
  IconThermometer: Thermometer,
  IconKey: Key,
  IconTrash: Trash,
  IconLightning: Lightning,
  IconShieldWarning: ShieldWarning,
  IconCheckCircle: CheckCircle,
  IconCheck: Check,
  IconArrowsDownUp: ArrowsDownUp,
  IconFileText: FileText,
  IconDownload: Download,
  IconRobot: Robot,
  IconGlobe: Globe,
  IconStack: Stack,
  IconX: X,
  IconEye: Eye,
  IconSearch: MagnifyingGlass,
};

export type GlyphName = keyof typeof GLYPHS | string;

interface IconProps {
  name: GlyphName;
  size?: number;
  weight?: 'thin' | 'light' | 'regular' | 'bold' | 'fill' | 'duotone';
  color?: string;
  className?: string;
}

/** Renders a Phosphor icon by its design glyph name. Returns null if unknown. */
export function Icon({ name, size = 18, weight = 'regular', color, className }: IconProps) {
  const Cmp = GLYPHS[name];
  if (!Cmp) return null;
  return <Cmp size={size} weight={weight} color={color} className={className} />;
}
