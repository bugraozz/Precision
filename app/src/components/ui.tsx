import React from "react";
import { Animated, Pressable, ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Circle, Path } from "react-native-svg";
import { Text, View } from "tamagui";
import {
  PRECISION_COLORS,
  PRECISION_GRADIENTS,
  PRECISION_RADIUS
} from "../theme/precisionTokens";

/* ─────────────────────────────────────────────────────────────────────────
 * Shape marks — real geometry via SVG.
 * Replaces unicode glyphs that render as tofu boxes on some devices.
 * ──────────────────────────────────────────────────────────────────────── */
export type ShapeKey =
  | "circle" | "square" | "triangle" | "diamond"
  | "pentagon" | "hexagon" | "heart" | "star";

export function ShapeMark({
  shape,
  size = 16,
  color,
  strokeWidth = 2.4
}: {
  shape: ShapeKey | string;
  size?: number;
  color: string;
  strokeWidth?: number;
}) {
  const common = {
    fill: "none" as const,
    stroke: color,
    strokeWidth,
    strokeLinejoin: "round" as const,
    strokeLinecap: "round" as const
  };
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {shape === "circle" && <Circle cx={12} cy={12} r={9} {...common} />}
      {shape === "square" && <Path d="M5.5 3.5 H18.5 A2 2 0 0 1 20.5 5.5 V18.5 A2 2 0 0 1 18.5 20.5 H5.5 A2 2 0 0 1 3.5 18.5 V5.5 A2 2 0 0 1 5.5 3.5 Z" {...common} />}
      {shape === "triangle" && <Path d="M12 3.5 L21 20 H3 Z" {...common} />}
      {shape === "diamond" && <Path d="M12 2.5 L21.5 12 L12 21.5 L2.5 12 Z" {...common} />}
      {shape === "pentagon" && <Path d="M12 2.6 L21.5 9.5 L18 20.5 H6 L2.5 9.5 Z" {...common} />}
      {shape === "hexagon" && <Path d="M12 2.5 L20.7 7.2 V16.8 L12 21.5 L3.3 16.8 V7.2 Z" {...common} />}
      {shape === "heart" && <Path d="M12 20.5 C5 15 3 10 6 6.8 C8 4.6 11 5.2 12 7.4 C13 5.2 16 4.6 18 6.8 C21 10 19 15 12 20.5 Z" {...common} />}
      {shape === "star" && <Path d="M12 3 L14.7 8.9 L21 9.6 L16.3 13.9 L17.6 20.3 L12 17 L6.4 20.3 L7.7 13.9 L3 9.6 L9.3 8.9 Z" {...common} />}
    </Svg>
  );
}

export const SHAPE_KEYS: ShapeKey[] = [
  "circle", "square", "triangle", "diamond", "pentagon", "hexagon", "heart", "star"
];

/* ── Reveal: shared enter animation ── */
export function Reveal({
  anim,
  shift = 16,
  children
}: {
  anim: Animated.Value;
  shift?: number;
  children: React.ReactNode;
}) {
  return (
    <Animated.View
      style={{
        opacity: anim,
        transform: [
          { translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [shift, 0] }) }
        ]
      }}
    >
      {children}
    </Animated.View>
  );
}

/* ── Screen ambience: base gradient + soft color glows ── */
export function ScreenAmbience() {
  return (
    <View pos="absolute" t={0} l={0} r={0} b={0} pointerEvents="none">
      <LinearGradient
        colors={PRECISION_GRADIENTS.hero}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
      />
      <View
        pos="absolute"
        t={-140}
        r={-110}
        w={380}
        h={380}
        br={190}
        bg={PRECISION_COLORS.cyanAura}
      />
      <View
        pos="absolute"
        t={230}
        l={-130}
        w={320}
        h={320}
        br={160}
        bg={PRECISION_COLORS.pinkAura}
      />
      <View
        pos="absolute"
        b={-170}
        l={-120}
        w={380}
        h={380}
        br={190}
        bg={PRECISION_COLORS.primaryAura}
      />
    </View>
  );
}

/* ── Section label: champagne tick + tracked caps ── */
export function SectionLabel({ children }: { children: string }) {
  return (
    <View flexDirection="row" ai="center" gap={8} mb={12}>
      <View w={3} h={12} br={2} bg={PRECISION_COLORS.goldStrong} />
      <Text
        color={PRECISION_COLORS.textMuted}
        fos={10}
        fow="800"
        ls={2}
        textTransform="uppercase"
      >
        {children}
      </Text>
    </View>
  );
}

/* ── Hairline divider ── */
export function Divider({ my = 16 }: { my?: number }) {
  return <View h={1} bg={PRECISION_COLORS.borderMuted} my={my} />;
}

/* ── Glass card ── */
export function GlassCard({
  children,
  accent,
  style
}: {
  children: React.ReactNode;
  accent?: "red" | "ice" | "gold" | "none";
  style?: ViewStyle;
}) {
  const borderColor =
    accent === "red"
      ? "rgba(225,29,72,0.28)"
      : accent === "ice"
        ? PRECISION_COLORS.cyanTint
        : accent === "gold"
          ? PRECISION_COLORS.borderGoldSoft
          : PRECISION_COLORS.borderCard;
  const bg =
    accent === "red"
      ? PRECISION_COLORS.primarySoftMid
      : accent === "ice"
        ? PRECISION_COLORS.cyanTint
        : accent === "gold"
          ? PRECISION_COLORS.goldSoft
          : PRECISION_COLORS.surface;

  return (
    <View
      br={PRECISION_RADIUS.card}
      bw={1}
      borderColor={borderColor}
      bg={bg}
      p={16}
      overflow="hidden"
      style={style}
    >
      <LinearGradient
        colors={PRECISION_GRADIENTS.cardGloss}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        pointerEvents="none"
        style={{ position: "absolute", top: 0, left: 0, right: 0, height: 88 }}
      />
      <View pos="relative">{children}</View>
    </View>
  );
}

/* ── Stat bar: single premium wallet strip (stars · coins) ── */
export function StatBar({
  items,
  style
}: {
  items: Array<{ icon: ShapeKey; color: string; soft: string; value: string | number; label: string }>;
  style?: ViewStyle;
}) {
  return (
    <View
      flexDirection="row"
      br={PRECISION_RADIUS.card}
      bw={1}
      borderColor={PRECISION_COLORS.borderCard}
      bg={PRECISION_COLORS.surface}
      overflow="hidden"
      style={style}
    >
      {items.map((item, i) => (
        <React.Fragment key={i}>
          {i > 0 ? <View w={1} bg={PRECISION_COLORS.borderMuted} my={20} /> : null}
          <View f={1} flexDirection="row" ai="center" gap={12} py={16} px={16}>
            <View w={36} h={36} br={18} ai="center" jc="center" bg={item.soft}>
              <ShapeMark shape={item.icon} size={16} color={item.color} strokeWidth={2.2} />
            </View>
            <View>
              <Text color={PRECISION_COLORS.textStrong} fos={18} fow="900" ls={-0.4}>
                {item.value}
              </Text>
              <Text
                color={PRECISION_COLORS.textMuted}
                fos={9}
                fow="800"
                ls={1.6}
                textTransform="uppercase"
                mt={2}
              >
                {item.label}
              </Text>
            </View>
          </View>
        </React.Fragment>
      ))}
    </View>
  );
}

/* ── Meta cell (label over value), borderless ── */
export function MetaCell({ label, value }: { label: string; value: string }) {
  return (
    <View f={1} br={PRECISION_RADIUS.xl} bg={PRECISION_COLORS.surfaceSunken} py={12} px={14}>
      <Text color={PRECISION_COLORS.textMuted} fos={9} fow="800" ls={1.4} textTransform="uppercase" mb={3}>
        {label}
      </Text>
      <Text color={PRECISION_COLORS.text} fow="800" fos={14}>
        {value}
      </Text>
    </View>
  );
}

/* ── Primary CTA: ruby melt + glow ── */
export function PrimaryCta({
  label,
  onPress,
  disabled = false,
  height = 56,
  fontSize = 15
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  height?: number;
  fontSize?: number;
}) {
  return (
    <View
      br={PRECISION_RADIUS.xl}
      overflow="hidden"
      opacity={disabled ? 0.45 : 1}
      shadowColor={PRECISION_COLORS.primary}
      shadowOpacity={disabled ? 0 : 0.35}
      shadowRadius={18}
      shadowOffset={{ width: 0, height: 6 }}
    >
      <LinearGradient
        colors={PRECISION_GRADIENTS.primary}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Pressable
          onPress={onPress}
          disabled={disabled}
          style={({ pressed }) => ({
            height,
            alignItems: "center",
            justifyContent: "center",
            transform: [{ scale: pressed && !disabled ? 0.975 : 1 }],
            opacity: pressed ? 0.92 : 1
          })}
        >
          <Text color={PRECISION_COLORS.primaryInk} fow="900" fos={fontSize} ls={0.4} textTransform="uppercase">
            {label}
          </Text>
        </Pressable>
      </LinearGradient>
    </View>
  );
}

/* ── Chip (filter / toggle) ── */
export function Chip({
  label,
  icon,
  active = false,
  onPress
}: {
  label: string;
  icon?: ShapeKey | string;
  active?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        paddingHorizontal: 14,
        height: 40,
        borderRadius: PRECISION_RADIUS.pill,
        borderWidth: 1,
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        borderColor: active
          ? PRECISION_COLORS.borderGoldStrong
          : PRECISION_COLORS.borderMuted,
        backgroundColor: active ? PRECISION_COLORS.primarySoft : PRECISION_COLORS.surface,
        transform: [{ scale: pressed ? 0.96 : 1 }]
      })}
    >
      {icon ? <ShapeMark shape={icon} size={13} color={active ? PRECISION_COLORS.primaryStrong : PRECISION_COLORS.textDim} strokeWidth={2.2} /> : null}
      <Text
        color={active ? PRECISION_COLORS.primaryStrong : PRECISION_COLORS.textDim}
        fow="800"
        fos={12}
        ls={0.3}
      >
        {label}
      </Text>
    </Pressable>
  );
}

/* ── Status pill ── */
export function StatusPill({ text }: { text: string }) {
  if (!text) return null;
  return (
    <View
      alignSelf="center"
      flexDirection="row"
      ai="center"
      gap={8}
      height={36}
      px={14}
      br={PRECISION_RADIUS.pill}
      bw={1}
      borderColor={PRECISION_COLORS.borderCard}
      bg={PRECISION_COLORS.surfaceStrong}
      maxWidth="100%"
    >
      <View w={5} h={5} br={3} bg={PRECISION_COLORS.goldStrong} />
      <Text color={PRECISION_COLORS.textDim} fos={12} fow="700" numberOfLines={1} flexShrink={1}>
        {text}
      </Text>
    </View>
  );
}
