"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import {
  BookOpen,
  GraduationCap,
  Users,
  User,
  Bell,
  Search,
  Menu,
} from "lucide-react";
import { Button, Input } from "@/components/ui";

const navItems = [
  { href: "/learn", label: "Learn", icon: BookOpen },
  { href: "/practice", label: "Practice", icon: GraduationCap },
  { href: "/community", label: "Community", icon: Users },
];

interface NavbarProps {
  onMenuClick?: () => void;
}

export function Navbar({ onMenuClick }: NavbarProps) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 bg-neutral-900 border-b border-neutral-700">
      <div className="flex items-center justify-between h-16 px-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="p-2 text-neutral-400 hover:text-neutral-200 lg:hidden"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
              <span className="font-heading font-semibold text-neutral-900">N</span>
            </div>
            <span className="font-heading font-semibold text-lg text-neutral-200 hidden sm:block">
              Nihongo Master
            </span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-yellow-500/10 text-yellow-500"
                    : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800"
                )}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden lg:block w-64">
            <Input
              placeholder="Search..."
              icon={<Search className="w-5 h-5" />}
            />
          </div>

          <button className="p-2 text-neutral-400 hover:text-neutral-200 relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-yellow-500 rounded-full" />
          </button>

          <button className="flex items-center gap-2 p-2 rounded-lg hover:bg-neutral-800 transition-colors">
            <div className="w-8 h-8 bg-neutral-700 rounded-lg flex items-center justify-center">
              <User className="w-5 h-5 text-neutral-400" />
            </div>
          </button>
        </div>
      </div>
    </header>
  );
}
