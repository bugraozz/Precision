import React, { useEffect, useMemo, useRef, useState } from "react";
import { LayoutChangeEvent, PanResponder, StyleSheet } from "react-native";
import Svg, { Path } from "react-native-svg";
import { View } from "tamagui";
import { preprocessStroke } from "../../../src/core/geometry";
import { Point } from "../../../src/core/types";
import { CosmeticVisual } from "../cosmetics";
import { PRECISION_COLORS, PRECISION_RADIUS, PRECISION_SHADOW } from "../theme/precisionTokens";

type DrawingCanvasProps = {
  onStrokeCommitted: (points: Point[], startedAtMs: number, endedAtMs: number) => void;
  resetKey?: number;
  cosmeticVisual?: CosmeticVisual;
};

function pointsToPath(points: Point[]): string {
  if (points.length === 0) {
    return "";
  }

  const [first, ...rest] = points;
  const segments = rest.map((p) => `L ${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(" ");
  return `M ${first.x.toFixed(2)} ${first.y.toFixed(2)} ${segments}`;
}

const DEFAULT_VISUAL: CosmeticVisual = {
  strokeColor: PRECISION_COLORS.accentSoft,
  strokeWidth: 4,
  frameColor: PRECISION_COLORS.cyanSoft,
  accentColor: PRECISION_COLORS.accentSoft
};

export default function DrawingCanvas({ onStrokeCommitted, resetKey, cosmeticVisual }: DrawingCanvasProps) {
  const [canvasW, setCanvasW] = useState(320);
  const [canvasH, setCanvasH] = useState(320);
  const [currentPoints, setCurrentPoints] = useState<Point[]>([]);
  const [allPoints, setAllPoints] = useState<Point[]>([]);
  const startedAt = useRef<number>(0);
  const firstTouchAt = useRef<number>(0);

  useEffect(() => {
    setCurrentPoints([]);
    setAllPoints([]);
  }, [resetKey]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (event) => {
          const { locationX, locationY } = event.nativeEvent;
          const now = Date.now();
          if (firstTouchAt.current === 0) {
            firstTouchAt.current = now;
          }
          startedAt.current = now;
          setCurrentPoints([{ x: locationX, y: locationY }]);
        },
        onPanResponderMove: (event) => {
          const { locationX, locationY } = event.nativeEvent;
          setCurrentPoints((prev) => [...prev, { x: locationX, y: locationY }]);
        },
        onPanResponderRelease: () => {
          const endedAt = Date.now();
          setAllPoints((prev) => {
            const merged = [...prev, ...currentPoints];
            onStrokeCommitted(merged, firstTouchAt.current, endedAt);
            return merged;
          });
          setCurrentPoints([]);
        }
      }),
    [currentPoints, onStrokeCommitted]
  );

  const onLayout = (e: LayoutChangeEvent) => {
    setCanvasW(e.nativeEvent.layout.width);
    setCanvasH(e.nativeEvent.layout.height);
  };

  const smoothedAllPoints = useMemo(
    () => preprocessStroke(allPoints, { smoothingWindow: 2, minDistance: 1.2 }),
    [allPoints]
  );

  const smoothedCurrentPath = useMemo(
    () => preprocessStroke(currentPoints, { smoothingWindow: 1, minDistance: 0.8 }),
    [currentPoints]
  );

  const visual = cosmeticVisual || DEFAULT_VISUAL;

  return (
    <View style={[styles.container, { borderColor: visual.frameColor }]} onLayout={onLayout} {...panResponder.panHandlers}>
      <Svg width={canvasW} height={canvasH}>
        {visual.trailColor ? (
          <Path d={pointsToPath(smoothedAllPoints)} fill="none" stroke={visual.trailColor} strokeWidth={visual.trailWidth || 8} />
        ) : null}
        {visual.trailColor ? (
          <Path d={pointsToPath(smoothedCurrentPath)} fill="none" stroke={visual.trailColor} strokeWidth={visual.trailWidth || 8} />
        ) : null}
        <Path d={pointsToPath(smoothedAllPoints)} fill="none" stroke={visual.strokeColor} strokeWidth={visual.strokeWidth} />
        <Path d={pointsToPath(smoothedCurrentPath)} fill="none" stroke={visual.strokeColor} strokeWidth={visual.strokeWidth} />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: 340,
    borderRadius: PRECISION_RADIUS.card,
    backgroundColor: "#080e1c",
    borderWidth: 1.5,
    borderColor: PRECISION_COLORS.cyanSoft,
    overflow: "hidden"
  }
});
