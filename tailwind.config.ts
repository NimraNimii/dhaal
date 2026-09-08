import type { Config } from "tailwindcss";

// Dhaal's palette is built around the idea of a shield made of paper —
// warm, familiar, official-looking documents, not a cold security scanner.
// Avoids the generic AI-cliche cream+terracotta and black+neon defaults.
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: "#F7F2E6",   // warm ivory background, like old bond paper
        ink: "#2B2621",     // near-black warm charcoal for body text
        shield: "#1F5C52",  // deep teal - brand, trust, calm
        "shield-dark": "#153F38",
        turmeric: "#C98A2C", // warm gold - evidence markers, "confirm" verdict
        clay: "#B5502E",     // muted rust - red-flag verdict, never neon-alarm
        sage: "#5B7A52",     // deep sage - looks-okay verdict
        graphite: "#5C554A", // warm grey - "can't tell yet" verdict
        sand: "#EFE6D3",     // card surface, slightly deeper than bg
        line: "#DCCFB2",     // hairline dividers, warm not cool-grey
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "serif"],
        body: ["var(--font-work-sans)", "sans-serif"],
      },
      maxWidth: {
        prose: "40rem",
      },
    },
  },
  plugins: [],
};

export default config;
