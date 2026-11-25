import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Brand from "./Brand";
import Icon from "./Icon";
import { useStudio } from "../context/StudioContext";
export default function Navbar() {
  const { theme, toggleTheme, session, content } = useStudio();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const scroll = () => setScrolled(window.scrollY > 45);
    window.addEventListener("scroll", scroll, { passive: true });
    const key = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", key);
    return () => {
      window.removeEventListener("scroll", scroll);
      document.removeEventListener("keydown", key);
    };
  }, []);
  return (
    <header className={`navbar ${scrolled ? "scrolled" : ""}`}>
      <Brand logo={content.settings.logo} />
      <nav
        id="public-navigation"
        className={open ? "open" : ""}
        aria-label="Main navigation"
      >
        {[
          ["work", "Selected work"],
          ["services", "What we do"],
          ["pricing", "Packages"],
          ["studio", "Our studio"],
        ].map(([id, label]) => (
          <a key={id} href={`/#${id}`} onClick={() => setOpen(false)}>
            {label}
          </a>
        ))}
      </nav>
      <div className="nav-actions">
        <button
          className="icon-button"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
        >
          <Icon name={theme === "dark" ? "sun" : "moon"} />
        </button>
        <Link
          className="icon-button account-link"
          to={session ? "/admin" : "/login"}
          aria-label={session ? "Open workspace" : "Sign in"}
        >
          <Icon name="users" />
        </Link>
        <a className="nav-contact" href="/#contact">
          Let’s talk <Icon name="arrow-up-right" size={17} />
        </a>
        <button
          className="icon-button menu-button"
          aria-label={open ? "Close navigation" : "Open navigation"}
          aria-expanded={open}
          aria-controls="public-navigation"
          onClick={() => setOpen(!open)}
        >
          <Icon name={open ? "close" : "menu"} />
        </button>
      </div>
    </header>
  );
}
