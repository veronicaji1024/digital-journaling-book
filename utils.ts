import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Simple date formatter for the "Timestamp" feature
export const getCurrentDate = () => {
  const d = new Date();
  return d.toLocaleDateString('en-US', { year: '2-digit', month: '2-digit', day: '2-digit' });
};