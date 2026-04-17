import React, { useEffect, useMemo, useRef } from "react";
import { Animated, StyleSheet } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";
import { Text, View } from "tamagui";
import { normalizeToUnitBox } from "../../../src/core/geometry";
import { Point } from "../../../src/core/types";
import { CosmeticVisual } from "../cosmetics";
import Pressable from "./TamaguiPressable";
import { t, tShape } from "../i18n";
import {
  PRECISION_COLORS,
  PRECISION_RADIUS,
  PRECISION_SHADOW,
  PRECISION_SPACE,
  PRECISION_TYPE
} from "../theme/precisionTokens";

type RoundComparisonCardProps = {
  targetShape: string;
  userPoints: Point[];
  accuracyPercent: number;
  meanDeviation: number;
  stars: number;
  xpGained: number;
  source: "local" | "server";
  onRetry: () => void;
  onNextLevel: () => void;
  canGoNextLevel: boolean;
  nextLevelLabel: string;
  onRewardedRetry?: () => void;
  showRewardedRetry?: boolean;
  rewardedRetryLabel?: string;
  canUseRewardedRetry?: boolean;
  cosmeticVisual?: CosmeticVisual;
};

const PREVIEW_SIZE = 240;
const PREVIEW_PADDING = 18;
const RING_RADIUS = 56;
const RING_CIRC = 2 * Math.PI * RING_RADIUS;

function toPath(points: Point[]): string {
  if (points.length === 0) {
    return "";
  }

  const normalized = normalizeToUnitBox(points);
  const drawSize = PREVIEW_SIZE - PREVIEW_PADDING * 2;

  const mapped = normalized.map((point) => ({
    x: PREVIEW_PADDING + point.x * drawSize,
    y: PREVIEW_PADDING + point.y * drawSize
  }));

  const [first, ...rest] = mapped;
  const commands = rest.map((point) => `L ${point.x.toFixed(2)} ${point.y.toFixed(2)}`).join(" ");
  return `M ${first.x.toFixed(2)} ${first.y.toFixed(2)} ${commands}`;
}

export default function RoundComparisonCard({
  targetShape,
  userPoints,
  accuracyPercent,
  meanDeviation,
  stars,
  xpGained,
  source,
  onRetry,
  onNextLevel,
  canGoNextLevel,
  nextLevelLabel,
  onRewardedRetry,
  showRewardedRetry = false,
  rewardedRetryLabel = t("watchAdExtraRetry"),
  canUseRewardedRetry = true,
  cosmeticVisual
}: RoundComparisonCardProps) {
  const userPath = useMemo(() => toPath(userPoints), [userPoints]);
  const resolvedVisual =
    cosmeticVisual || {
      strokeColor: PRECISION_COLORS.accentSoft,
      strokeWidth: 4,
      frameColor: PRECISION_COLORS.cyanSoft,
      accentColor: PRECISION_COLORS.accentSoft
    };
  const metricAnimValues = useRef([new Animated.Value(0), new Animated.Value(0), new Animated.Value(0)]).current;
  const clampedAccuracy = Math.max(0, Math.min(100, accuracyPercent));
  const ringProgress = (RING_CIRC * clampedAccuracy) / 100;
  const starsText = "★".repeat(stars) + "☆".repeat(3 - stars);

  useEffect(() => {
    metricAnimValues.forEach((value) => value.setValue(0));
    Animated.stagger(
      80,
      metricAnimValues.map((value) =>
        Animated.timing(value, {
          toValue: 1,
          duration: 260,
          useNativeDriver: true
        })
      )
    ).start();
  }, [metricAnimValues, stars, xpGained, meanDeviation, accuracyPercent]);

  return (
    <View style={[styles.card, { borderColor: resolvedVisual.frameColor }]}>
      <View pointerEvents="none" style={styles.cardShine} />
      <Text style={styles.title}>{t("excellent")}</Text>
      <Text style={styles.subtitle}>{t("target")} {tShape(targetShape).toUpperCase()} | {source === "local" ? t("local") : t("server")}</Text>

      <View style={styles.ringWrap}>
        <Svg width={140} height={140}>
          <Circle cx="70" cy="70" r={RING_RADIUS} fill="none" stroke={PRECISION_COLORS.borderCard} strokeWidth="6" />
          <Circle
            cx="70"
            cy="70"
            r={RING_RADIUS}
            fill="none"
            stroke={resolvedVisual.accentColor}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={`${ringProgress} ${RING_CIRC}`}
            transform="rotate(-90 70 70)"
          />
        </Svg>
        <View style={styles.ringCenter}>
          <Text style={styles.accuracyValue}>{clampedAccuracy.toFixed(0)}%</Text>
          <Text style={styles.accuracyLabel}>{t("accuracy")}</Text>
        </View>
      </View>

      <Text style={[styles.starsLine, { color: resolvedVisual.accentColor }]}>{starsText}</Text>

      <View style={[styles.previewWrap, { borderColor: resolvedVisual.frameColor }]}>
        <Svg width={PREVIEW_SIZE} height={PREVIEW_SIZE}>
          {resolvedVisual.trailColor ? (
            <Path d={userPath} fill="none" stroke={resolvedVisual.trailColor} strokeWidth={resolvedVisual.trailWidth || 8} />
          ) : null}
          <Path d={userPath} fill="none" stroke={resolvedVisual.strokeColor} strokeWidth={Math.max(3.5, resolvedVisual.strokeWidth)} />
        </Svg>
      </View>

      <View style={styles.metricsRow}>
        <Animated.View
          style={[
            styles.metricMini,
            {
              opacity: metricAnimValues[0],
              transform: [
                {
                  translateY: metricAnimValues[0].interpolate({
                    inputRange: [0, 1],
                    outputRange: [10, 0]
                  })
                }
              ]
            }
          ]}
        >
          <Text style={styles.metricValue}>+{stars}</Text>
          <Text style={styles.metricLabel}>{t("stars")}</Text>
        </Animated.View>
        <Animated.View
          style={[
            styles.metricMini,
            {
              opacity: metricAnimValues[1],
              transform: [
                {
                  translateY: metricAnimValues[1].interpolate({
                    inputRange: [0, 1],
                    outputRange: [10, 0]
                  })
                }
              ]
            }
          ]}
        >
          <Text style={styles.metricValue}>+{xpGained}</Text>
          <Text style={styles.metricLabel}>{t("points")}</Text>
        </Animated.View>
        <Animated.View
          style={[
            styles.metricMini,
            {
              opacity: metricAnimValues[2],
              transform: [
                {
                  translateY: metricAnimValues[2].interpolate({
                    inputRange: [0, 1],
                    outputRange: [10, 0]
                  })
                }
              ]
            }
          ]}
        >
          <Text style={styles.metricValue}>{meanDeviation.toFixed(3)}</Text>
          <Text style={styles.metricLabel}>{t("deviation")}</Text>
        </Animated.View>
      </View>

      <View style={styles.actionRow}>
        <Pressable
          onPress={onNextLevel}
          disabled={!canGoNextLevel}
          style={({ pressed }) => [
            styles.primaryButton,
            !canGoNextLevel && styles.nextButtonDisabled,
            pressed && canGoNextLevel && styles.buttonPressedPrimary
          ]}
        >
          <Text style={styles.primaryLabel}>{nextLevelLabel}</Text>
        </Pressable>

        <Pressable onPress={onRetry} style={({ pressed }) => [styles.secondaryButton, pressed && styles.buttonPressedSecondary]}>
          <Text style={styles.secondaryLabel}>{t("tryAgain")}</Text>
        </Pressable>
      </View>

      {showRewardedRetry ? (
        <Pressable
          onPress={onRewardedRetry}
          disabled={!canUseRewardedRetry}
          style={({ pressed }) => [
            styles.rewardedButton,
            !canUseRewardedRetry && styles.rewardedButtonDisabled,
            pressed && canUseRewardedRetry && styles.buttonPressedPrimary
          ]}
        >
          <Text style={styles.rewardedLabel}>{rewardedRetryLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: PRECISION_SPACE.xxl,
    backgroundColor: PRECISION_COLORS.bgMission,
    borderColor: PRECISION_COLORS.border,
    borderWidth: 1,
    borderRadius: 30,
    padding: PRECISION_SPACE.screen,
    overflow: "hidden",
    alignItems: "center",
    shadowColor: PRECISION_COLORS.shadowBlack,
    ...PRECISION_SHADOW.xl
  },
  cardShine: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: PRECISION_SPACE.overlay,
    backgroundColor: PRECISION_COLORS.cyanAura
  },
  title: {
    fontSize: PRECISION_TYPE.displayLg,
    fontWeight: "900",
    color: PRECISION_COLORS.textStrong,
    letterSpacing: -0.5
  },
  subtitle: {
    marginTop: PRECISION_SPACE.sm,
    marginBottom: PRECISION_SPACE.xxl,
    color: PRECISION_COLORS.textMuted,
    fontSize: PRECISION_TYPE.sub,
    letterSpacing: 0.8,
    textTransform: "uppercase"
  },
  ringWrap: {
    width: 140,
    height: 140,
    justifyContent: "center",
    alignItems: "center"
  },
  ringCenter: {
    position: "absolute",
    alignItems: "center"
  },
  accuracyValue: {
    color: PRECISION_COLORS.textStrong,
    fontSize: PRECISION_TYPE.hero,
    fontWeight: "900",
    letterSpacing: -0.5
  },
  accuracyLabel: {
    color: PRECISION_COLORS.textBodyMuted,
    fontSize: PRECISION_TYPE.label,
    letterSpacing: 0.5
  },
  starsLine: {
    color: PRECISION_COLORS.primaryStrong,
    marginTop: PRECISION_SPACE.xl,
    marginBottom: PRECISION_SPACE.lg,
    fontSize: PRECISION_TYPE.display,
    letterSpacing: 8
  },
  previewWrap: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: PRECISION_COLORS.bgPanelSoft,
    borderRadius: PRECISION_RADIUS.xxl,
    borderWidth: 1,
    borderColor: PRECISION_COLORS.borderGoldSoft,
    paddingVertical: PRECISION_SPACE.lg,
    marginBottom: PRECISION_SPACE.xl
  },
  metricsRow: {
    flexDirection: "row",
    gap: PRECISION_SPACE.lg,
    marginBottom: PRECISION_SPACE.xxl
  },
  metricMini: {
    alignItems: "center",
    borderWidth: 1,
    borderColor: PRECISION_COLORS.borderCard,
    backgroundColor: PRECISION_COLORS.bgGlass,
    borderRadius: PRECISION_RADIUS.xl,
    paddingVertical: PRECISION_SPACE.lg,
    paddingHorizontal: PRECISION_SPACE.xl,
    minWidth: 94
  },
  metricValue: {
    color: PRECISION_COLORS.textStrong,
    fontWeight: "900",
    fontSize: PRECISION_TYPE.metric,
    letterSpacing: -0.3
  },
  metricLabel: {
    color: PRECISION_COLORS.textBodyMuted,
    fontSize: PRECISION_TYPE.label,
    marginTop: 2,
    letterSpacing: 0.5
  },
  actionRow: {
    marginTop: PRECISION_SPACE.xl,
    width: "100%",
    gap: PRECISION_SPACE.lg
  },
  primaryButton: {
    borderRadius: PRECISION_RADIUS.xl,
    paddingVertical: PRECISION_SPACE.xxl,
    backgroundColor: PRECISION_COLORS.primary,
    shadowColor: PRECISION_COLORS.primary,
    ...PRECISION_SHADOW.md
  },
  primaryLabel: {
    textAlign: "center",
    color: PRECISION_COLORS.textStrong,
    fontWeight: "900",
    fontSize: 18,
    letterSpacing: 0.3
  },
  secondaryButton: {
    borderRadius: PRECISION_RADIUS.xl,
    paddingVertical: 15,
    borderWidth: 1,
    borderColor: PRECISION_COLORS.borderSoft,
    backgroundColor: PRECISION_COLORS.bgGlass
  },
  nextButtonDisabled: {
    opacity: 0.35
  },
  secondaryLabel: {
    textAlign: "center",
    color: PRECISION_COLORS.textDim,
    fontWeight: "800",
    fontSize: 16
  },
  rewardedButton: {
    marginTop: PRECISION_SPACE.lg,
    borderWidth: 1,
    borderColor: PRECISION_COLORS.borderGoldActive,
    backgroundColor: PRECISION_COLORS.primarySoft,
    borderRadius: 16,
    paddingVertical: 13,
    width: "100%"
  },
  rewardedButtonDisabled: {
    opacity: 0.4
  },
  buttonPressedPrimary: {
    transform: [{ scale: 0.97 }],
    opacity: 0.85
  },
  buttonPressedSecondary: {
    transform: [{ scale: 0.985 }],
    opacity: 0.9
  },
  rewardedLabel: {
    textAlign: "center",
    color: PRECISION_COLORS.textClaim,
    fontWeight: "800",
    letterSpacing: 0.2
  }
});
