const assert = require("node:assert/strict");
const { __test } = require("../src/index");

function deepMerge(base, patch) {
  const output = { ...(base || {}) };
  for (const [key, value] of Object.entries(patch || {})) {
    if (
      value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      output[key] &&
      typeof output[key] === "object" &&
      !Array.isArray(output[key])
    ) {
      output[key] = deepMerge(output[key], value);
    } else {
      output[key] = value;
    }
  }
  return output;
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

function createMockDeps(initialUsers = {}) {
  const users = { ...initialUsers };

  const firestore = {
    collection(name) {
      return {
        doc(id) {
          return { id: id || `${name}_generated_id`, path: `${name}/${id || `${name}_generated_id`}` };
        }
      };
    },
    async runTransaction(callback) {
      const txn = {
        async get(ref) {
          const existing = users[ref.id];
          return {
            exists: Boolean(existing),
            data() {
              return existing;
            }
          };
        },
        set(ref, data, options) {
          if (options && options.merge) {
            users[ref.id] = deepMerge(users[ref.id] || {}, data);
            return;
          }
          users[ref.id] = data;
        }
      };

      await callback(txn);
    }
  };

  return {
    users,
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
  const todayKey = new Date().toISOString().slice(0, 10);
  const dailyDefs = __test.getQuestDefsForBoard("daily", todayKey);
  const dailyTwoPlusQuest = dailyDefs.find((q) => q.type === "two_plus_stars_levels") || dailyDefs[0];
  const dailyClaimableQuest = dailyDefs.find((q) => q.type === "rounds" || q.type === "stars" || q.type === "xp") || dailyDefs[0];

  await runCase("quest claim missing fields returns 400", async () => {
    const req = { method: "POST", body: {} };
    const res = createMockResponse();
    const { deps } = createMockDeps();

    await __test.questClaimHandler(req, res, deps);

    assert.equal(res.statusCode, 400);
    assert.equal(res.body.error, "missing_fields");
  });

  await runCase("quest claim returns 422 when quest not completed", async () => {
    const req = {
      method: "POST",
      body: { userId: "u1", boardType: "daily", questId: dailyTwoPlusQuest.id }
    };
    const res = createMockResponse();
    const { deps } = createMockDeps({
      u1: {
        progression: {
          daily: {
            key: todayKey,
            rounds: 1,
            stars: 0,
            xp: 0,
            twoPlusStarRounds: 1,
            bossAttempts: 0,
            ladderPoints: 0,
            highAccuracyRounds: 0,
            shapeTrackRounds: { circle: 0, curve: 0, corner: 0, memory: 0 },
            claimedQuestIds: []
          }
        }
      }
    });

    await __test.questClaimHandler(req, res, deps);

    assert.equal(res.statusCode, 422);
    assert.equal(res.body.reason, "quest_not_completed");
  });

  await runCase("quest claim success then duplicate returns 409", async () => {
    const req = {
      method: "POST",
      body: { userId: "u2", boardType: "daily", questId: dailyClaimableQuest.id }
    };
    const res1 = createMockResponse();
    const res2 = createMockResponse();
    const { deps } = createMockDeps({
      u2: {
        progression: {
          coins: 10,
          daily: {
            key: todayKey,
            rounds: 4,
            stars: 20,
            xp: 2200,
            twoPlusStarRounds: 3,
            bossAttempts: 1,
            ladderPoints: 90,
            highAccuracyRounds: 2,
            shapeTrackRounds: { circle: 2, curve: 1, corner: 1, memory: 0 },
            claimedQuestIds: []
          }
        }
      }
    });

    await __test.questClaimHandler(req, res1, deps);
    await __test.questClaimHandler(req, res2, deps);

    assert.equal(res1.statusCode, 200);
    assert.equal(res1.body.accepted, true);
    assert.equal(typeof res1.body.coinsBalance, "number");
    assert.equal(res2.statusCode, 409);
    assert.equal(res2.body.reason, "already_claimed");
  });

}

main().catch((error) => {
  console.error("FAIL claim contract tests");
  console.error(error);
  process.exit(1);
});
