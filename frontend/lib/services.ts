import {
  Code2,
  Globe,
  Smartphone,
  ShoppingCart,
  Server,
  Search,
  Megaphone,
  Palette,
  type LucideIcon,
} from "lucide-react";

export type Service = {
  title: string;
  description: string;
  icon: LucideIcon;
  href?: string;
};

export const services: Service[] = [
  {
    title: "Software Development",
    description: "Custom software built around how your business actually works.",
    icon: Code2,
    href: "/services/software-development",
  },
  {
    title: "Web Development",
    description: "Fast, modern websites and web apps that convert visitors.",
    icon: Globe,
    href: "/services/web-development",
  },
  {
    title: "Mobile App Development",
    description: "Native and cross-platform apps for iOS and Android.",
    icon: Smartphone,
  },
  {
    title: "E-Commerce",
    description: "Online stores built to sell, from checkout to fulfillment.",
    icon: ShoppingCart,
  },
  {
    title: "Domain & Hosting",
    description: "Reliable domains and hosting, managed end to end.",
    icon: Server,
  },
  {
    title: "Search Engine Optimization",
    description: "Get found on Google with technical and content SEO.",
    icon: Search,
  },
  {
    title: "Marketing",
    description: "Campaigns that bring the right customers to your door.",
    icon: Megaphone,
  },
  {
    title: "Design & Branding",
    description: "Identity and visual design that makes you memorable.",
    icon: Palette,
  },
];
