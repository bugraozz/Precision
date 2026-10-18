import React from "react";
import { Pressable } from "react-native";
import { Text, View } from "tamagui";
import { LevelConfig, getChapterById } from "../levels";
import { t, tShape, tDifficulty, tMechanic, tChapterTitle } from "../i18n";
import { PRECISION_COLORS, PRECISION_RADIUS } from "../theme/precisionTokens";
import { ShapeMark } from "./ui";

type LevelSelectorProps = {
  levels: LevelConfig[];
  selectedLevelId: string;
  unlockedLevels: string[];
  bestStarsByLevel: Record<string, 0 | 1 | 2 | 3>;
  onSelect: (levelId: string) => void;
};

function mechanicMeta(tag: LevelConfig["mechanicTag"]) {
  if (tag === "speed") return { color: PRECISION_COLORS.mechanicSpeed, bg: PRECISION_COLORS.mechanicSpeedBg };
  if (tag === "stability") return { color: PRECISION_COLORS.mechanicStability, bg: PRECISION_COLORS.mechanicStabilityBg };
  if (tag === "symmetry") return { color: PRECISION_COLORS.mechanicSymmetry, bg: PRECISION_COLORS.mechanicSymmetryBg };
  return { color: PRECISION_COLORS.mechanicMemory, bg: PRECISION_COLORS.mechanicMemoryBg };
}

export default function LevelSelector({ levels, selectedLevelId, unlockedLevels, bestStarsByLevel, onSelect }: LevelSelectorProps) {
  return (
    <View gap={10} mb={24}>
      {levels.map((level) => {
        const unlocked = unlockedLevels.includes(level.id);
        const selected = selectedLevelId === level.id;
        const stars = bestStarsByLevel[level.id] || 0;
        const mechanic = mechanicMeta(level.mechanicTag);

        return (
          <Pressable
            key={level.id}
            onPress={() => onSelect(level.id)}
            disabled={!unlocked}
            style={({ pressed }) => ({
              borderRadius: PRECISION_RADIUS.xxl,
              borderWidth: 1,
              borderColor: selected
                ? "rgba(225,29,72,0.3)"
                : unlocked
                  ? PRECISION_COLORS.border
                  : PRECISION_COLORS.borderFaint,
              backgroundColor: selected ? PRECISION_COLORS.primarySoftMid : PRECISION_COLORS.surface,
              paddingVertical: 12,
              paddingLeft: 14,
              paddingRight: 14,
              overflow: "hidden",
              opacity: unlocked ? 1 : 0.45,
              transform: [{ scale: pressed && unlocked ? 0.98 : 1 }]
            })}
          >
            {selected ? (
              <View pos="absolute" l={0} t={12} b={12} w={3} br={2} bg={PRECISION_COLORS.primaryStrong} />
            ) : null}

            <View flexDirection="row" ai="center" gap={12} pl={selected ? 8 : 0}>
              {/* Level number */}
              <View
                w={48} h={48} br={PRECISION_RADIUS.lg} ai="center" jc="center"
                bg={selected ? PRECISION_COLORS.primarySoft : PRECISION_COLORS.surfaceSunken}
                bw={1}
                borderColor={selected ? "rgba(225,29,72,0.24)" : PRECISION_COLORS.border}
              >
                <Text
                  color={unlocked
                    ? (selected ? PRECISION_COLORS.primaryStrong : PRECISION_COLORS.textDim)
                    : PRECISION_COLORS.textMuted}
                  fow="900" fos={16} ls={-0.3}
                >
                  {String(level.index).padStart(2, "0")}
                </Text>
              </View>

              {/* Text & tags */}
              <View f={1}>
                <View flexDirection="row" ai="center" gap={8}>
                  <Text
                    color={unlocked ? PRECISION_COLORS.textStrong : PRECISION_COLORS.textMuted}
                    fow="900" fos={15} ls={-0.2}
                  >
                    {tShape(level.targetShape)}
                  </Text>
                  {level.isBoss ? (
                    <View bg={PRECISION_COLORS.bossBg} br={PRECISION_RADIUS.pill} px={8} py={2}>
                      <Text color={PRECISION_COLORS.bossText} fos={8.5} fow="900" ls={1}>{t("boss")}</Text>
                    </View>
                  ) : null}
                </View>
                <Text
                  color={unlocked ? PRECISION_COLORS.textMuted : PRECISION_COLORS.textSubtle}
                  fos={10} mt={3} fow="700" ls={0.6} textTransform="uppercase"
                  numberOfLines={1}
                >
                  {getChapterById(level.chapterId) ? tChapterTitle(getChapterById(level.chapterId)!.title) : ""}
                </Text>

                <View flexDirection="row" mt={8} ai="center" gap={8}>
                  <View bg={mechanic.bg} br={PRECISION_RADIUS.pill} px={10} py={3}>
                    <Text color={mechanic.color} fos={9} fow="800" ls={0.8}>
                      {tMechanic(level.mechanicTag).toUpperCase()}
                    </Text>
                  </View>
                  <View bg={PRECISION_COLORS.whiteSoft} br={PRECISION_RADIUS.pill} px={10} py={3}>
                    <Text
                      color={PRECISION_COLORS.textCardMeta}
                      fos={9} fow="800" ls={0.8}
                      opacity={unlocked ? 1 : 0.5}
                    >
                      {tDifficulty(level.difficulty).toUpperCase()}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Stars + action */}
              <View ai="flex-end" jc="center" gap={6}>
                <Text color={PRECISION_COLORS.amberStrong} fos={11} fow="900" ls={1}>
                  {"★".repeat(stars)}
                  <Text color={PRECISION_COLORS.textMuted} fos={11} fow="700">
                    {"☆".repeat(Math.max(0, 3 - stars))}
                  </Text>
                </Text>
                <View
                  w={32} h={32} br={PRECISION_RADIUS.lg} ai="center" jc="center"
                  bg={selected ? PRECISION_COLORS.primary : PRECISION_COLORS.surfaceSunken}
                  bw={1}
                  borderColor={selected ? PRECISION_COLORS.primary : PRECISION_COLORS.border}
                >
                  {unlocked ? (
                    <Text color={selected ? PRECISION_COLORS.primaryInk : PRECISION_COLORS.textMuted} fos={14} fow="900">
                      ›
                    </Text>
                  ) : (
                    <ShapeMark shape="circle" size={9} color={PRECISION_COLORS.textSubtle} strokeWidth={2.6} />
                  )}
                </View>
              </View>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}
