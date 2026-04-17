import AsyncStorage from "@react-native-async-storage/async-storage";

const TUTORIAL_KEY = "precision_tutorial_seen_v1";

export async function hasSeenTutorial(): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(TUTORIAL_KEY);
    return value === "1";
  } catch {
    return false;
  }
}

export async function markTutorialSeen(): Promise<void> {
  await AsyncStorage.setItem(TUTORIAL_KEY, "1");
}
