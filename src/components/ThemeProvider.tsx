"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark" | "auto";

type ThemeContextType = {
    theme: Theme;
    toggleTheme: () => void;
    setTheme: (theme: Theme) => void;
};

const ThemeContext = createContext<ThemeContextType>({
    theme: "auto",
    toggleTheme: () => {},
    setTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setThemeState] = useState<Theme>("auto");
    const [mounted, setMounted] = useState(false);

    const applyTheme = (newTheme: Theme) => {
        if (newTheme === "auto") {
            const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
            document.documentElement.classList.toggle("dark", prefersDark);
        } else {
            document.documentElement.classList.toggle("dark", newTheme === "dark");
        }
    };

    useEffect(() => {
        setMounted(true);
        const stored = localStorage.getItem("theme") as Theme;
        if (stored && ["light", "dark", "auto"].includes(stored)) {
            setThemeState(stored);
            applyTheme(stored);
        } else {
            setThemeState("auto");
            applyTheme("auto");
        }
    }, []);

    useEffect(() => {
        if (mounted && theme === "auto") {
            const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
            const handleChange = () => {
                document.documentElement.classList.toggle("dark", mediaQuery.matches);
            };
            mediaQuery.addEventListener("change", handleChange);
            return () => mediaQuery.removeEventListener("change", handleChange);
        }
    }, [theme, mounted]);

    const setTheme = (newTheme: Theme) => {
        setThemeState(newTheme);
        localStorage.setItem("theme", newTheme);
        applyTheme(newTheme);
    };

    const toggleTheme = () => {
        const newTheme = theme === "light" ? "dark" : "light";
        setTheme(newTheme);
    };

    if (!mounted) {
        return null;
    }

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    return context;
}
