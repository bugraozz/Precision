const crypto = require("node:crypto");

function normalizeProviderResult(result) {
  if (!result || typeof result !== "object") {
    return { valid: false, reason: "provider_invalid_response" };
  }

  return {
    valid: Boolean(result.valid),
    reason: typeof result.reason === "string" ? result.reason : "verification_failed",
    transactionId: typeof result.transactionId === "string" ? result.transactionId : null,
    expiresAtMs: Number.isFinite(result.expiresAtMs) ? result.expiresAtMs : null,
    raw: result.raw || null
  };
}

function createWebhookSignature(secret, payloadJson, timestampSec) {
  const base = `${timestampSec}.${payloadJson}`;
  const digest = crypto.createHmac("sha256", secret).update(base).digest("hex");
  return {
    timestampSec,
    signature: `v1=${digest}`
  };
}

async function mockProviderVerify(payload) {
  const sandbox = Boolean(payload.sandbox);
  const hasProof = typeof payload.purchaseToken === "string" || typeof payload.receiptData === "string";

  if (!sandbox && !hasProof) {
    return {
      valid: false,
      reason: "missing_purchase_proof"
    };
  }

  return {
    valid: true,
    reason: "ok",
    transactionId: hasProof ? String(payload.purchaseToken || payload.receiptData).slice(0, 64) : "sandbox_tx",
    raw: {
      mode: sandbox ? "sandbox" : "proof-present"
    }
  };
}

async function webhookProviderVerify(payload, opts) {
  const endpoint = opts?.endpoint;
  if (!endpoint) {
    return {
      valid: false,
      reason: "missing_webhook_endpoint"
    };
  }

  const payloadJson = JSON.stringify(payload);
  const headers = {
    "Content-Type": "application/json"
  };

  if (opts?.secret) {
    const timestampSec = Math.floor(Date.now() / 1000);
    const signed = createWebhookSignature(opts.secret, payloadJson, timestampSec);
    headers["x-provider-timestamp"] = String(signed.timestampSec);
    headers["x-provider-signature"] = signed.signature;
  }

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers,
      body: payloadJson
    });

    if (!response.ok) {
      return {
        valid: false,
        reason: `provider_http_${response.status}`
      };
    }

    const body = await response.json();
    return normalizeProviderResult(body);
  } catch (error) {
    return {
      valid: false,
      reason: `provider_request_failed:${String(error)}`
    };
  }
}

function resolveProviderType(platform, env) {
  if (platform === "android") {
    return String(env.PURCHASE_VERIFY_PROVIDER_ANDROID || "mock").toLowerCase();
  }
  return String(env.PURCHASE_VERIFY_PROVIDER_IOS || "mock").toLowerCase();
}

function resolveWebhookConfig(platform, env) {
  if (platform === "android") {
    return {
      endpoint: env.PURCHASE_VERIFY_WEBHOOK_ANDROID_URL,
      secret: env.PURCHASE_VERIFY_WEBHOOK_ANDROID_SECRET
    };
  }

  return {
    endpoint: env.PURCHASE_VERIFY_WEBHOOK_IOS_URL,
    secret: env.PURCHASE_VERIFY_WEBHOOK_IOS_SECRET
  };
}

async function verifyPurchase(payload, env = process.env) {
  const providerType = resolveProviderType(payload.platform, env || {});

  if (providerType === "webhook") {
    const config = resolveWebhookConfig(payload.platform, env || {});
    return webhookProviderVerify(payload, config);
  }

  return mockProviderVerify(payload);
}

module.exports = {
  verifyPurchase,
  normalizeProviderResult,
  createWebhookSignature
};
