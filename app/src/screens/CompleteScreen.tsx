import React, { useRef, useState } from "react";
import { Animated, Platform, Pressable, View as RNView } from "react-native";
import { captureRef } from "react-native-view-shot";
import * as Sharing from "expo-sharing";
import { Text, View } from "tamagui";
import RoundComparisonCard from "../components/RoundComparisonCard";
import { PRECISION_COLORS, PRECISION_RADIUS } from "../theme/precisionTokens";
import type { CosmeticVisual } from "../cosmetics";
import type { RoundFeedback } from "../types/app";
import type { Point, RoundInput } from "../../../src/core/types";
import { t } from "../i18n";
import type { Lang } from "../i18n";

export type CompleteScreenProps = {
  playAnim: Animated.Value;
  playMode: "level" | "challenge";
  feedback: RoundFeedback | null;
  round: RoundInput;
  drawnPoints: Point[];
  challengeShape: string;
  ghostPoints: Point[];
  flawless: boolean;
  canGoNextLevel: boolean;
  nextLevelLabel: string;
  hasPremiumNoAds: boolean;
  canShowRewardedRetry: boolean;
  rewardedAdsEnabled: boolean;
  rewardedAdOnCooldown: boolean;
  rewardedAdsRemaining: number;
  cosmeticVisual: CosmeticVisual;
  setScreen: (screen: "main" | "home" | "play" | "complete") => void;
  setPlayMode: (mode: "level" | "challenge") => void;
  handleRetryFromComplete: () => void;
  handleNextFromComplete: () => void;
  handleRewardedRetry: () => void;
  startChallengePlay: () => void;
  lang: Lang;
};

export default function CompleteScreen(props: CompleteScreenProps) {
  const {
    playAnim, playMode, feedback, round, drawnPoints,
    challengeShape, ghostPoints, flawless, canGoNextLevel, nextLevelLabel,
    hasPremiumNoAds, canShowRewardedRetry, rewardedAdsEnabled,
    rewardedAdOnCooldown, rewardedAdsRemaining, cosmeticVisual,
    setScreen,
    handleRetryFromComplete, handleNextFromComplete,
    handleRewardedRetry, startChallengePlay
  } = props;

  const cardRef = useRef<RNView>(null);
  const [sharing, setSharing] = useState(false);

  const handleShare = async () => {
    if (!feedback || sharing || !cardRef.current) {
      return;
    }
    setSharing(true);
    try {
      const uri = await captureRef(cardRef, {
        format: "png",
        quality: 1,
        result: Platform.OS === "web" ? "data-uri" : "tmpfile"
      });
      if (uri && (await Sharing.isAvailableAsync())) {
        await Sharing.shareAsync(uri, {
          mimeType: "image/png",
          dialogTitle: t("shareCard"),
          UTI: "public.png"
        });
      }
    } catch {
      // Sharing unavailable on this device — silently skip.
    } finally {
      setSharing(false);
    }
  };

  return (
    <Animated.View
      style={{
        flex: 1,
        opacity: playAnim,
        transform: [
          { translateY: playAnim.interpolate({ inputRange: [0, 1], outputRange: [22, 0] }) }
        ]
      }}
    >
      <View flex={1} padding={16} paddingTop={50} paddingBottom={16}>
        {/* ── Results card (captured for sharing) ── */}
        {feedback ? (
          <View flex={1} ref={cardRef} collapsable={false}>
            <RoundComparisonCard
              targetShape={playMode === "challenge" ? challengeShape : round.targetShape}
              userPoints={playMode === "challenge" ? drawnPoints : round.points}
              accuracyPercent={feedback.accuracyPercent}
              meanDeviation={feedback.meanDeviation}
              stars={feedback.stars}
              xpGained={feedback.xpGained}
              source={feedback.source}
              flawless={flawless}
              ghostPoints={ghostPoints}
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
          </View>
        ) : null}

        {/* ── Share ── */}
        <Pressable
          onPress={handleShare}
          disabled={sharing || !feedback}
          style={({ pressed }) => ({
            marginTop: 16,
            marginBottom: 8,
            paddingVertical: 15,
            borderRadius: PRECISION_RADIUS.xl,
            borderWidth: 1,
            borderColor: PRECISION_COLORS.borderGoldSoft,
            backgroundColor: PRECISION_COLORS.goldSoft,
            opacity: sharing ? 0.6 : 1,
            alignItems: "center",
            transform: [{ scale: pressed ? 0.97 : 1 }]
          })}
        >
          <Text color={PRECISION_COLORS.goldStrong} fow="900" fos={13} ls={1.2} textTransform="uppercase">
            {t("shareCard")}
          </Text>
        </Pressable>

        {/* ── Exit ── */}
        <Pressable
          onPress={() => {
            if (playMode === "challenge") {
              setScreen("main");
            } else {
              setScreen("home");
            }
          }}
          style={({ pressed }) => ({
            marginBottom: 16,
            paddingVertical: 16,
            borderRadius: PRECISION_RADIUS.xl,
            borderWidth: 1,
            borderColor: PRECISION_COLORS.border,
            backgroundColor: pressed ? PRECISION_COLORS.surfaceStrong : PRECISION_COLORS.surface,
            alignItems: "center",
            transform: [{ scale: pressed ? 0.97 : 1 }]
          })}
        >
          <Text color={PRECISION_COLORS.textDim} fow="800" fos={13} ls={0.8} textTransform="uppercase">
            {playMode === "challenge" ? t("backToRankings") : t("backToHome")}
          </Text>
        </Pressable>
      </View>
    </Animated.View>
  );
}
