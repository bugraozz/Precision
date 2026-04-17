import { config } from "@tamagui/config/v3";
import { createTamagui } from "tamagui";

const precisionDarkTheme = {
  ...config.themes.dark,
  background: "#030508",
  backgroundFocus: "#060e1e",
  color: "#f0f2f8",
  colorFocus: "#ffffff",
  borderColor: "rgba(255,255,255,0.08)",
  borderColorFocus: "rgba(252,215,122,0.56)",
  shadowColor: "#000000",
  primary: "#f59e0b",
  primaryHover: "#fbbf24",
  secondary: "#22d3ee",
  secondaryHover: "#22d3ee"
};

const tamaguiConfig = createTamagui({
  ...config,
  themes: {
    ...config.themes,
    precision_dark: precisionDarkTheme
  },
  tokens: {
    ...config.tokens,
    color: {
      ...config.tokens.color,
      precisionBg: "#030508",
      precisionCard: "rgba(12,20,40,0.55)",
      precisionText: "#f0f2f8",
      precisionMuted: "#8896b0",
      precisionPrimary: "#f59e0b",
      precisionPrimarySoft: "rgba(251,191,36,0.18)",
      precisionAccent: "#22d3ee"
    }
  }
});

export type AppTamaguiConfig = typeof tamaguiConfig;

declare module "tamagui" {
  interface TamaguiCustomConfig extends AppTamaguiConfig {}
}

export default tamaguiConfig;
