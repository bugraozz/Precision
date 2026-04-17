import React, { ReactNode, useMemo, useState } from "react";
import { StyleProp, StyleSheet, ViewStyle } from "react-native";
import { Button } from "tamagui";

type PressableStyleState = { pressed: boolean };

type TamaguiPressableProps = {
  onPress?: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle> | ((state: PressableStyleState) => StyleProp<ViewStyle>);
  children?: ReactNode;
};

export default function TamaguiPressable({ onPress, disabled, style, children }: TamaguiPressableProps) {
  const [pressed, setPressed] = useState(false);

  const resolvedStyle = useMemo(() => {
    const raw = typeof style === "function" ? style({ pressed }) : style;
    return StyleSheet.flatten(raw) || undefined;
  }, [pressed, style]);

  return (
    <Button
      unstyled
      onPress={onPress}
      disabled={disabled}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      style={resolvedStyle}
    >
      {children}
    </Button>
  );
}
