"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, MessageCircle, Moon, Sun, X } from "lucide-react";
import { useTranslation } from "@/lib/useTranslation";
import { useAuth } from "@/lib/useAuth";
import { whatsappUrl } from "@/lib/contact";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { shellContainer } from "@/lib/design";
import { motionDurations, motionEase } from "@/lib/motion";

export function Navbar() {
  const { t, language, setLanguage } = useTranslation();
  const { isAuthenticated, logout } = useAuth();
  const pathname = usePathname();
  const [darkMode, setDarkMode] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    try {
      const theme = localStorage.getItem("theme");
      if (theme === "dark") {
        document.documentElement.classList.add("dark");
        setDarkMode(true);
      } else {
        document.documentElement.classList.remove("dark");
        setDarkMode(false);
      }
    } catch (error) {
      console.error(error);
      document.documentElement.classList.remove("dark");
      setDarkMode(false);
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const toggleDarkMode = () => {
    const nextMode = !darkMode;
    setDarkMode(nextMode);
    try {
      if (nextMode) {
        document.documentElement.classList.add("dark");
        localStorage.setItem("theme", "dark");
        return;
      }
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    } catch (error) {
      console.error(error);
      if (nextMode) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  };

  const navLinks = [
    { href: "/", label: t.nav.home },
    { href: "/projects", label: t.nav.projects },
    { href: "/about", label: t.nav.about },
    { href: "/contact", label: t.nav.contact },
  ];

  return (
    <header className="sticky top-0 z-50 px-2 pt-2 md:px-0 md:pt-3">
      <div
        className={cn(
          shellContainer,
          "transition-all duration-200",
          scrolled ? "drop-shadow-[0_10px_24px_hsl(var(--foreground)/0.09)]" : ""
        )}
      >
        <motion.div
          initial={{ y: -18, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: motionDurations.normal, ease: motionEase }}
          className={cn(
            "glass-nav rounded-2xl",
            scrolled ? "border-white/20 bg-background/76" : "bg-background/66"
          )}
        >
          <div className="flex h-14 items-center justify-between px-3 md:px-5">
            <Link href="/" className="group inline-flex items-center gap-2">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-primary to-accent text-[11px] font-bold text-primary-foreground">
                AP
              </span>
              <span className="text-sm font-semibold tracking-wide text-foreground md:text-base">
                Portfolio
              </span>
            </Link>

            <nav className="hidden items-center gap-1.5 md:flex" aria-label="Main navigation">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    aria-current={isActive ? "page" : undefined}
                    className="relative px-1.5 py-1"
                  >
                    <span
                      className={cn(
                        "relative rounded-md px-3 py-1.5 text-sm font-semibold transition-colors",
                        isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {link.label}
                    </span>
                    {isActive ? (
                      <motion.span
                        layoutId="nav-underline"
                        className="absolute bottom-0 left-1.5 right-1.5 h-0.5 rounded-full bg-gradient-to-r from-primary to-accent"
                        transition={{ duration: motionDurations.fast, ease: motionEase }}
                      />
                    ) : null}
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center gap-1.5 md:gap-2">
              <div className="hidden items-center rounded-full border border-border/80 bg-secondary/65 p-0.5 sm:flex">
                {(["es", "en"] as const).map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => setLanguage(lang)}
                    data-testid={`lang-${lang}`}
                    className={cn(
                      "rounded-full px-2.5 py-1 text-xs font-semibold uppercase transition",
                      language === lang
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {lang}
                  </button>
                ))}
              </div>

              <Button variant="ghost" size="icon" onClick={toggleDarkMode} aria-label="Toggle theme">
                <AnimatePresence mode="wait" initial={false}>
                  {darkMode ? (
                    <motion.span
                      key="sun"
                      initial={{ rotate: -45, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 45, opacity: 0 }}
                      transition={{ duration: motionDurations.fast }}
                    >
                      <Sun className="h-4 w-4" />
                    </motion.span>
                  ) : (
                    <motion.span
                      key="moon"
                      initial={{ rotate: 45, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -45, opacity: 0 }}
                      transition={{ duration: motionDurations.fast }}
                    >
                      <Moon className="h-4 w-4" />
                    </motion.span>
                  )}
                </AnimatePresence>
              </Button>

              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="hidden sm:block">
                <Button variant="secondary" size="sm" className="gap-1.5">
                  <MessageCircle className="h-3.5 w-3.5" />
                  {t.nav.whatsapp}
                </Button>
              </a>

              <div className="hidden sm:block">
                {isAuthenticated ? (
                  <Button variant="secondary" size="sm" onClick={logout}>
                    {t.nav.logout}
                  </Button>
                ) : (
                  <Link href="/login">
                    <Button variant="secondary" size="sm">
                      {t.nav.login}
                    </Button>
                  </Link>
                )}
              </div>

              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setMobileOpen((prev) => !prev)}
                aria-label="Toggle navigation"
              >
                {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </Button>
            </div>
          </div>

        </motion.div>
      </div>

      <AnimatePresence>
        {mobileOpen ? (
          <>
            <motion.button
              type="button"
              aria-label="Close navigation"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: motionDurations.fast }}
              className="fixed inset-0 z-40 bg-slate-950/38 backdrop-blur-[2px] md:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -16, scale: 0.99 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.99 }}
              transition={{ duration: motionDurations.normal, ease: motionEase }}
              className="fixed left-1/2 top-[4.5rem] z-50 w-[calc(100%-1rem)] max-w-md -translate-x-1/2 overflow-hidden rounded-2xl border border-border/80 bg-background/95 p-3 shadow-2xl backdrop-blur-xl md:hidden"
            >
              <nav className="grid gap-1.5" aria-label="Mobile navigation">
                {navLinks.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={cn(
                        "flex items-center justify-between rounded-xl px-3.5 py-3 text-sm font-semibold transition",
                        isActive ? "bg-primary/14 text-primary" : "text-muted-foreground hover:bg-secondary/70 hover:text-foreground"
                      )}
                    >
                      <span>{link.label}</span>
                      {isActive ? <span className="h-1.5 w-1.5 rounded-full bg-primary" /> : null}
                    </Link>
                  );
                })}
              </nav>

              <div className="mt-3 flex items-center justify-between gap-2 border-t border-border/70 pt-3">
                <div className="flex items-center rounded-full border border-border/80 bg-secondary/65 p-0.5">
                  {(["es", "en"] as const).map((lang) => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => setLanguage(lang)}
                      data-testid={`mobile-lang-${lang}`}
                      className={cn(
                        "rounded-full px-2.5 py-1 text-xs font-semibold uppercase transition",
                        language === lang
                          ? "bg-background text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                  <Button variant="secondary" size="sm" className="gap-1.5">
                    <MessageCircle className="h-3.5 w-3.5" />
                    {t.nav.whatsapp}
                  </Button>
                </a>
                {isAuthenticated ? (
                  <Button variant="secondary" size="sm" onClick={logout}>
                    {t.nav.logout}
                  </Button>
                ) : (
                  <Link href="/login">
                    <Button variant="secondary" size="sm">
                      {t.nav.login}
                    </Button>
                  </Link>
                )}
              </div>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
