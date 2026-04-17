export type CosmeticVisual = {
  strokeColor: string;
  strokeWidth: number;
  trailColor?: string;
  trailWidth?: number;
  frameColor: string;
  accentColor: string;
};

export type CosmeticSlot = "brush" | "trail" | "frame";

export type CosmeticCatalogItem = {
  id: string;
  slot: CosmeticSlot;
  name: string;
  rarity: "Epic" | "Legendary" | "Mythic";
  visual: Partial<CosmeticVisual>;
};

const DEFAULT_VISUAL: CosmeticVisual = {
  strokeColor: "#67e8f9",
  strokeWidth: 4,
  frameColor: "rgba(56,189,248,0.32)",
  accentColor: "#67e8f9"
};

export const PREMIUM_COSMETIC_CATALOG: CosmeticCatalogItem[] = [
  {
    id: "premium-brush-aurora",
    slot: "brush",
    name: "Aurora Brush",
    rarity: "Epic",
    visual: { strokeColor: "#a78bfa", strokeWidth: 5, accentColor: "#c4b5fd" }
  },
  {
    id: "premium-brush-obsidian",
    slot: "brush",
    name: "Obsidian Needle",
    rarity: "Legendary",
    visual: { strokeColor: "#94a3b8", strokeWidth: 4.5, accentColor: "#e2e8f0" }
  },
  {
    id: "premium-brush-solar",
    slot: "brush",
    name: "Solar Lash",
    rarity: "Mythic",
    visual: { strokeColor: "#fb923c", strokeWidth: 5.2, accentColor: "#fdba74" }
  },
  {
    id: "premium-trail-comet",
    slot: "trail",
    name: "Comet Trail",
    rarity: "Epic",
    visual: { trailColor: "rgba(56,189,248,0.35)", trailWidth: 10 }
  },
  {
    id: "premium-trail-prism",
    slot: "trail",
    name: "Prism Wake",
    rarity: "Legendary",
    visual: { trailColor: "rgba(167,139,250,0.34)", trailWidth: 11 }
  },
  {
    id: "premium-trail-ember",
    slot: "trail",
    name: "Ember Wake",
    rarity: "Mythic",
    visual: { trailColor: "rgba(251,146,60,0.34)", trailWidth: 11 }
  },
  {
    id: "premium-frame-prism",
    slot: "frame",
    name: "Prism Frame",
    rarity: "Epic",
    visual: { frameColor: "rgba(251,191,36,0.52)", accentColor: "#fbbf24" }
  },
  {
    id: "premium-frame-obsidian",
    slot: "frame",
    name: "Obsidian Frame",
    rarity: "Legendary",
    visual: { frameColor: "rgba(148,163,184,0.48)", accentColor: "#cbd5e1" }
  },
  {
    id: "premium-frame-royal",
    slot: "frame",
    name: "Royal Frame",
    rarity: "Mythic",
    visual: { frameColor: "rgba(167,139,250,0.56)", accentColor: "#ddd6fe" }
  }
];

function findCatalogItem(itemId?: string | null): CosmeticCatalogItem | undefined {
  if (!itemId) {
    return undefined;
  }

  if (itemId.startsWith("premium-monthly-")) {
    return {
      id: itemId,
      slot: "frame",
      name: "Monthly Signature Frame",
      rarity: "Mythic",
      visual: {
        strokeColor: "#f9a8d4",
        trailColor: "rgba(236,72,153,0.3)",
        trailWidth: 9,
        frameColor: "rgba(244,114,182,0.5)",
        accentColor: "#f472b6"
      }
    };
  }

  return PREMIUM_COSMETIC_CATALOG.find((item) => item.id === itemId);
}

export function getCosmeticVisual(selectedCosmeticItemId?: string | null): CosmeticVisual {
  const item = findCatalogItem(selectedCosmeticItemId);
  if (!item) {
    return DEFAULT_VISUAL;
  }

  return {
    ...DEFAULT_VISUAL,
    ...item.visual
  };
}

export function getCosmeticCatalogBySlot(slot: CosmeticSlot, unlockedItems: string[]): CosmeticCatalogItem[] {
  return unlockedItems
    .map((id) => findCatalogItem(id))
    .filter((item): item is CosmeticCatalogItem => Boolean(item && item.slot === slot));
}

export function getCosmeticVisualFromLoadout(loadout: {
  selectedBrushId?: string | null;
  selectedTrailId?: string | null;
  selectedFrameId?: string | null;
  fallbackItemId?: string | null;
}): CosmeticVisual {
  const brush = getCosmeticVisual(loadout.selectedBrushId || loadout.fallbackItemId);
  const trail = getCosmeticVisual(loadout.selectedTrailId || loadout.fallbackItemId);
  const frame = getCosmeticVisual(loadout.selectedFrameId || loadout.fallbackItemId);

  return {
    strokeColor: brush.strokeColor,
    strokeWidth: brush.strokeWidth,
    trailColor: trail.trailColor,
    trailWidth: trail.trailWidth,
    frameColor: frame.frameColor,
    accentColor: frame.accentColor || brush.accentColor
  };
}
