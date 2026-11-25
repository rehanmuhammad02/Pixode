import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import { api } from "../lib/api";
import defaults from "../data/studio.json";
const StudioContext = createContext(null);
export function StudioProvider({ children }) {
  const [content, setContent] = useState(defaults);
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [offline, setOffline] = useState(false);
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem("pixode-theme") || "dark";
    } catch {
      return "dark";
    }
  });
  const preference = useRef(false);
  useEffect(() => {
    try {
      preference.current = !!localStorage.getItem("pixode-theme");
    } catch {}
  }, []);
  const refreshContent = useCallback(async () => {
    try {
      const data = await api("/api/content");
      setContent(data);
      if (!preference.current)
        setTheme(data.settings.defaultTheme === "light" ? "light" : "dark");
      setOffline(false);
    } catch {
      setOffline(true);
    }
  }, []);
  useEffect(() => {
    refreshContent();
    api("/api/admin/session")
      .then((value) => setSession(value.user ? value : null))
      .catch(() => setSession(null))
      .finally(() => setAuthLoading(false));
  }, [refreshContent]);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]').content =
      theme === "light" ? "#f4f7fa" : "#07111d";
  }, [theme]);
  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    preference.current = true;
    setTheme(next);
    try {
      localStorage.setItem("pixode-theme", next);
    } catch {}
  };
  const logout = async () => {
    await api("/api/admin/logout", {
      method: "POST",
      csrf: session.csrf,
      body: {},
    });
    setSession(null);
  };
  return (
    <StudioContext.Provider
      value={{
        content,
        refreshContent,
        session,
        setSession,
        authLoading,
        offline,
        theme,
        toggleTheme,
        logout,
      }}
    >
      {children}
    </StudioContext.Provider>
  );
}
export const useStudio = () => useContext(StudioContext);
