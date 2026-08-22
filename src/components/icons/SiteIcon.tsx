import {
  BarChart3,
  BedDouble,
  Camera,
  ChefHat,
  CircleCheck,
  ClipboardList,
  Coffee,
  DollarSign,
  Flame,
  Footprints,
  House,
  Images,
  Info,
  KeyRound,
  Landmark,
  Leaf,
  Luggage,
  MapPin,
  Mountain,
  Settings,
  Snowflake,
  Star,
  Sun,
  Target,
  User,
  Users,
  Utensils,
  Wrench,
  type LucideIcon,
} from 'lucide-react';

export type SiteIconName =
  | 'activity'
  | 'analytics'
  | 'bed'
  | 'camera'
  | 'check'
  | 'clipboard'
  | 'coffee'
  | 'dining'
  | 'finance'
  | 'fireplace'
  | 'gallery'
  | 'heritage'
  | 'home'
  | 'info'
  | 'key'
  | 'kitchen'
  | 'luggage'
  | 'mapPin'
  | 'mountain'
  | 'nature'
  | 'outdoor'
  | 'settings'
  | 'snow'
  | 'star'
  | 'sun'
  | 'user'
  | 'users'
  | 'wrench';

const iconMap: Record<SiteIconName, LucideIcon> = {
  activity: Target,
  analytics: BarChart3,
  bed: BedDouble,
  camera: Camera,
  check: CircleCheck,
  clipboard: ClipboardList,
  coffee: Coffee,
  dining: Utensils,
  finance: DollarSign,
  fireplace: Flame,
  gallery: Images,
  heritage: Landmark,
  home: House,
  info: Info,
  key: KeyRound,
  kitchen: ChefHat,
  luggage: Luggage,
  mapPin: MapPin,
  mountain: Mountain,
  nature: Leaf,
  outdoor: Footprints,
  settings: Settings,
  snow: Snowflake,
  star: Star,
  sun: Sun,
  user: User,
  users: Users,
  wrench: Wrench,
};

export function SiteIcon({
  name,
  className = 'size-5',
  strokeWidth = 1.8,
}: {
  name: SiteIconName;
  className?: string;
  strokeWidth?: number;
}) {
  const Icon = iconMap[name];
  return <Icon aria-hidden="true" className={className} strokeWidth={strokeWidth} />;
}

export function IconBadge({
  name,
  className = '',
  iconClassName = 'size-6',
}: {
  name: SiteIconName;
  className?: string;
  iconClassName?: string;
}) {
  return (
    <span className={`grid size-12 place-items-center rounded-2xl bg-[#17123b] text-white ${className}`}>
      <SiteIcon name={name} className={iconClassName} />
    </span>
  );
}

export function iconForCategory(category: string): SiteIconName {
  switch (category) {
    case 'culture':
      return 'heritage';
    case 'family':
      return 'users';
    case 'winter':
      return 'snow';
    case 'nature':
      return 'nature';
    case 'outdoor':
      return 'outdoor';
    case 'dining':
      return 'coffee';
    case 'rules':
    case 'general':
      return 'clipboard';
    case 'emergency':
      return 'info';
    case 'practical':
      return 'wrench';
    case 'activity':
    default:
      return 'activity';
  }
}

export function adminIconForHref(href: string): SiteIconName {
  switch (href) {
    case '/admin':
      return 'activity';
    case '/admin/stays':
      return 'home';
    case '/admin/finance':
      return 'finance';
    case '/admin/analytics':
      return 'analytics';
    case '/admin/contractors':
      return 'wrench';
    case '/admin/checklists':
      return 'check';
    case '/admin/property-info':
      return 'clipboard';
    case '/admin/photos':
      return 'camera';
    case '/admin/favorites':
      return 'star';
    case '/admin/settings':
      return 'settings';
    case '/admin/users':
      return 'user';
    default:
      return 'activity';
  }
}
