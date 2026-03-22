import {
  Briefcase, Laptop, TrendingUp, TrendingDown, Gift, DollarSign,
  Utensils, Car, ShoppingBag, Gamepad2, HeartPulse, BookOpen,
  Zap, Home, CreditCard, Circle, Banknote, Building2, Smartphone,
  ArrowLeftRight, Wallet, Users, LayoutDashboard, Plus, Minus,
  type LucideProps,
} from 'lucide-react'

const ICON_MAP: Record<string, React.FC<LucideProps>> = {
  Briefcase,
  Laptop,
  TrendingUp,
  TrendingDown,
  Gift,
  DollarSign,
  Utensils,
  Car,
  ShoppingBag,
  Gamepad2,
  HeartPulse,
  BookOpen,
  Zap,
  Home,
  CreditCard,
  Circle,
  Banknote,
  Building2,
  Smartphone,
  ArrowLeftRight,
  Wallet,
  Users,
  LayoutDashboard,
  Plus,
  Minus,
}

interface DynamicIconProps extends LucideProps {
  name: string
}

export default function DynamicIcon({ name, ...props }: DynamicIconProps) {
  const Icon = ICON_MAP[name] ?? Circle
  return <Icon {...props} />
}
