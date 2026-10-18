import React, { useEffect, useMemo, useRef, useState } from "react";
import { LayoutChangeEvent, PanResponder, StyleSheet, Vibration } from "react-native";
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
  isStabilityMode?: boolean;
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

export default function DrawingCanvas({ onStrokeCommitted, resetKey, cosmeticVisual, isStabilityMode }: DrawingCanvasProps) {
  const [canvasW, setCanvasW] = useState(320);
  const [canvasH, setCanvasH] = useState(320);
  const [currentPoints, setCurrentPoints] = useState<Point[]>([]);
  const [allPoints, setAllPoints] = useState<Point[]>([]);
  const currentPointsRef = useRef<Point[]>([]);
  const allPointsRef = useRef<Point[]>([]);
  const startedAt = useRef<number>(0);
  const firstTouchAt = useRef<number>(0);
  const vibrationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (vibrationIntervalRef.current) {
        clearInterval(vibrationIntervalRef.current);
        vibrationIntervalRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    setCurrentPoints([]);
    setAllPoints([]);
    currentPointsRef.current = [];
    allPointsRef.current = [];
    /* Stroke timing anchors must not survive a canvas reset — otherwise a
     * stale first-ever touch leaks into the next round's duration math. */
    firstTouchAt.current = 0;
    startedAt.current = 0;
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
          currentPointsRef.current = [{ x: locationX, y: locationY }];
          setCurrentPoints([{ x: locationX, y: locationY }]);

          if (isStabilityMode) {
            Vibration.vibrate(50);
            vibrationIntervalRef.current = setInterval(() => {
              Vibration.vibrate(50);
            }, 300);
          }
        },
        onPanResponderMove: (event) => {
          const { locationX, locationY } = event.nativeEvent;
          const next = [...currentPointsRef.current, { x: locationX, y: locationY }];
          currentPointsRef.current = next;
          setCurrentPoints(next);
        },
        onPanResponderRelease: () => {
          const endedAt = Date.now();
          if (vibrationIntervalRef.current) {
            clearInterval(vibrationIntervalRef.current);
            vibrationIntervalRef.current = null;
          }
          // Commit outside the setState updater: side effects inside an
          // updater can double-fire under StrictMode and award twice.
          const merged = [...allPointsRef.current, ...currentPointsRef.current];
          allPointsRef.current = merged;
          currentPointsRef.current = [];
          setAllPoints(merged);
          setCurrentPoints([]);
          onStrokeCommitted(merged, firstTouchAt.current, endedAt);
        }
      }),
    [onStrokeCommitted, isStabilityMode]
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
    <View style={styles.container} onLayout={onLayout} {...panResponder.panHandlers}>
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
    flex: 1,
    borderRadius: PRECISION_RADIUS.card,
    backgroundColor: "rgba(4,6,10,0.92)",
    borderWidth: 0,
    overflow: "hidden"
  }
});
