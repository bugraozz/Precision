import React from "react";
import { Animated } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path } from "react-native-svg";
import { ScrollView, Text, View } from "tamagui";
import Pressable from "../components/TamaguiPressable";
import DrawingCanvas from "../components/DrawingCanvas";
import { PRECISION_COLORS, PRECISION_GRADIENTS } from "../theme/precisionTokens";
import { styles } from "../styles";
import {
  TARGET_PREVIEW_SIZE,
  STABILITY_WOBBLE_WARN,
  STABILITY_WOBBLE_HEAVY,
  SYMMETRY_WARN_ACCURACY,
  SYMMETRY_HEAVY_ACCURACY
} from "../constants/gameplay";
import { targetShapePath } from "../utils/shapePreview";
import type { CosmeticVisual } from "../cosmetics";
import type { HomePanelKey } from "../types/app";
import type { Point } from "../../../src/core/types";
import type { ProgressionState } from "../progression";
import type { LevelConfig } from "../levels";
import { getTotalBestStars } from "../progression";
import { t, tShape, tDifficulty, tMode, tFocusHint, tMechanic } from "../i18n";
import type { Lang } from "../i18n";

export type PlayScreenProps = {
  playAnim: Animated.Value;
  playCtaPulseAnim: Animated.Value;
  playMode: "level" | "challenge";
  selectedLevel: LevelConfig;
  activeMechanic: string;
  speedParTimeMs: number;
  playClockMs: number;
  memoryTargetVisible: boolean;
  challengeShape: string;
  challengeLoading: boolean;
  canScore: boolean;
  canvasResetKey: number;
  statusText: string;
  progression: ProgressionState;
  targetPreviewPath: string;
  cosmeticVisual: CosmeticVisual;
  // Handlers
  setScreen: (screen: "main" | "home" | "play" | "complete") => void;
  setHomePanel: (panel: HomePanelKey) => void;
  resetRound: () => void;
  handleStrokeCommitted: (points: Point[], strokeStartedAtMs: number, strokeEndedAtMs: number) => void;
  handleLocalScore: () => void;
  handleChallengeServerSubmit: () => void;
  lang: Lang;
};

export default function PlayScreen(props: PlayScreenProps) {
  const {
    playAnim, playCtaPulseAnim,
    playMode, selectedLevel, activeMechanic, speedParTimeMs,
    playClockMs, memoryTargetVisible,
    challengeShape, challengeLoading, canScore,
    canvasResetKey, statusText, progression, targetPreviewPath, cosmeticVisual,
    setScreen, setHomePanel, resetRound,
    handleStrokeCommitted, handleLocalScore, handleChallengeServerSubmit,
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
      <ScrollView contentContainerStyle={styles.playContent}>
        <View style={styles.playTopRow}>
          <Pressable onPress={() => playMode === "challenge" ? (setScreen("main"), setHomePanel("challenge")) : setScreen("home")} style={({ pressed }) => [styles.iconButton, pressed && styles.buttonPressedSoft]}>
            <Text style={styles.iconButtonLabel}>{playMode === "challenge" ? t("back") : t("home")}</Text>
          </Pressable>

          <View style={styles.topCenterRow}>
            {playMode === "challenge" ? (
              <LinearGradient colors={PRECISION_GRADIENTS.primary} style={styles.starBadge}>
                <Text style={styles.starBadgeLabel}>{"\u2694\uFE0F"} {t("challengeLabel")}</Text>
              </LinearGradient>
            ) : (
              <>
                <View style={styles.levelBadge}>
                  <Text style={styles.levelBadgeLabel}>{t("level")} {selectedLevel.index}</Text>
                </View>
                <LinearGradient colors={PRECISION_GRADIENTS.primary} style={styles.starBadge}>
                  <Text style={styles.starBadgeLabel}>{t("star")} {getTotalBestStars(progression)}</Text>
                </LinearGradient>
              </>
            )}
          </View>

          <Pressable onPress={resetRound} style={({ pressed }) => [styles.iconButton, pressed && styles.buttonPressedSoft]}>
            <Text style={styles.iconButtonLabel}>{t("reset")}</Text>
          </Pressable>
        </View>

        <View style={styles.targetBadge}>
          <Text style={styles.targetBadgeLabel}>{playMode === "challenge" ? t("rankedChallenge") : t("targetShape")}</Text>
        </View>
        {playMode === "level" ? (
          <View style={styles.mechanicBanner}>
            <Text style={styles.mechanicBannerTitle}>{tMechanic(activeMechanic).toUpperCase()} {t("pressure")}</Text>
            <Text style={styles.mechanicBannerText}>
              {activeMechanic === "speed"
                ? `${t("parRemaining")} ${speedParTimeMs}ms. ${t("speedPressureDesc")}`
                : activeMechanic === "stability"
                  ? `${tMechanic("stability")} > ${STABILITY_WOBBLE_WARN.toFixed(2)} ${t("stabilityPressureWarn")}, > ${STABILITY_WOBBLE_HEAVY.toFixed(2)} ${t("stabilityPressurePenalize")}.`
                  : activeMechanic === "symmetry"
                    ? `${t("accuracy")} < ${SYMMETRY_WARN_ACCURACY}% ${t("symmetryPressureWarn")}, < ${SYMMETRY_HEAVY_ACCURACY}% ${t("symmetryPressurePenalize")}.`
                    : t("memoryPressureDesc")}
            </Text>
            <Text style={styles.mechanicBannerText}>{t("focus")}: {tFocusHint(selectedLevel.mechanicTag)}</Text>
          </View>
        ) : (
          <View style={styles.mechanicBanner}>
            <Text style={styles.mechanicBannerTitle}>{t("rankedChallenge")}</Text>
            <Text style={styles.mechanicBannerText}>{t("challengeDrawDesc").replace("{shape}", tShape(challengeShape))}</Text>
          </View>
        )}
        <Text style={styles.playTitle}>{playMode === "challenge" ? tShape(challengeShape) : tShape(selectedLevel.targetShape)}</Text>
        <Text style={styles.playSubTitle}>{t("drawWithPrecision")}</Text>
        <Text style={styles.playSubTitle}>
          {t("cosmeticLoadout")}: {t("brushAbbr")} {progression.premium.selectedBrushId || t("none")} | {t("trailAbbr")} {progression.premium.selectedTrailId || t("none")} | {t("frameAbbr")} {progression.premium.selectedFrameId || t("none")}
        </Text>

        {playMode === "level" ? (
        <View style={styles.mechanicLiveCard}>
          {activeMechanic === "speed" ? (
            <>
              <Text style={styles.mechanicLiveTitle}>{t("speedTimer")}</Text>
              <Text
                style={[
                  styles.mechanicLiveValue,
                  playClockMs > speedParTimeMs && styles.mechanicLiveDanger
                ]}
              >
                {playClockMs <= speedParTimeMs
                  ? `${t("parRemaining")} ${(Math.max(0, speedParTimeMs - playClockMs) / 1000).toFixed(1)}s`
                  : `${t("overtime")} +${((playClockMs - speedParTimeMs) / 1000).toFixed(1)}s`}
              </Text>
            </>
          ) : null}
          {activeMechanic === "stability" ? (
            <>
              <Text style={styles.mechanicLiveTitle}>{t("stabilityCheck")}</Text>
              <Text style={styles.mechanicLiveValue}>{t("targetWobbleThreshold")}: {STABILITY_WOBBLE_WARN.toFixed(2)} / {STABILITY_WOBBLE_HEAVY.toFixed(2)}</Text>
            </>
          ) : null}
          {activeMechanic === "symmetry" ? (
            <>
              <Text style={styles.mechanicLiveTitle}>{t("symmetryCheck")}</Text>
              <Text style={styles.mechanicLiveValue}>{t("safeAccuracyBand")}: {SYMMETRY_WARN_ACCURACY}%+</Text>
            </>
          ) : null}
          {activeMechanic === "memory" ? (
            <>
              <Text style={styles.mechanicLiveTitle}>{t("memoryCheck")}</Text>
              <Text style={styles.mechanicLiveValue}>{memoryTargetVisible ? t("targetVisibleBriefly") : t("targetHiddenDrawFromMemory")}</Text>
            </>
          ) : null}
        </View>
        ) : null}

        <View style={[styles.targetCard, { borderColor: cosmeticVisual.frameColor }]}>
          {playMode === "level" && activeMechanic === "memory" && !memoryTargetVisible ? (
            <Text style={styles.memoryHiddenText}>{t("memoryModeHidden")}</Text>
          ) : (
            <Svg width={TARGET_PREVIEW_SIZE} height={TARGET_PREVIEW_SIZE}>
              {playMode === "level" && activeMechanic === "symmetry" ? (
                <Path
                  d={`M ${(TARGET_PREVIEW_SIZE / 2).toFixed(2)} 18 L ${(TARGET_PREVIEW_SIZE / 2).toFixed(2)} ${(TARGET_PREVIEW_SIZE - 18).toFixed(2)}`}
                  fill="none"
                  stroke={PRECISION_COLORS.borderGuide}
                  strokeWidth={1.5}
                  strokeLinecap="round"
                />
              ) : null}
              <Path
                d={playMode === "challenge" ? targetShapePath(challengeShape) : targetPreviewPath}
                fill="none"
                stroke={cosmeticVisual.accentColor}
                strokeWidth={Math.max(4.5, cosmeticVisual.strokeWidth)}
                strokeLinecap="round"
              />
            </Svg>
          )}
        </View>

        <View style={styles.canvasGlowWrap}>
          <View style={styles.canvasGlow} />
          <DrawingCanvas
            onStrokeCommitted={handleStrokeCommitted}
            resetKey={canvasResetKey}
            cosmeticVisual={cosmeticVisual}
          />
        </View>

        <View style={styles.playActionsRow}>
          <Animated.View
            style={[
              styles.playPrimaryPulseWrap,
              {
                transform: [
                  {
                    scale: playCtaPulseAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 1.018]
                    })
                  }
                ],
                opacity: playCtaPulseAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.94, 1]
                })
              }
            ]}
          >
            <Pressable
              onPress={playMode === "challenge" ? handleChallengeServerSubmit : handleLocalScore}
              disabled={!canScore || (playMode === "challenge" && challengeLoading)}
              style={({ pressed }) => [
                styles.primaryButton,
                (!canScore || (playMode === "challenge" && challengeLoading)) && styles.disabledButton,
                pressed && canScore && styles.playButtonPressed
              ]}
            >
              <Text style={styles.buttonLabel}>{playMode === "challenge" ? (challengeLoading ? t("submitting") : t("submitToRanking")) : t("score")}</Text>
            </Pressable>
          </Animated.View>
        </View>

        <Pressable onPress={resetRound} style={({ pressed }) => [styles.ghostButton, pressed && styles.playButtonPressed]}>
          <Text style={styles.ghostLabel}>{t("tryNewStroke")}</Text>
        </Pressable>

        <Text style={styles.status}>{statusText}</Text>
      </ScrollView>
    </Animated.View>
  );
}
