"use client";

import { useState, useRef, useEffect } from "react";
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
  LogOut,
  Settings,
  History,
  BarChart3,
} from "lucide-react";
import { Input } from "@/components/ui";
import { useAuth } from "@/lib/auth-context";

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
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setDropdownOpen(false);
    await logout();
  };

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

          <div ref={dropdownRef} className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-neutral-800 transition-colors"
            >
              <div className="w-8 h-8 bg-neutral-700 rounded-lg flex items-center justify-center overflow-hidden">
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.displayName || user.username}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-5 h-5 text-neutral-400" />
                )}
              </div>
              <span className="text-sm text-neutral-200 hidden sm:block">
                {user?.displayName || user?.username || "User"}
              </span>
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-neutral-800 rounded-xl border border-neutral-700 shadow-lg py-1 z-50">
                <div className="px-4 py-3 border-b border-neutral-700">
                  <p className="text-sm font-medium text-neutral-200">
                    {user?.displayName || user?.username}
                  </p>
                  <p className="text-xs text-neutral-400">{user?.email}</p>
                </div>
                <Link
                  href="/profile"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-3 px-4 py-2 text-sm text-neutral-300 hover:bg-neutral-700"
                >
                  <User className="w-4 h-4" />
                  Profile
                </Link>
                <Link
                  href="/progress"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-3 px-4 py-2 text-sm text-neutral-300 hover:bg-neutral-700"
                >
                  <BarChart3 className="w-4 h-4" />
                  Progress
                </Link>
                <Link
                  href="/history"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-3 px-4 py-2 text-sm text-neutral-300 hover:bg-neutral-700"
                >
                  <History className="w-4 h-4" />
                  History
                </Link>
                <div className="border-t border-neutral-700 mt-1 pt-1">
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:bg-neutral-700 w-full text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
