import { AnalyticsBaseEvent } from "../../src/core/analytics";

type Runtime = {
  process?: {
    env?: Record<string, string | undefined>;
  };
};

let queue: AnalyticsBaseEvent[] = [];
let inflight = false;

function getEndpoint(): string | undefined {
  const runtime = globalThis as unknown as Runtime;
  return runtime.process?.env?.EXPO_PUBLIC_ANALYTICS_INGEST_URL;
}

async function postBatch(events: AnalyticsBaseEvent[]): Promise<void> {
  const endpoint = getEndpoint();
  if (!endpoint) {
    // Fallback for local dev when endpoint is not configured.
    // eslint-disable-next-line no-console
    console.log("[analytics:drop_missing_endpoint]", events.length);
    return;
  }

  await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ events })
  });
}

export async function flushAnalyticsQueue(): Promise<void> {
  if (inflight || queue.length === 0) {
    return;
  }

  inflight = true;
  const batch = queue;
  queue = [];

  try {
    await postBatch(batch);
  } catch {
    queue = [...batch, ...queue];
  } finally {
    inflight = false;
  }
}

export async function logAnalyticsEvent(event: AnalyticsBaseEvent): Promise<void> {
  queue.push(event);
  if (queue.length >= 5) {
    await flushAnalyticsQueue();
  }
}
