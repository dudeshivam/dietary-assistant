import { useTheme } from "@/hooks/useTheme";
import { Leaf, Menu, Moon, Sun, X } from "lucide-react";
import { useEffect, useState } from "react";

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Pricing", href: "#pricing" },
  { label: "About", href: "#about" },
];

export function Navbar() {
  const { theme, toggle } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (href: string) => {
    setMenuOpen(false);
    const el = document.querySelector(href);
    el?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header
      data-ocid="navbar"
      className={`fixed top-0 left-0 right-0 z-50 transition-smooth ${
        scrolled
          ? "bg-card/90 backdrop-blur-md border-b border-border shadow-subtle"
          : "bg-transparent"
      }`}
    >
      <nav className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <button
          data-ocid="navbar.logo"
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="flex items-center gap-2 font-display font-bold text-xl text-foreground"
          aria-label="Dietary Assistant home"
        >
          <span className="flex items-center justify-center w-8 h-8 rounded-lg gradient-primary shadow-glow">
            <Leaf className="w-4 h-4 text-white" aria-hidden="true" />
          </span>
          <span>
            Dietary <span className="text-gradient">Assistant</span>
          </span>
        </button>

        {/* Desktop nav */}
        <ul className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <a
                data-ocid={`navbar.${link.label.toLowerCase().replace(/\s+/g, "-")}.link`}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  scrollTo(link.href);
                }}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-smooth"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          <button
            data-ocid="navbar.theme_toggle"
            type="button"
            onClick={toggle}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            className="hidden md:flex items-center justify-center w-9 h-9 rounded-full border border-border bg-card hover:bg-muted transition-smooth"
          >
            {theme === "dark" ? (
              <Sun
                className="w-4 h-4 text-muted-foreground"
                aria-hidden="true"
              />
            ) : (
              <Moon
                className="w-4 h-4 text-muted-foreground"
                aria-hidden="true"
              />
            )}
          </button>

          <a
            data-ocid="navbar.cta_button"
            href="/signup"
            className="hidden md:inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold text-white gradient-primary hover:opacity-90 transition-smooth shadow-glow"
          >
            Register
          </a>

          {/* Mobile menu toggle */}
          <button
            data-ocid="navbar.mobile_menu_toggle"
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            className="md:hidden flex items-center justify-center w-9 h-9 rounded-full border border-border bg-card"
          >
            {menuOpen ? (
              <X className="w-4 h-4" aria-hidden="true" />
            ) : (
              <Menu className="w-4 h-4" aria-hidden="true" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      {menuOpen && (
        <div
          data-ocid="navbar.mobile_menu"
          className="md:hidden bg-card border-b border-border animate-slideDown"
        >
          <ul className="flex flex-col px-6 py-4 gap-1">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  data-ocid={`navbar.mobile.${link.label.toLowerCase().replace(/\s+/g, "-")}.link`}
                  href={link.href}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollTo(link.href);
                  }}
                  className="block py-3 text-sm font-medium text-muted-foreground hover:text-foreground transition-smooth border-b border-border last:border-0"
                >
                  {link.label}
                </a>
              </li>
            ))}
            <li className="flex items-center justify-between pt-3">
              <a
                data-ocid="navbar.mobile.cta_button"
                href="/signup"
                className="inline-flex items-center px-5 py-2.5 rounded-full text-sm font-semibold text-white gradient-primary"
              >
                Register
              </a>
              <button
                data-ocid="navbar.mobile.theme_toggle"
                type="button"
                onClick={toggle}
                aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
                className="flex items-center justify-center w-9 h-9 rounded-full border border-border bg-muted"
              >
                {theme === "dark" ? (
                  <Sun
                    className="w-4 h-4 text-muted-foreground"
                    aria-hidden="true"
                  />
                ) : (
                  <Moon
                    className="w-4 h-4 text-muted-foreground"
                    aria-hidden="true"
                  />
                )}
              </button>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
