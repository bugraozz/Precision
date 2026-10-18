import { config } from "@tamagui/config/v3";
import { createTamagui } from "tamagui";
import { PRECISION_COLORS } from "./src/theme/precisionTokens";

const precisionDarkTheme = {
  ...config.themes.dark,
  background: PRECISION_COLORS.bg,
  backgroundFocus: "#0a0f18",
  color: PRECISION_COLORS.text,
  colorFocus: PRECISION_COLORS.textStrong,
  borderColor: PRECISION_COLORS.border,
  borderColorFocus: PRECISION_COLORS.borderGoldActive,
  shadowColor: PRECISION_COLORS.shadowBlack,
  primary: PRECISION_COLORS.primary,
  primaryHover: PRECISION_COLORS.primaryStrong,
  secondary: PRECISION_COLORS.cyan,
  secondaryHover: PRECISION_COLORS.cyan
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
      precisionBg: PRECISION_COLORS.bg,
      precisionCard: PRECISION_COLORS.surface,
      precisionText: PRECISION_COLORS.text,
      precisionMuted: PRECISION_COLORS.textMuted,
      precisionPrimary: PRECISION_COLORS.primary,
      precisionPrimarySoft: PRECISION_COLORS.primarySoft,
      precisionAccent: PRECISION_COLORS.cyan
    }
  }
});

export type AppTamaguiConfig = typeof tamaguiConfig;

declare module "tamagui" {
  interface TamaguiCustomConfig extends AppTamaguiConfig {}
}

export default tamaguiConfig;
