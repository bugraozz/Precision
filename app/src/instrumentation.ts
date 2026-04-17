const appBootAt = Date.now();

type CrashlyticsApi = {
  setCrashlyticsCollectionEnabled: (enabled: boolean) => Promise<void>;
  recordError: (error: Error) => void;
  log: (message: string) => void;
};

let crashlyticsApi: CrashlyticsApi | null = null;

try {
  // Use SDK when available (dev build / production). In Expo Go this may be unavailable.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const crashlyticsFactory = require("@react-native-firebase/crashlytics").default;
  crashlyticsApi = crashlyticsFactory();
} catch {
  crashlyticsApi = null;
}

type ErrorUtilsShape = {
  getGlobalHandler?: () => (error: Error, isFatal?: boolean) => void;
  setGlobalHandler?: (handler: (error: Error, isFatal?: boolean) => void) => void;
};

export function getStartupDurationMs(): number {
  return Math.max(0, Date.now() - appBootAt);
}

export async function setCrashlyticsEnabled(enabled: boolean): Promise<void> {
  if (!crashlyticsApi) {
    return;
  }
  await crashlyticsApi.setCrashlyticsCollectionEnabled(enabled);
}

export function recordCrashlyticsError(error: Error): void {
  if (!crashlyticsApi) {
    return;
  }
  crashlyticsApi.recordError(error);
}

export function logCrashlyticsMessage(message: string): void {
  if (!crashlyticsApi) {
    return;
  }
  crashlyticsApi.log(message);
}

export function installGlobalErrorHandler(
  onError: (error: Error, isFatal: boolean) => void
): () => void {
  const maybeGlobal = globalThis as unknown as {
    ErrorUtils?: ErrorUtilsShape;
  };
  const errorUtils = maybeGlobal.ErrorUtils;

  if (!errorUtils?.setGlobalHandler || !errorUtils?.getGlobalHandler) {
    return () => {};
  }

  const previous = errorUtils.getGlobalHandler();
  errorUtils.setGlobalHandler((error, isFatal) => {
    onError(error, Boolean(isFatal));
    if (previous) {
      previous(error, isFatal);
    }
  });

  return () => {
    if (previous) {
      errorUtils.setGlobalHandler?.(previous);
    }
  };
}
