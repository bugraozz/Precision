const assert = require("node:assert/strict");
const { __test } = require("../src/index");

function buildPolylinePoints(count) {
  const points = [];
  for (let i = 0; i < count; i += 1) {
    points.push({
      x: i / (count - 1),
      y: ((i % 5) - 2) * 0.05
    });
  }
  return points;
}

function createValidPayload(overrides = {}) {
  return {
    userId: "user_1",
    sessionId: "session_1",
    gameMode: "classic",
    targetShape: "circle",
    points: buildPolylinePoints(40),
    timeLimitMs: 5000,
    startedAtMs: 1000,
    endedAtMs: 4000,
    difficulty: "medium",
    streakBonus: 2,
    ...overrides
  };
}

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
  const shouldFailTx = options.shouldFailTx === true;
  const firestore = {
    collection(name) {
      return {
        doc(id) {
          const docId = id || `${name}_generated_id`;
          return { id: docId, path: `${name}/${docId}` };
        }
      };
    },
    async runTransaction(callback) {
      if (shouldFailTx) {
        throw new Error("tx_failed");
      }
      const txn = {
        async get() {
          return {
            exists: false,
            data() {
              return {};
            }
          };
        },
        set(ref, data, txOptions) {
          writes.push({ ref, data, options: txOptions || null });
        }
      };
      await callback(txn);
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
        serverTimestamp: () => "SERVER_TIMESTAMP",
        increment: (value) => ({ __increment: value })
      }
    }
  };
}

async function runCase(name, fn) {
  await fn();
  console.log(`PASS ${name}`);
}

async function main() {
  await runCase("missing fields returns 400", async () => {
    const req = { method: "POST", body: {} };
    const res = createMockResponse();
    const { deps } = createMockDeps();

    await __test.roundSubmitHandler(req, res, deps);

    assert.equal(res.statusCode, 400);
    assert.equal(res.body.error, "missing_fields");
    assert.ok(Array.isArray(res.body.fields));
    assert.ok(res.body.fields.includes("userId"));
  });

  await runCase("very short round rejected", async () => {
    const req = {
      method: "POST",
      body: createValidPayload({ endedAtMs: 1200 })
    };
    const res = createMockResponse();
    const { deps } = createMockDeps();

    await __test.roundSubmitHandler(req, res, deps);

    assert.equal(res.statusCode, 422);
    assert.equal(res.body.accepted, false);
    assert.ok(res.body.reasons.includes("round_too_fast"));
  });

  await runCase("insufficient points rejected", async () => {
    const req = {
      method: "POST",
      body: createValidPayload({ points: [{ x: 0, y: 0 }, { x: 1, y: 0 }] })
    };
    const res = createMockResponse();
    const { deps } = createMockDeps();

    await __test.roundSubmitHandler(req, res, deps);

    assert.equal(res.statusCode, 422);
    assert.ok(res.body.reasons.includes("insufficient_points"));
  });

  await runCase("invalid coordinates rejected", async () => {
    const points = buildPolylinePoints(40);
    points[10] = { x: Number.POSITIVE_INFINITY, y: 0 };

    const req = {
      method: "POST",
      body: createValidPayload({ points })
    };
    const res = createMockResponse();
    const { deps } = createMockDeps();

    await __test.roundSubmitHandler(req, res, deps);

    assert.equal(res.statusCode, 422);
    assert.ok(res.body.reasons.includes("invalid_coordinates"));
  });

  await runCase("success path returns score payload", async () => {
    const req = { method: "POST", body: createValidPayload() };
    const res = createMockResponse();
    const { deps, writes } = createMockDeps();

    await __test.roundSubmitHandler(req, res, deps);

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.accepted, true);
    assert.equal(typeof res.body.accuracyPercent, "number");
    assert.equal(typeof res.body.xpGained, "number");
    assert.equal(typeof res.body.stars, "number");
    assert.equal(res.body.eventId, "events_generated_id");
    assert.equal(writes.length, 2);
  });

  await runCase("transaction failure returns 500", async () => {
    const req = { method: "POST", body: createValidPayload() };
    const res = createMockResponse();
    const { deps } = createMockDeps({ shouldFailTx: true });

    await __test.roundSubmitHandler(req, res, deps);

    assert.equal(res.statusCode, 500);
    assert.equal(res.body.error, "internal_error");
  });
}

main().catch((error) => {
  console.error("FAIL round_submit contract tests");
  console.error(error);
  process.exit(1);
});
