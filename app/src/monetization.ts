import AsyncStorage from "@react-native-async-storage/async-storage";

const PREMIUM_KEY = "precision_premium_no_ads_v1";

export type PremiumState = {
  noAds: boolean;
};

export async function loadPremiumState(): Promise<PremiumState> {
  try {
    const raw = await AsyncStorage.getItem(PREMIUM_KEY);
    return {
      noAds: raw === "1"
    };
  } catch {
    return { noAds: false };
  }
}

export async function setPremiumNoAds(enabled: boolean): Promise<void> {
  await AsyncStorage.setItem(PREMIUM_KEY, enabled ? "1" : "0");
}
