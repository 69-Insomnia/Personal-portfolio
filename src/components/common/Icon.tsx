import {
  Code,
  Database,
  Layers,
  Megaphone,
  Palette,
  Search,
  Server,
  ShoppingBag,
  Sparkles,
  Target,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react';
import type { IconName } from '@/types';

export const iconMap: Record<IconName, LucideIcon> = {
  code: Code,
  search: Search,
  target: Target,
  chart: TrendingUp,
  'shopping-bag': ShoppingBag,
  megaphone: Megaphone,
  layers: Layers,
  server: Server,
  database: Database,
  palette: Palette,
  sparkles: Sparkles,
};

interface IconProps {
  name: IconName;
  size?: number;
  className?: string;
  strokeWidth?: number;
}

export function Icon({ name, size = 20, className, strokeWidth = 1.75 }: IconProps) {
  const Component = iconMap[name];
  return <Component size={size} strokeWidth={strokeWidth} className={className} aria-hidden="true" />;
}
