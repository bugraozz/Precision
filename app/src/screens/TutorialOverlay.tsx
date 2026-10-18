import React from "react";
import { Pressable, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Text, View } from "tamagui";
import { t, TUTORIAL_STEPS_I18N } from "../i18n";
import type { Lang } from "../i18n";
import { PRECISION_COLORS, PRECISION_GRADIENTS, PRECISION_RADIUS } from "../theme/precisionTokens";

export type TutorialOverlayProps = {
  tutorialStep: number;
  advanceTutorial: () => void;
  skipTutorial: () => void;
  lang: Lang;
};

const localStyles = StyleSheet.create({
  scrim: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(2,4,8,0.82)"
  },
  card: {
    position: "absolute",
    left: 24,
    right: 24,
    top: "32%",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: PRECISION_COLORS.borderCard,
    backgroundColor: PRECISION_COLORS.bgPanelStrong,
    paddingVertical: 28,
    paddingHorizontal: 24,
    overflow: "hidden"
  }
});

export default function TutorialOverlay(props: TutorialOverlayProps) {
  const { tutorialStep, advanceTutorial, skipTutorial, lang } = props;
  const steps = TUTORIAL_STEPS_I18N[lang];
  const total = steps.length;

  return (
    <View style={StyleSheet.absoluteFill} zIndex={100}>
      <View style={[localStyles.scrim]} />
      <View style={localStyles.card}>
        {/* Step dots */}
        <View flexDirection="row" gap={6} mb={16}>
          {Array.from({ length: total }).map((_, i) => (
            <View
              key={i}
              w={i === tutorialStep ? 18 : 6}
              h={6}
              br={3}
              bg={i === tutorialStep ? PRECISION_COLORS.primaryStrong : PRECISION_COLORS.whiteTrack}
            />
          ))}
        </View>

        <Text color={PRECISION_COLORS.goldStrong} fos={10} fow="800" ls={2.6} textTransform="uppercase" mb={10}>
          {t("quickStart")}
        </Text>
        <Text color={PRECISION_COLORS.textStrong} fos={19} fow="800" ls={-0.2} lh={28} mb={24}>
          {steps[tutorialStep]}
        </Text>

        <View flexDirection="row" gap={12}>
          <Pressable
            onPress={skipTutorial}
            style={({ pressed }) => ({
              paddingVertical: 14,
              paddingHorizontal: 20,
              borderRadius: PRECISION_RADIUS.xl,
              borderWidth: 1,
              borderColor: PRECISION_COLORS.border,
              backgroundColor: pressed ? PRECISION_COLORS.surfaceStrong : PRECISION_COLORS.surface,
              transform: [{ scale: pressed ? 0.97 : 1 }]
            })}
          >
            <Text color={PRECISION_COLORS.textMuted} fow="800" fos={13} textTransform="uppercase" ls={0.8}>
              {t("skip")}
            </Text>
          </Pressable>

          <View flex={1} br={PRECISION_RADIUS.xl} overflow="hidden">
            <LinearGradient colors={PRECISION_GRADIENTS.primary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <Pressable
                onPress={advanceTutorial}
                style={({ pressed }) => ({
                  paddingVertical: 14,
                  alignItems: "center",
                  transform: [{ scale: pressed ? 0.97 : 1 }]
                })}
              >
                <Text color={PRECISION_COLORS.primaryInk} fow="900" fos={14} textTransform="uppercase" ls={0.8}>
                  {tutorialStep < steps.length - 1 ? t("nextTip") : t("startPlaying")}
                </Text>
              </Pressable>
            </LinearGradient>
          </View>
        </View>
      </View>
    </View>
  );
}
