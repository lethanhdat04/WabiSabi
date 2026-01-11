"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import {
  BookOpen,
  Video,
  Layers,
  Mic,
  PenTool,
  BarChart3,
  Settings,
  HelpCircle,
  X,
  Flame,
  Target,
  MessageSquare,
  User,
  Clock,
  TrendingUp,
} from "lucide-react";
import { Progress } from "@/components/ui";

const learnItems = [
  { href: "/learn", label: "Overview", icon: BookOpen },
  { href: "/learn/videos", label: "Video Library", icon: Video },
  { href: "/decks", label: "Vocabulary Decks", icon: Layers },
];

const practiceItems = [
  { href: "/practice", label: "Overview", icon: Target },
  { href: "/practice/shadowing", label: "Shadowing", icon: Mic },
  { href: "/practice/dictation", label: "Dictation", icon: PenTool },
  { href: "/practice/flashcards", label: "Flashcards", icon: Layers },
  { href: "/practice/fill-in", label: "Fill-in-the-Blank", icon: PenTool },
];

const communityItems = [
  { href: "/community", label: "Community", icon: MessageSquare },
];

const userItems = [
  { href: "/profile", label: "Profile", icon: User },
  { href: "/progress", label: "Progress", icon: TrendingUp },
  { href: "/history", label: "History", icon: Clock },
];

const otherItems = [
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/help", label: "Help", icon: HelpCircle },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={clsx(
          "fixed top-0 left-0 z-50 h-full w-64 bg-neutral-900 border-r border-neutral-700",
          "transform transition-transform duration-200 lg:translate-x-0 lg:static lg:z-auto",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between h-16 px-4 border-b border-neutral-700 lg:hidden">
            <span className="font-heading font-semibold text-lg">Menu</span>
            <button
              onClick={onClose}
              className="p-2 text-neutral-400 hover:text-neutral-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-4">
            <div className="px-4 mb-4">
              <div className="card">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-yellow-500/10 rounded-lg flex items-center justify-center">
                    <Flame className="w-5 h-5 text-yellow-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-200">7 day streak</p>
                    <p className="text-xs text-neutral-400">Keep it up!</p>
                  </div>
                </div>
                <Progress value={72} showLabel />
              </div>
            </div>

            <nav className="px-3">
              <div className="mb-4">
                <p className="px-3 mb-2 text-xs font-medium text-neutral-400 uppercase tracking-wider">
                  Learn
                </p>
                {learnItems.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      className={clsx(
                        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors mb-1",
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
              </div>

              <div className="mb-4">
                <p className="px-3 mb-2 text-xs font-medium text-neutral-400 uppercase tracking-wider">
                  Practice
                </p>
                {practiceItems.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      className={clsx(
                        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors mb-1",
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
              </div>

              <div className="mb-4">
                <p className="px-3 mb-2 text-xs font-medium text-neutral-400 uppercase tracking-wider">
                  Community
                </p>
                {communityItems.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      className={clsx(
                        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors mb-1",
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
              </div>

              <div className="mb-4">
                <p className="px-3 mb-2 text-xs font-medium text-neutral-400 uppercase tracking-wider">
                  You
                </p>
                {userItems.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      className={clsx(
                        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors mb-1",
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
              </div>

              <div className="pt-4 border-t border-neutral-700">
                {otherItems.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      className={clsx(
                        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors mb-1",
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
              </div>
            </nav>
          </div>
        </div>
      </aside>
    </>
  );
}
