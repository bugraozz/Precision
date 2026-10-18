import React from "react";
import { Animated, LayoutChangeEvent, Pressable } from "react-native";
import Svg, { Path } from "react-native-svg";
import { Text, View } from "tamagui";
import { StatusPill } from "../components/ui";
import DrawingCanvas from "../components/DrawingCanvas";
import { PRECISION_COLORS, PRECISION_RADIUS } from "../theme/precisionTokens";
import {
  STABILITY_WOBBLE_WARN,
  SYMMETRY_WARN_ACCURACY
} from "../constants/gameplay";
import { targetShapePath } from "../utils/shapePreview";
import type { CosmeticVisual } from "../cosmetics";
import type { Point } from "../../../src/core/types";
import type { ProgressionState } from "../progression";
import type { LevelConfig } from "../levels";
import { getTotalBestStars } from "../progression";
import { t, tShape } from "../i18n";
import type { Lang } from "../i18n";

/* Compact preview size — smaller than before to save space */
const COMPACT_PREVIEW = 120;

export type PlayScreenProps = {
  playAnim: Animated.Value;
  playCtaPulseAnim: Animated.Value;
  playMode: "level" | "challenge";
  selectedLevel: LevelConfig;
  activeMechanic: string;
  speedParTimeMs: number;
  playClockMs: number;
  memoryTargetVisible: boolean;
  memoryPeeksLeft: number;
  onCanvasLayout?: (minDim: number) => void;
  challengeShape: string;
  challengeLoading: boolean;
  canScore: boolean;
  canvasResetKey: number;
  statusText: string;
  progression: ProgressionState;
  targetPreviewPath: string;
  cosmeticVisual: CosmeticVisual;
  setScreen: (screen: "main" | "home" | "play" | "complete") => void;
  resetRound: () => void;
  handleStrokeCommitted: (points: Point[], strokeStartedAtMs: number, strokeEndedAtMs: number) => void;
  handleLocalScore: () => void;
  handleChallengeServerSubmit: () => void;
  lang: Lang;
};

/** Returns a single-line mechanic status string */
function mechanicStatusLine(
  mechanic: string,
  playClockMs: number,
  speedParTimeMs: number,
  memoryTargetVisible: boolean
): string | null {
  switch (mechanic) {
    case "speed": {
      if (playClockMs <= speedParTimeMs) {
        return `▪ ${(Math.max(0, speedParTimeMs - playClockMs) / 1000).toFixed(1)}s`;
      }
      return `▪ +${((playClockMs - speedParTimeMs) / 1000).toFixed(1)}s`;
    }
    case "stability":
      return `▪ ${t("stabilityCheck")} ${STABILITY_WOBBLE_WARN.toFixed(2)}`;
    case "symmetry":
      return `▪ ${t("symmetryCheck")} ${SYMMETRY_WARN_ACCURACY}%+`;
    case "memory":
      return memoryTargetVisible
        ? `▪ ${t("targetVisibleBriefly")}`
        : `▪ ${t("targetHiddenDrawFromMemory")}`;
    default:
      return null;
  }
}

const navButtonStyle = ({ pressed }: { pressed: boolean }) => ({
  paddingHorizontal: 13,
  paddingVertical: 8,
  borderRadius: PRECISION_RADIUS.lg,
  backgroundColor: pressed ? PRECISION_COLORS.surfaceStrong : PRECISION_COLORS.surface,
  borderWidth: 1,
  borderColor: PRECISION_COLORS.border,
  transform: [{ scale: pressed ? 0.96 : 1 }]
});

export default function PlayScreen(props: PlayScreenProps) {
  const {
    playAnim, playCtaPulseAnim,
    playMode, selectedLevel, activeMechanic, speedParTimeMs,
    playClockMs, memoryTargetVisible, memoryPeeksLeft, onCanvasLayout,
    challengeShape, challengeLoading, canScore,
    canvasResetKey, statusText, progression, targetPreviewPath, cosmeticVisual,
    setScreen, resetRound,
    handleStrokeCommitted, handleLocalScore, handleChallengeServerSubmit
  } = props;

  const mechanicLine = playMode === "level"
    ? mechanicStatusLine(activeMechanic, playClockMs, speedParTimeMs, memoryTargetVisible)
    : null;

  const isOvertime = activeMechanic === "speed" && playClockMs > speedParTimeMs;
  const isMemoryHidden = activeMechanic === "memory" && !memoryTargetVisible;
  const submitDisabled = !canScore || (playMode === "challenge" && challengeLoading);

  const handleCanvasLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width > 0 && height > 0 && onCanvasLayout) {
      onCanvasLayout(Math.min(width, height));
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
        {/* ── Top navigation ── */}
        <View flexDirection="row" ai="center" jc="space-between" mb={14}>
          <Pressable
            onPress={() => setScreen(playMode === "challenge" ? "main" : "home")}
            style={navButtonStyle}
          >
            <Text color={PRECISION_COLORS.textDim} fow="800" fos={12} ls={1} textTransform="uppercase">
              {playMode === "challenge" ? t("back") : t("home")}
            </Text>
          </Pressable>

          {playMode === "challenge" ? (
            <View bg={PRECISION_COLORS.primarySoft} px={12} py={6} br={PRECISION_RADIUS.md} bw={1} borderColor="rgba(225,29,72,0.24)">
              <Text color={PRECISION_COLORS.primaryStrong} fow="900" fos={10} ls={1.6} textTransform="uppercase">
                {t("challengeLabel")}
              </Text>
            </View>
          ) : (
            <View flexDirection="row" gap={8}>
              <View bg={PRECISION_COLORS.cyanTint} px={12} py={6} br={PRECISION_RADIUS.md} bw={1} borderColor="rgba(174,188,205,0.22)">
                <Text color={PRECISION_COLORS.cyan} fow="900" fos={10} ls={1.2} textTransform="uppercase">
                  {t("level")} {selectedLevel.index}
                </Text>
              </View>
              <View bg={PRECISION_COLORS.amberSoft} px={12} py={6} br={PRECISION_RADIUS.md} bw={1} borderColor="rgba(251,191,36,0.3)">
                <Text color={PRECISION_COLORS.amberStrong} fow="900" fos={10} ls={1.2}>
                  ★ {getTotalBestStars(progression)}
                </Text>
              </View>
            </View>
          )}

          <Pressable onPress={resetRound} style={navButtonStyle}>
            <Text color={PRECISION_COLORS.textMuted} fow="800" fos={12} ls={1} textTransform="uppercase">
              {t("reset")}
            </Text>
          </Pressable>
        </View>

        {/* ── Shape title + mechanic line ── */}
        <View flexDirection="row" ai="center" jc="space-between" mb={12} px={2}>
          <Text color={PRECISION_COLORS.textStrong} fow="900" fos={22} lh={26} ls={-0.5} flexShrink={1} numberOfLines={1}>
            {playMode === "challenge" ? tShape(challengeShape) : tShape(selectedLevel.targetShape)}
          </Text>
          {mechanicLine ? (
            <View bg={PRECISION_COLORS.surface} px={12} py={6} br={PRECISION_RADIUS.md} bw={1} borderColor={PRECISION_COLORS.borderFaint} ml={8} flexShrink={0}>
              <Text
                color={isOvertime || isMemoryHidden ? PRECISION_COLORS.danger : PRECISION_COLORS.primaryStrong}
                fow="800"
                fos={11.5}
                numberOfLines={1}
              >
                {mechanicLine}
              </Text>
            </View>
          ) : playMode === "challenge" ? (
            <View bg={PRECISION_COLORS.cyanTint} px={12} py={6} br={PRECISION_RADIUS.md} bw={1} borderColor="rgba(174,188,205,0.22)" ml={8} flexShrink={0}>
              <Text color={PRECISION_COLORS.cyan} fow="800" fos={11.5} textTransform="uppercase" ls={0.8}>
                {t("rankedChallenge")}
              </Text>
            </View>
          ) : null}
        </View>

        <View mb={12}>
          <StatusPill text={statusText} />
        </View>

        {/* ── Target preview ── */}
        <View
          ai="center" jc="center"
          h={COMPACT_PREVIEW + 16}
          bg={PRECISION_COLORS.surface}
          br={PRECISION_RADIUS.xxl}
          bw={1}
          borderColor={cosmeticVisual.frameColor}
          mb={12}
          shadowColor={PRECISION_COLORS.shadowDeep}
          shadowOpacity={0.25}
          shadowRadius={14}
          shadowOffset={{ width: 0, height: 6 }}
        >
          {playMode === "level" && activeMechanic === "memory" && !memoryTargetVisible ? (
            <View ai="center">
              <Text color={PRECISION_COLORS.textMuted} fow="900" fos={13} ls={2} textTransform="uppercase">
                {t("memoryModeHidden")}
              </Text>
              {memoryPeeksLeft > 0 ? (
                <Text color={PRECISION_COLORS.goldStrong} fow="800" fos={10} ls={1} mt={6}>
                  {`${t("memoryPeeksLeftLabel")}: ${memoryPeeksLeft}`}
                </Text>
              ) : null}
            </View>
          ) : (
            <Svg width={COMPACT_PREVIEW} height={COMPACT_PREVIEW}>
              {playMode === "level" && activeMechanic === "symmetry" ? (
                <Path
                  d={`M ${(COMPACT_PREVIEW / 2).toFixed(2)} 12 L ${(COMPACT_PREVIEW / 2).toFixed(2)} ${(COMPACT_PREVIEW - 12).toFixed(2)}`}
                  fill="none"
                  stroke={PRECISION_COLORS.borderGuide}
                  strokeWidth={1.5}
                  strokeLinecap="round"
                  strokeDasharray="4 6"
                />
              ) : null}
              <Path
                d={playMode === "challenge" ? targetShapePath(challengeShape, COMPACT_PREVIEW) : targetPreviewPath}
                fill="none"
                stroke={cosmeticVisual.accentColor}
                strokeWidth={Math.max(3.5, cosmeticVisual.strokeWidth)}
                strokeLinecap="round"
              />
            </Svg>
          )}
        </View>

        {/* ── Canvas ── */}
        <View
          onLayout={handleCanvasLayout}
          flex={1}
          bg="rgba(4,6,10,0.9)"
          br={PRECISION_RADIUS.card}
          bw={1}
          borderColor={PRECISION_COLORS.border}
          overflow="hidden"
          mb={12}
          shadowColor={PRECISION_COLORS.shadowBlack}
          shadowOpacity={0.4}
          shadowRadius={18}
          shadowOffset={{ width: 0, height: 8 }}
        >
          <DrawingCanvas
            onStrokeCommitted={handleStrokeCommitted}
            resetKey={canvasResetKey}
            cosmeticVisual={cosmeticVisual}
            isStabilityMode={playMode === "level" && activeMechanic === "stability"}
          />
        </View>

        {/* ── Actions ── */}
        <View flexDirection="row" gap={12}>
          <View flex={1}>
            <Animated.View
              style={{
                transform: [{ scale: playCtaPulseAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.02] }) }],
                opacity: playCtaPulseAnim.interpolate({ inputRange: [0, 1], outputRange: [0.94, 1] })
              }}
            >
              <View
                br={PRECISION_RADIUS.xl}
                overflow="hidden"
                bg={submitDisabled ? PRECISION_COLORS.surface : "transparent"}
                borderColor={submitDisabled ? PRECISION_COLORS.border : "transparent"}
                bw={submitDisabled ? 1 : 0}
              >
                <Pressable
                  onPress={playMode === "challenge" ? handleChallengeServerSubmit : handleLocalScore}
                  disabled={submitDisabled}
                  style={({ pressed }) => ({
                    paddingVertical: 16,
                    borderRadius: PRECISION_RADIUS.xl,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: submitDisabled ? "transparent" : PRECISION_COLORS.primary,
                    shadowColor: submitDisabled ? "transparent" : PRECISION_COLORS.primary,
                    shadowOpacity: 0.35,
                    shadowRadius: 16,
                    shadowOffset: { width: 0, height: 6 },
                    transform: [{ scale: pressed && !submitDisabled ? 0.97 : 1 }]
                  })}
                >
                  <Text
                    color={submitDisabled ? PRECISION_COLORS.textSubtle : PRECISION_COLORS.primaryInk}
                    fow="900"
                    fos={15}
                    ls={0.6}
                  >
                    {playMode === "challenge"
                      ? (challengeLoading ? t("submitting") : t("submitToRanking"))
                      : t("score")}
                  </Text>
                </Pressable>
              </View>
            </Animated.View>
          </View>

          <Pressable
            onPress={resetRound}
            style={({ pressed }) => ({
              paddingVertical: 16,
              paddingHorizontal: 20,
              borderRadius: PRECISION_RADIUS.xl,
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 1,
              borderColor: PRECISION_COLORS.border,
              backgroundColor: pressed ? PRECISION_COLORS.surfaceStrong : PRECISION_COLORS.surface,
              transform: [{ scale: pressed ? 0.98 : 1 }]
            })}
          >
            <Text color={PRECISION_COLORS.textDim} fow="800" fos={12} textTransform="uppercase" ls={0.8}>
              {t("tryNewStroke")}
            </Text>
          </Pressable>
        </View>
      </View>
    </Animated.View>
  );
}
