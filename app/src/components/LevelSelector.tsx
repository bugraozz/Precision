import React from "react";
import { StyleSheet } from "react-native";
import { Text, View } from "tamagui";
import { LevelConfig, getChapterById } from "../levels";
import Pressable from "./TamaguiPressable";
import { t, tShape, tDifficulty, tMechanic, tChapterTitle } from "../i18n";
import {
  PRECISION_COLORS,
  PRECISION_RADIUS,
  PRECISION_SHADOW,
  PRECISION_SPACE,
  PRECISION_TYPE
} from "../theme/precisionTokens";

type LevelSelectorProps = {
  levels: LevelConfig[];
  selectedLevelId: string;
  unlockedLevels: string[];
  bestStarsByLevel: Record<string, 0 | 1 | 2 | 3>;
  onSelect: (levelId: string) => void;
};

function mechanicMeta(tag: LevelConfig["mechanicTag"]): { color: string; bg: string } {
  if (tag === "speed") {
    return { color: PRECISION_COLORS.mechanicSpeed, bg: PRECISION_COLORS.mechanicSpeedBg };
  }
  if (tag === "stability") {
    return { color: PRECISION_COLORS.mechanicStability, bg: PRECISION_COLORS.mechanicStabilityBg };
  }
  if (tag === "symmetry") {
    return { color: PRECISION_COLORS.mechanicSymmetry, bg: PRECISION_COLORS.mechanicSymmetryBg };
  }
  return { color: PRECISION_COLORS.mechanicMemory, bg: PRECISION_COLORS.mechanicMemoryBg };
}

function starsText(stars: 0 | 1 | 2 | 3): string {
  return "★".repeat(stars) + "☆".repeat(3 - stars);
}

export default function LevelSelector({
  levels,
  selectedLevelId,
  unlockedLevels,
  bestStarsByLevel,
  onSelect
}: LevelSelectorProps) {
  return (
    <View style={styles.wrap}>
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
            style={({ pressed }) => [
              styles.item,
              selected && styles.itemSelected,
              !unlocked && styles.itemLocked,
              pressed && unlocked && styles.itemPressed
            ]}
          >
            {selected && <View style={styles.selectedIndicator} />}

            <View style={styles.leftRow}>
              <View style={[styles.iconTile, selected && styles.iconTileSelected, !unlocked && styles.iconTileLocked]}>
                <Text style={[styles.iconTileText, !unlocked && { color: PRECISION_COLORS.textMuted }]}>{level.targetShape.slice(0, 1).toUpperCase()}</Text>
                {stars > 0 && unlocked && (
                  <View style={styles.starsBadge}>
                    <Text style={styles.starsBadgeText}>{stars}</Text>
                    <Text style={styles.starsBadgeStar}>{"\u2605"}</Text>
                  </View>
                )}
              </View>

              <View style={styles.metaWrap}>
                <View style={styles.titleRow}>
                  <Text style={[styles.levelTitle, !unlocked && { color: PRECISION_COLORS.textMuted }]}>
                    {t("levelLabel")} {level.index}
                  </Text>
                  {level.isBoss && <Text style={styles.bossTag}>{t("boss")}</Text>}
                </View>
                <Text style={[styles.levelSubtitle, !unlocked && { color: PRECISION_COLORS.textPlaySubtle }]}>
                  {(() => {
                    const ch = getChapterById(level.chapterId);
                    const chTitle = ch ? tChapterTitle(ch.title) : "";
                    if (level.isBoss) return `${chTitle} ${t("bossRound")}`;
                    const localNum = level.title.match(/\d+$/)?.[0] || "";
                    return `${chTitle} ${localNum}`;
                  })()}
                </Text>
                <View style={styles.tagRow}>
                  <Text style={[styles.levelTag, { color: mechanic.color, backgroundColor: mechanic.bg }]}>
                    {tMechanic(level.mechanicTag).toUpperCase()}
                  </Text>
                  <Text style={[styles.difficultyTag, !unlocked && { opacity: 0.5 }]}>{tDifficulty(level.difficulty).toUpperCase()}</Text>
                </View>
              </View>
            </View>

            {unlocked ? (
              <View style={[styles.playButton, selected && styles.playButtonSelected]}>
                <Text style={[styles.playButtonText, selected && styles.playButtonTextSelected]}>{"\u25B6"}</Text>
              </View>
            ) : (
              <View style={styles.lockIcon}>
                <Text style={styles.lockIconText}>{"\uD83D\uDD12"}</Text>
              </View>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 10,
    marginBottom: PRECISION_SPACE.xxl
  },
  item: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    backgroundColor: "rgba(10,20,42,0.85)",
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    overflow: "hidden"
  },
  selectedIndicator: {
    position: "absolute",
    left: 0,
    top: 8,
    bottom: 8,
    width: 3,
    borderRadius: 2,
    backgroundColor: PRECISION_COLORS.primaryStrong
  },
  leftRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    flex: 1
  },
  iconTile: {
    width: 48,
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: PRECISION_COLORS.borderGold,
    backgroundColor: PRECISION_COLORS.primaryTint,
    alignItems: "center",
    justifyContent: "center"
  },
  iconTileSelected: {
    borderColor: PRECISION_COLORS.borderGoldStrong,
    backgroundColor: "rgba(251,191,36,0.18)"
  },
  iconTileLocked: {
    borderColor: "rgba(255,255,255,0.06)",
    backgroundColor: "rgba(255,255,255,0.03)"
  },
  iconTileText: {
    color: PRECISION_COLORS.iconTileText,
    fontWeight: "900",
    fontSize: 20
  },
  starsBadge: {
    position: "absolute",
    bottom: -4,
    right: -4,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(251,191,36,0.9)",
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 1,
    gap: 1
  },
  starsBadgeText: {
    color: "#1a1000",
    fontSize: 9,
    fontWeight: "900"
  },
  starsBadgeStar: {
    color: "#1a1000",
    fontSize: 7,
    fontWeight: "900"
  },
  metaWrap: {
    flex: 1
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  itemSelected: {
    borderColor: "rgba(252,215,122,0.35)",
    backgroundColor: "rgba(251,191,36,0.08)"
  },
  itemLocked: {
    opacity: 0.4
  },
  itemPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.88
  },
  levelTitle: {
    color: PRECISION_COLORS.textStrong,
    fontWeight: "900",
    fontSize: 15,
    letterSpacing: -0.2
  },
  levelSubtitle: {
    color: PRECISION_COLORS.textDim,
    fontSize: 12,
    marginTop: 2,
    fontWeight: "600"
  },
  tagRow: {
    marginTop: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  levelTag: {
    fontSize: 9,
    fontWeight: "900",
    borderRadius: PRECISION_RADIUS.pill,
    paddingHorizontal: 8,
    paddingVertical: 3,
    letterSpacing: 0.8
  },
  difficultyTag: {
    color: PRECISION_COLORS.textCardMeta,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.8,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: PRECISION_RADIUS.pill,
    paddingHorizontal: 8,
    paddingVertical: 3
  },
  bossTag: {
    color: PRECISION_COLORS.bossText,
    fontSize: 9,
    fontWeight: "900",
    backgroundColor: PRECISION_COLORS.bossBg,
    borderRadius: PRECISION_RADIUS.pill,
    paddingHorizontal: 8,
    paddingVertical: 3,
    letterSpacing: 0.8
  },
  playButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.06)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)"
  },
  playButtonSelected: {
    backgroundColor: PRECISION_COLORS.primary,
    borderColor: PRECISION_COLORS.primary
  },
  playButtonText: {
    color: PRECISION_COLORS.textMuted,
    fontSize: 12,
    fontWeight: "900"
  },
  playButtonTextSelected: {
    color: "#1a1000"
  },
  lockIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.03)",
    alignItems: "center",
    justifyContent: "center"
  },
  lockIconText: {
    fontSize: 14
  }
});
