import React from "react";
import { Animated } from "react-native";
import { ScrollView, Text, View } from "tamagui";
import Pressable from "../components/TamaguiPressable";
import RoundComparisonCard from "../components/RoundComparisonCard";
import { styles } from "../styles";
import type { CosmeticVisual } from "../cosmetics";
import type { RoundFeedback, HomePanelKey } from "../types/app";
import type { Point, RoundInput } from "../../../src/core/types";
import { t, tShape } from "../i18n";
import type { Lang } from "../i18n";

export type CompleteScreenProps = {
  playAnim: Animated.Value;
  playMode: "level" | "challenge";
  feedback: RoundFeedback | null;
  round: RoundInput;
  drawnPoints: Point[];
  challengeShape: string;
  canGoNextLevel: boolean;
  nextLevelLabel: string;
  hasPremiumNoAds: boolean;
  canShowRewardedRetry: boolean;
  rewardedAdsEnabled: boolean;
  rewardedAdOnCooldown: boolean;
  rewardedAdsRemaining: number;
  cosmeticVisual: CosmeticVisual;
  // Handlers
  setScreen: (screen: "main" | "home" | "play" | "complete") => void;
  setPlayMode: (mode: "level" | "challenge") => void;
  setHomePanel: (panel: HomePanelKey) => void;
  handleRetryFromComplete: () => void;
  handleNextFromComplete: () => void;
  handleRewardedRetry: () => void;
  startChallengePlay: () => void;
  lang: Lang;
};

export default function CompleteScreen(props: CompleteScreenProps) {
  const {
    playAnim, playMode, feedback, round, drawnPoints,
    challengeShape, canGoNextLevel, nextLevelLabel,
    hasPremiumNoAds, canShowRewardedRetry, rewardedAdsEnabled,
    rewardedAdOnCooldown, rewardedAdsRemaining, cosmeticVisual,
    setScreen, setPlayMode, setHomePanel,
    handleRetryFromComplete, handleNextFromComplete,
    handleRewardedRetry, startChallengePlay,
    lang
  } = props;

  return (
    <Animated.View
      style={{
        flex: 1,
        opacity: playAnim,
        transform: [
          {
            translateY: playAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [22, 0]
            })
          }
        ]
      }}
    >
      <ScrollView contentContainerStyle={styles.completeContent}>
        <Text style={styles.completeTitle}>{playMode === "challenge" ? t("challengeComplete") : t("levelComplete")}</Text>
        <Text style={styles.completeSubtitle}>{playMode === "challenge" ? t("challengeCompleteDesc") : t("levelCompleteDesc")}</Text>

        {feedback ? (
          <RoundComparisonCard
            targetShape={playMode === "challenge" ? challengeShape : round.targetShape}
            userPoints={playMode === "challenge" ? drawnPoints : round.points}
            accuracyPercent={feedback.accuracyPercent}
            meanDeviation={feedback.meanDeviation}
            stars={feedback.stars}
            xpGained={feedback.xpGained}
            source={feedback.source}
            onRetry={playMode === "challenge" ? startChallengePlay : handleRetryFromComplete}
            onNextLevel={playMode === "challenge" ? () => {} : handleNextFromComplete}
            canGoNextLevel={playMode === "challenge" ? false : canGoNextLevel}
            nextLevelLabel={playMode === "challenge" ? "" : nextLevelLabel}
            onRewardedRetry={playMode === "challenge" ? () => {} : handleRewardedRetry}
            showRewardedRetry={playMode === "challenge" ? false : rewardedAdsEnabled}
            canUseRewardedRetry={playMode === "challenge" ? false : canShowRewardedRetry}
            cosmeticVisual={cosmeticVisual}
            rewardedRetryLabel={
              playMode === "challenge"
                ? ""
                : hasPremiumNoAds
                  ? t("premiumActiveNoAds")
                  : canShowRewardedRetry
                    ? `${t("watchAdExtraRetry")} (${rewardedAdsRemaining} ${t("left")})`
                    : rewardedAdOnCooldown
                      ? t("adCooldownActive")
                      : t("rewardedRetryUnavailable")
            }
          />
        ) : null}

        <Pressable onPress={() => {
          if (playMode === "challenge") {
            setPlayMode("level");
            setScreen("main");
            setHomePanel("challenge");
          } else {
            setScreen("home");
          }
        }} style={({ pressed }) => [styles.completeHomeButton, pressed && styles.buttonPressedSoft]}>
          <Text style={styles.completeHomeLabel}>{playMode === "challenge" ? t("backToRankings") : t("backToHome")}</Text>
        </Pressable>
      </ScrollView>
    </Animated.View>
  );
}
