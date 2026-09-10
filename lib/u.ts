/** Artboard unit. Every spec coordinate is authored in 1905-wide pixels. */
export const u = (px: number): string => `calc(${px} * var(--u))`;
