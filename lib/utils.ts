import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Generate a random short slug (default 7 chars). */
const ALPHABET = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
export function randomSlug(length = 7): string {
  let out = "";
  const cryptoObj =
    typeof globalThis.crypto !== "undefined" ? globalThis.crypto : undefined;
  if (cryptoObj?.getRandomValues) {
    const bytes = new Uint8Array(length);
    cryptoObj.getRandomValues(bytes);
    for (let i = 0; i < length; i++) out += ALPHABET[bytes[i] % ALPHABET.length];
  } else {
    for (let i = 0; i < length; i++)
      out += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return out;
}

/** Validate a custom alias (letters, digits, hyphen, underscore). */
export function isValidAlias(alias: string): boolean {
  return /^[a-zA-Z0-9_-]{3,64}$/.test(alias);
}

/** Human-friendly relative time. */
export function timeAgo(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const seconds = Math.floor((Date.now() - d.getTime()) / 1000);
  const units: [number, string][] = [
    [60, "second"],
    [3600, "minute"],
    [86400, "hour"],
    [604800, "day"],
    [2629800, "week"],
    [31557600, "month"],
    [Infinity, "year"],
  ];
  let i = 0;
  while (seconds >= units[i][0] && i < units.length - 1) i++;
  const value = Math.floor(seconds / (units[i - 1]?.[0] || 1));
  const label = units[i][1];
  return `${value} ${label}${value === 1 ? "" : "s"} ago`;
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat("en-US").format(n);
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** Hash an IP for privacy-preserving unique-click detection. */
export async function hashIp(ip: string): Promise<string> {
  const data = new TextEncoder().encode(ip);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
