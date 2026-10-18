import React, { useEffect, useRef } from "react";
import { Animated, Pressable } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";
import { LinearGradient } from "expo-linear-gradient";
import { Text, View } from "tamagui";
import { normalizeToUnitBox } from "../../../src/core/geometry";
import { Point } from "../../../src/core/types";
import { CosmeticVisual } from "../cosmetics";
import { t, tShape } from "../i18n";
import { PRECISION_COLORS, PRECISION_GRADIENTS, PRECISION_RADIUS } from "../theme/precisionTokens";
import { ShapeMark } from "./ui";

type RoundComparisonCardProps = {
  targetShape: string;
  userPoints: Point[];
  accuracyPercent: number;
  meanDeviation: number;
  stars: number;
  xpGained: number;
  source: "local" | "server";
  flawless?: boolean;
  ghostPoints?: Point[];
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

const RING_SIZE = 108;
const RING_RADIUS = 44;
const RING_CIRC = 2 * Math.PI * RING_RADIUS;

function toPathDynamic(points: Point[], size: number): string {
  if (points.length === 0) return "";
  const padding = Math.round(size * 0.08);
  const normalized = normalizeToUnitBox(points);
  const drawSize = size - padding * 2;
  const mapped = normalized.map((point) => ({
    x: padding + point.x * drawSize,
    y: padding + point.y * drawSize
  }));
  const [first, ...rest] = mapped;
  const commands = rest.map((point) => `L ${point.x.toFixed(2)} ${point.y.toFixed(2)}`).join(" ");
  return `M ${first.x.toFixed(2)} ${first.y.toFixed(2)} ${commands}`;
}

export default function RoundComparisonCard({
  targetShape, userPoints, accuracyPercent, meanDeviation, stars, xpGained, source,
  flawless = false, ghostPoints,
  onRetry, onNextLevel, canGoNextLevel, nextLevelLabel,
  onRewardedRetry, showRewardedRetry = false, rewardedRetryLabel = t("watchAdExtraRetry"), canUseRewardedRetry = true, cosmeticVisual
}: RoundComparisonCardProps) {
  const resolvedVisual = cosmeticVisual || {
    strokeColor: PRECISION_COLORS.accentSoft,
    strokeWidth: 4,
    frameColor: PRECISION_COLORS.cyanSoft,
    accentColor: PRECISION_COLORS.accentSoft
  };
  const metricAnimValues = useRef([new Animated.Value(0), new Animated.Value(0), new Animated.Value(0)]).current;
  const clampedAccuracy = Math.max(0, Math.min(100, accuracyPercent));
  const ringProgress = (RING_CIRC * clampedAccuracy) / 100;
  const ringColor = flawless ? PRECISION_COLORS.goldStrong : resolvedVisual.accentColor;

  /* FLAWLESS: ring pulse + shimmer label */
  const flawlessAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    flawlessAnim.setValue(0);
    if (flawless) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(flawlessAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
          Animated.timing(flawlessAnim, { toValue: 0.35, duration: 700, useNativeDriver: true })
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flawless]);

  useEffect(() => {
    metricAnimValues.forEach((value) => value.setValue(0));
    Animated.stagger(80, metricAnimValues.map((value) =>
      Animated.timing(value, { toValue: 1, duration: 260, useNativeDriver: true })
    )).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stars, xpGained, meanDeviation, accuracyPercent]);

  const hasGhost = Boolean(ghostPoints && ghostPoints.length >= 2);

  const [drawAreaSize, setDrawAreaSize] = React.useState(140);

  return (
    <View
      flex={1}
      br={PRECISION_RADIUS.card}
      bw={1.5}
      borderColor={resolvedVisual.frameColor}
      bg={PRECISION_COLORS.bgPanelStrong}
      overflow="hidden"
      shadowColor={PRECISION_COLORS.shadowBlack}
      shadowOpacity={0.45}
      shadowRadius={24}
      shadowOffset={{ width: 0, height: 10 }}
    >
      <LinearGradient
        colors={PRECISION_GRADIENTS.cardGloss}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        pointerEvents="none"
        style={{ position: "absolute", top: 0, left: 0, right: 0, height: 110 }}
      />

      {/* ── Accuracy ring + verdict ── */}
      <View pt={16} ai="center">
        <View flexDirection="row" ai="center" gap={16} px={16}>
          <Animated.View style={flawless ? { shadowColor: PRECISION_COLORS.goldStrong, shadowOpacity: flawlessAnim.interpolate({ inputRange: [0, 1], outputRange: [0.2, 0.85] }), shadowRadius: 18, shadowOffset: { width: 0, height: 0 } } : undefined}>
            <View w={RING_SIZE} h={RING_SIZE} ai="center" jc="center">
              <Svg width={RING_SIZE} height={RING_SIZE}>
                <Circle cx={RING_SIZE / 2} cy={RING_SIZE / 2} r={RING_RADIUS} fill="none" stroke={PRECISION_COLORS.whiteTrack} strokeWidth="5" />
                <Circle
                  cx={RING_SIZE / 2} cy={RING_SIZE / 2} r={RING_RADIUS}
                  fill="none"
                  stroke={ringColor}
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeDasharray={`${ringProgress} ${RING_CIRC}`}
                  transform={`rotate(-90 ${RING_SIZE / 2} ${RING_SIZE / 2})`}
                />
              </Svg>
              <View ai="center" style={{ position: "absolute" }}>
                <Text color={PRECISION_COLORS.textStrong} fos={23} fow="900" ls={-0.5}>{clampedAccuracy.toFixed(0)}%</Text>
                <Text color={PRECISION_COLORS.textBodyMuted} fos={8.5} ls={1.4} textTransform="uppercase" fow="700">{t("accuracy")}</Text>
              </View>
            </View>
          </Animated.View>

          <View>
            {flawless ? (
              <View flexDirection="row" ai="center" gap={6} mb={4}>
                <View w={4} h={4} br={2} bg={PRECISION_COLORS.goldStrong} />
                <Text color={PRECISION_COLORS.goldStrong} fow="900" fos={11} ls={2.4} textTransform="uppercase">
                  {t("flawlessLabel")}
                </Text>
                <View w={4} h={4} br={2} bg={PRECISION_COLORS.goldStrong} />
              </View>
            ) : null}
            <Text color={PRECISION_COLORS.textStrong} fos={24} lh={26} fow="900" ls={-0.5} mb={4}>
              {t("excellent")}
            </Text>
            <Text color={flawless ? PRECISION_COLORS.goldStrong : PRECISION_COLORS.primaryStrong} fos={20} ls={3} mb={4}>
              {"★".repeat(stars)}{"☆".repeat(Math.max(0, 3 - stars))}
            </Text>
            <Text color={PRECISION_COLORS.textMuted} fos={10} ls={0.6} textTransform="uppercase" fow="700">
              {tShape(targetShape)} · {source === "local" ? t("local") : t("server")}
            </Text>
          </View>
        </View>
      </View>

      {/* ── Stroke preview ── */}
      <View
        flex={1}
        ai="center"
        jc="center"
        margin={16}
        bg="rgba(0,0,0,0.32)"
        br={PRECISION_RADIUS.xxl}
        bw={1}
        borderColor={PRECISION_COLORS.borderMuted}
        onLayout={(e) => {
          const { width, height } = e.nativeEvent.layout;
          const s = Math.min(width - 16, height - 16);
          if (s > 0) setDrawAreaSize(s);
        }}
      >
        <Svg width={drawAreaSize} height={drawAreaSize}>
          {hasGhost ? (
            <Path
              d={toPathDynamic(ghostPoints as Point[], drawAreaSize)}
              fill="none"
              stroke={PRECISION_COLORS.cyan}
              strokeWidth={2.5}
              strokeDasharray="6 8"
              opacity={0.55}
            />
          ) : null}
          {resolvedVisual.trailColor && <Path d={toPathDynamic(userPoints, drawAreaSize)} fill="none" stroke={resolvedVisual.trailColor} strokeWidth={resolvedVisual.trailWidth || 8} />}
          <Path d={toPathDynamic(userPoints, drawAreaSize)} fill="none" stroke={resolvedVisual.strokeColor} strokeWidth={Math.max(3, resolvedVisual.strokeWidth)} />
        </Svg>
        {hasGhost ? (
          <View
            pos="absolute" t={8} r={10}
            flexDirection="row" ai="center" gap={6}
            bg="rgba(0,0,0,0.4)" br={999} px={8} py={3}
            bw={1} borderColor="rgba(195,208,222,0.25)"
          >
            <ShapeMark shape="circle" size={7} color={PRECISION_COLORS.cyan} strokeWidth={2.6} />
            <Text color={PRECISION_COLORS.cyan} fos={8.5} fow="800" ls={1.2} textTransform="uppercase">
              {t("ghostLabel")}
            </Text>
          </View>
        ) : null}
      </View>

      {/* ── Metrics ── */}
      <View flexDirection="row" gap={10} jc="center" mx={16} mb={14}>
        {[
          { label: t("stars"), val: `+${stars}`, anim: metricAnimValues[0], color: PRECISION_COLORS.primaryStrong },
          { label: t("points"), val: `+${xpGained}`, anim: metricAnimValues[1], color: PRECISION_COLORS.cyan },
          { label: t("deviation"), val: meanDeviation.toFixed(3), anim: metricAnimValues[2], color: PRECISION_COLORS.textStrong }
        ].map((m, i) => (
          <Animated.View key={i} style={{ flex: 1, opacity: m.anim, transform: [{ translateY: m.anim.interpolate({ inputRange: [0, 1], outputRange: [8, 0] }) }] }}>
            <View ai="center" bg={PRECISION_COLORS.surfaceSunken} br={PRECISION_RADIUS.xl} py={12} px={12}>
              <Text color={m.color} fow="900" fos={15} ls={-0.3}>{m.val}</Text>
              <Text color={PRECISION_COLORS.textBodyMuted} fos={9} mt={1} ls={1.2} textTransform="uppercase" fow="700">{m.label}</Text>
            </View>
          </Animated.View>
        ))}
      </View>

      {/* ── Actions ── */}
      <View px={16} pb={16} gap={10}>
        <View flexDirection="row" gap={10}>
          <View flex={1}>
            <View br={PRECISION_RADIUS.xl} overflow="hidden" opacity={canGoNextLevel ? 1 : 0.4}>
              <Pressable
                onPress={onNextLevel}
                disabled={!canGoNextLevel}
                style={({ pressed }) => ({
                  paddingVertical: 14,
                  borderRadius: PRECISION_RADIUS.xl,
                  backgroundColor: PRECISION_COLORS.primary,
                  shadowColor: PRECISION_COLORS.primary,
                  shadowOpacity: canGoNextLevel ? 0.35 : 0,
                  shadowRadius: 14,
                  shadowOffset: { width: 0, height: 5 },
                  transform: [{ scale: pressed && canGoNextLevel ? 0.97 : 1 }]
                })}
              >
                <Text ta="center" color={PRECISION_COLORS.primaryInk} fow="900" fos={14} ls={0.4} numberOfLines={1}>
                  {nextLevelLabel}
                </Text>
              </Pressable>
            </View>
          </View>

          <Pressable
            onPress={onRetry}
            style={({ pressed }) => ({
              borderRadius: PRECISION_RADIUS.xl,
              paddingVertical: 14,
              paddingHorizontal: 22,
              borderWidth: 1,
              borderColor: PRECISION_COLORS.border,
              backgroundColor: pressed ? PRECISION_COLORS.surfaceStrong : PRECISION_COLORS.surface,
              transform: [{ scale: pressed ? 0.98 : 1 }]
            })}
          >
            <Text ta="center" color={PRECISION_COLORS.textDim} fow="800" fos={13} ls={0.6} textTransform="uppercase">
              {t("tryAgain")}
            </Text>
          </Pressable>
        </View>

        {showRewardedRetry ? (
          <Pressable
            onPress={onRewardedRetry}
            disabled={!canUseRewardedRetry}
            style={({ pressed }) => ({
              borderWidth: 1,
              borderColor: PRECISION_COLORS.borderGoldActive,
              backgroundColor: PRECISION_COLORS.primarySoft,
              borderRadius: PRECISION_RADIUS.xl,
              paddingVertical: 11,
              opacity: canUseRewardedRetry ? 1 : 0.4,
              transform: [{ scale: pressed && canUseRewardedRetry ? 0.98 : 1 }]
            })}
          >
            <Text ta="center" color={PRECISION_COLORS.primaryStrong} fow="800" fos={12} ls={0.3}>
              {rewardedRetryLabel}
            </Text>
          </Pressable>
        ) : null}
      </View>

      {/* ── Watermark (visible on shared cards) ── */}
      <View flexDirection="row" ai="center" jc="center" gap={6} pb={14} pt={2}>
        <ShapeMark shape="star" size={11} color={PRECISION_COLORS.goldStrong} strokeWidth={2.2} />
        <Text color={PRECISION_COLORS.textMuted} fos={10} fow="800" ls={2} textTransform="uppercase">
          DrawPro · {t("appSubtitle")}
        </Text>
      </View>
    </View>
  );
}
