import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export function formatDurationShort(ms: number) {
  if (ms < 1000) {
    return `${ms}ms`;
  }
  const seconds = ms / 1000;
  if (seconds < 60) {
    return `${seconds.toFixed(1).replace(/\.0$/, '')}s`;
  } else if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    const remSeconds = Math.round(seconds % 60);
    return remSeconds === 0
      ? `${minutes}m`
      : `${minutes}m ${remSeconds}s`;
  } else {
    const hours = Math.floor(seconds / 3600);
    const remMinutes = Math.round((seconds % 3600) / 60);
    return remMinutes === 0
      ? `${hours}h`
      : `${hours}h ${remMinutes}m`;
  }
}