import { Button } from "@/components/ui/button";
import { GraduationCap, LogOut, Menu, Settings, X } from "lucide-react";
import { useState } from "react";
import type { Page } from "../App";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useCallerProfile, useIsAdmin } from "../hooks/useQueries";

interface NavbarProps {
  page: Page;
  navigate: (p: Page) => void;
}

export default function Navbar({ page, navigate }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { login, clear, identity, isLoggingIn } = useInternetIdentity();
  const { data: isAdmin } = useIsAdmin();
  const { data: profile } = useCallerProfile();

  const isLoggedIn = !!identity && !identity.getPrincipal().isAnonymous();

  const navLinks = [
    { label: "Courses", action: () => navigate({ name: "home" }) },
    {
      label: "Explore",
      action: () => {
        navigate({ name: "home" });
        setTimeout(
          () =>
            document
              .getElementById("courses-section")
              ?.scrollIntoView({ behavior: "smooth" }),
          100,
        );
      },
    },
    {
      label: "Materials",
      action: () => {
        navigate({ name: "home" });
        setTimeout(
          () =>
            document
              .getElementById("materials-section")
              ?.scrollIntoView({ behavior: "smooth" }),
          100,
        );
      },
    },
  ];

  const principalShort = isLoggedIn
    ? `${identity.getPrincipal().toString().slice(0, 8)}...`
    : "";

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-border shadow-xs">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate({ name: "home" })}
          className="flex items-center gap-2.5 group"
          data-ocid="nav.link"
        >
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-sm">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg text-foreground tracking-tight">
            Cloud<span className="text-primary">Learn</span>
          </span>
        </button>

        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <button
              type="button"
              key={link.label}
              onClick={link.action}
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              data-ocid="nav.link"
            >
              {link.label}
            </button>
          ))}
          {isLoggedIn && isAdmin && (
            <button
              type="button"
              onClick={() => navigate({ name: "admin" })}
              className={`text-sm font-medium transition-colors flex items-center gap-1.5 ${page.name === "admin" ? "text-primary" : "text-muted-foreground hover:text-primary"}`}
              data-ocid="nav.link"
            >
              <Settings className="w-3.5 h-3.5" />
              Admin
            </button>
          )}
        </nav>

        <div className="hidden md:flex items-center gap-2">
          {isLoggedIn ? (
            <>
              <span className="text-sm text-muted-foreground">
                {profile?.name || principalShort}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={clear}
                className="rounded-full gap-1.5"
                data-ocid="nav.button"
              >
                <LogOut className="w-3.5 h-3.5" />
                Logout
              </Button>
            </>
          ) : (
            <Button
              size="sm"
              onClick={login}
              disabled={isLoggingIn}
              className="rounded-full bg-primary/90 hover:bg-primary text-white"
              data-ocid="nav.button"
            >
              {isLoggingIn ? "Signing in..." : "Login"}
            </Button>
          )}
        </div>

        <button
          type="button"
          className="md:hidden p-2"
          onClick={() => setMobileOpen(!mobileOpen)}
          data-ocid="nav.toggle"
        >
          {mobileOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-white px-4 py-4 flex flex-col gap-3">
          {navLinks.map((link) => (
            <button
              type="button"
              key={link.label}
              onClick={() => {
                link.action();
                setMobileOpen(false);
              }}
              className="text-sm font-medium text-muted-foreground py-1"
              data-ocid="nav.link"
            >
              {link.label}
            </button>
          ))}
          {isLoggedIn && isAdmin && (
            <button
              type="button"
              onClick={() => {
                navigate({ name: "admin" });
                setMobileOpen(false);
              }}
              className="text-sm font-medium text-primary py-1 flex items-center gap-1.5"
              data-ocid="nav.link"
            >
              <Settings className="w-3.5 h-3.5" /> Admin
            </button>
          )}
          {isLoggedIn ? (
            <Button
              variant="outline"
              size="sm"
              onClick={clear}
              className="rounded-full w-full"
              data-ocid="nav.button"
            >
              <LogOut className="w-3.5 h-3.5 mr-1.5" /> Logout
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={login}
              disabled={isLoggingIn}
              className="rounded-full w-full bg-primary/90 hover:bg-primary text-white"
              data-ocid="nav.button"
            >
              {isLoggingIn ? "Signing in..." : "Login"}
            </Button>
          )}
        </div>
      )}
    </header>
  );
}
