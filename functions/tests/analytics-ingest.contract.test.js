const assert = require("node:assert/strict");
const { __test } = require("../src/index");

function createMockResponse() {
  return {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    }
  };
}

function createMockDeps(options = {}) {
  const writes = [];
  const shouldFail = options.shouldFail === true;

  const firestore = {
    collection(name) {
      return {
        doc(id) {
          const docId = id || `${name}_doc_${writes.length + 1}`;
          return { id: docId, path: `${name}/${docId}` };
        }
      };
    },
    batch() {
      return {
        set(ref, data) {
          writes.push({ ref, data });
        },
        async commit() {
          if (shouldFail) {
            throw new Error("commit_failed");
          }
        }
      };
    }
  };

  return {
    writes,
    deps: {
      firestore,
      logger: {
        warn() {},
        error() {}
      },
      fieldValue: {
        serverTimestamp: () => "SERVER_TIMESTAMP"
      }
    }
  };
}

function validRoundEvent() {
  return {
    schemaVersion: "1.0",
    eventType: "round_completed",
    userId: "user_1",
    timestamp: new Date().toISOString(),
    sessionId: "session_1",
    gameMode: "standard",
    arenaDifficulty: "medium",
    shapeName: "circle",
    accuracy: 91.2,
    timeSpentMs: 2200,
    stars: 2,
    xpEarned: 114,
    deviceInfo: { os: "unknown", version: "dev", model: "expo" },
    network: "unknown"
  };
}

async function runCase(name, fn) {
  await fn();
  console.log(`PASS ${name}`);
}

async function main() {
  await runCase("missing events payload returns 400", async () => {
    const req = { method: "POST", body: {} };
    const res = createMockResponse();
    const { deps } = createMockDeps();

    await __test.analyticsIngestHandler(req, res, deps);

    assert.equal(res.statusCode, 400);
    assert.equal(res.body.error, "missing_events");
  });

  await runCase("unsupported schema returns 422", async () => {
    const req = {
      method: "POST",
      body: {
        events: [{ ...validRoundEvent(), schemaVersion: "2.0" }]
      }
    };
    const res = createMockResponse();
    const { deps } = createMockDeps();

    await __test.analyticsIngestHandler(req, res, deps);

    assert.equal(res.statusCode, 422);
    assert.equal(res.body.accepted, false);
    assert.ok(res.body.invalidEvents[0].reasons.includes("unsupported_schema_version"));
  });

  await runCase("missing type-required fields returns 422", async () => {
    const invalid = validRoundEvent();
    delete invalid.accuracy;

    const req = { method: "POST", body: { events: [invalid] } };
    const res = createMockResponse();
    const { deps } = createMockDeps();

    await __test.analyticsIngestHandler(req, res, deps);

    assert.equal(res.statusCode, 422);
    assert.ok(res.body.invalidEvents[0].missingFields.includes("accuracy"));
  });

  await runCase("valid event batch is accepted", async () => {
    const req = {
      method: "POST",
      body: {
        events: [
          validRoundEvent(),
          {
            schemaVersion: "1.0",
            eventType: "session_started",
            userId: "user_1",
            timestamp: new Date().toISOString(),
            sessionId: "session_1",
            deviceInfo: { os: "unknown", version: "dev", model: "expo" },
            network: "unknown"
          },
          {
            schemaVersion: "1.0",
            eventType: "ad_shown",
            userId: "user_1",
            timestamp: new Date().toISOString(),
            sessionId: "session_1",
            placement: "retry_reward"
          },
          {
            schemaVersion: "1.0",
            eventType: "premium_purchased",
            userId: "user_1",
            timestamp: new Date().toISOString(),
            sessionId: "session_1",
            productId: "premium.no_ads.v1",
            sandbox: true
          },
          {
            schemaVersion: "1.0",
            eventType: "perf_marker",
            userId: "user_1",
            timestamp: new Date().toISOString(),
            sessionId: "session_1",
            metricName: "app_startup_ms",
            value: 321.4,
            unit: "ms"
          }
        ]
      }
    };
    const res = createMockResponse();
    const { deps, writes } = createMockDeps();

    await __test.analyticsIngestHandler(req, res, deps);

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.accepted, true);
    assert.equal(res.body.acceptedCount, 5);
    assert.equal(writes.length, 5);
    assert.equal(writes[0].ref.path.startsWith("analytics_events/"), true);
  });

  await runCase("firestore failure returns 500", async () => {
    const req = { method: "POST", body: { events: [validRoundEvent()] } };
    const res = createMockResponse();
    const { deps } = createMockDeps({ shouldFail: true });

    await __test.analyticsIngestHandler(req, res, deps);

    assert.equal(res.statusCode, 500);
    assert.equal(res.body.error, "internal_error");
  });
}

main().catch((error) => {
  console.error("FAIL analytics_ingest contract tests");
  console.error(error);
  process.exit(1);
});
