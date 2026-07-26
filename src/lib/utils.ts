import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Parses `#rgb` / `#rrggbb` into [r, g, b]. Returns null for anything else. */
function parseHex(hex: string): [number, number, number] | null {
  const value = hex.trim().replace(/^#/, "");
  const full =
    value.length === 3
      ? value
          .split("")
          .map((c) => c + c)
          .join("")
      : value;
  if (!/^[0-9a-f]{6}$/i.test(full)) return null;
  return [
    parseInt(full.slice(0, 2), 16),
    parseInt(full.slice(2, 4), 16),
    parseInt(full.slice(4, 6), 16),
  ];
}

/** Relative luminance per WCAG 2.1. */
function luminance([r, g, b]: [number, number, number]) {
  const [lr, lg, lb] = [r, g, b].map((channel) => {
    const c = channel / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * lr + 0.7152 * lg + 0.0722 * lb;
}

/**
 * Picks the foreground colour with the better WCAG contrast against `background`.
 * Admins choose promotion background colours freely, so text can't be hardcoded
 * to white — a pale background would render it invisible.
 */
export function readableTextOn(
  background: string | undefined,
  dark = "#111111",
  light = "#ffffff",
) {
  const rgb = background ? parseHex(background) : null;
  if (!rgb) return undefined;
  const bg = luminance(rgb);
  const contrast = (fg: [number, number, number]) => {
    const l = luminance(fg);
    return (Math.max(l, bg) + 0.05) / (Math.min(l, bg) + 0.05);
  };
  const darkRgb = parseHex(dark);
  const lightRgb = parseHex(light);
  if (!darkRgb || !lightRgb) return undefined;
  return contrast(darkRgb) >= contrast(lightRgb) ? dark : light;
}
