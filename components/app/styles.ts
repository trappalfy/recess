/** Update §7: the dark ink pill is the primary button everywhere in the app. */
export const PILL_DARK =
  "inline-flex h-10 items-center justify-center rounded-full bg-ink px-5 text-[15px] text-white transition-colors duration-200 hover:bg-[#0D1238] focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-blue";

/** The full-width action at the foot of the stake and result panels. */
export const ACTION_BTN =
  "h-[52px] w-full rounded-full bg-ink text-[17px] text-white transition-colors duration-200 enabled:hover:bg-[#0D1238] disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-blue";

/** Update §7: every card sits at radius 32 with a line border. */
export const CARD = "rounded-[32px] border border-line bg-white";

export const H1_STYLE = {
  fontFamily: "var(--font-jakarta)",
  fontWeight: 500,
  fontSize: "clamp(30px, 4vw, 40px)",
  lineHeight: 1.1,
} as const;

export const H2_STYLE = {
  fontFamily: "var(--font-jakarta)",
  fontWeight: 500,
  fontSize: 20,
  lineHeight: 1.3,
} as const;
