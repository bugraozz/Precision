import React from "react";
import { Text, View } from "tamagui";
import Pressable from "../components/TamaguiPressable";
import { styles } from "../styles";
import { t, TUTORIAL_STEPS_I18N, getLang } from "../i18n";
import type { Lang } from "../i18n";

export type TutorialOverlayProps = {
  tutorialStep: number;
  advanceTutorial: () => void;
  skipTutorial: () => void;
  lang: Lang;
};

export default function TutorialOverlay(props: TutorialOverlayProps) {
  const { tutorialStep, advanceTutorial, skipTutorial, lang } = props;
  const steps = TUTORIAL_STEPS_I18N[lang];

  return (
    <View style={styles.tutorialOverlay}>
      <View style={styles.tutorialCard}>
        <Text style={styles.tutorialTitle}>{t("quickStart")}</Text>
        <Text style={styles.tutorialText}>{steps[tutorialStep]}</Text>
        <View style={styles.tutorialActions}>
          <Pressable onPress={skipTutorial} style={({ pressed }) => [styles.tutorialGhostButton, pressed && styles.buttonPressedSoft]}>
            <Text style={styles.tutorialGhostLabel}>{t("skip")}</Text>
          </Pressable>
          <Pressable onPress={advanceTutorial} style={({ pressed }) => [styles.tutorialPrimaryButton, pressed && styles.buttonPressedPrimary]}>
            <Text style={styles.tutorialPrimaryLabel}>{tutorialStep < steps.length - 1 ? t("nextTip") : t("startPlaying")}</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
