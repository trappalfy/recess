export const COPY = {
  hero: {
    h1: ["Friday Closed.", "Monday Decides."],
    locksIn: "Locks in",
    settling: "Settling at the open",
    connect: "Connect wallet",
    launch: "Launch app",
  },
  features: {
    badge: "Welcome to Recess",
    h2: "One Question per Ticker",
    lead: "Every Friday at the close: will Monday open above or below?",
    card1: {
      h3: "Settles on the Stock, Never the Pool",
      body:
        "Every market resolves on the Chainlink reference price when the feed wakes up. A meme that corners the float can move the pool. It can't move the result.",
    },
    card2: {
      body:
        "A parimutuel pool in USDG for every ticker. No market maker, no order book: the two sides fund each other.",
    },
    card3: {
      body:
        "Pick a side before the bell. Above or below Friday's close, one tap, straight from your wallet.",
      button: "Open the board",
    },
    card4: {
      h3: "Weekend Prices Are a Rumor",
      body:
        "When the exchange is closed, a thin pool is the only price. Recess lets you take a side on the gap without trusting that print.",
    },
  },
  solution: {
    badge: "How It Works",
    h2:
      "Markets Open at Friday's Close, Stay Open While the Reference Sleeps, and Settle on Its First Fresh Print.",
    left:
      "Pick a ticker and a side: above Friday's close or below it. Stake USDG from your wallet. No account, no margin, nothing to manage.",
    right:
      "When the feed prints again, the winning side splits the pool pro rata. The weekend price was a rumor. The open is the answer.",
  },
  showcase: {
    groups: [
      {
        title: "Pick a Side",
        bullets: [
          ["Above or below:", "one question per ticker, asked at every Friday close."],
          ["One tap:", "stake USDG straight from your wallet."],
          ["Clear cutoff:", "bets lock before the reference price wakes up."],
        ],
      },
      {
        title: "The Weekend Pool",
        bullets: [
          ["Parimutuel:", "both sides fund a single pool."],
          ["No house:", "no market maker, no order book, no counterparty."],
          ["Live split:", "the balance between sides updates as stakes come in."],
        ],
      },
      {
        title: "Settlement",
        bullets: [
          ["Reference, not pool:", "results come from the Chainlink feed, not an AMM price."],
          ["First fresh print:", "the market settles on the first reference tick after the weekend."],
          ["Pro rata:", "the winning side splits the pool by stake."],
        ],
      },
    ],
    slide2: { title: "NVDA Pool", sub: "Open until the reference wakes up." },
    slide3: { pill: "Settled" },
  },
  cta: {
    h2: "Be There When the Bell Rings",
    lead: "The board opens at every Friday close.",
  },
  footer: {
    copyright: "\u00A9 2026 Recess. All rights reserved.",
    disclaimer:
      "Not affiliated with Robinhood Markets. Not available in the US and other restricted jurisdictions.",
    terms: "Terms",
    risk: "Risk",
  },
} as const;
