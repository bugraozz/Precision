const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { minimumRequiredPoints, preprocessStroke, scoreRound } = require("../../dist/index");
const { __test } = require("../src/index");

const TOLERANCE = 0.01;

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

function createMockDeps() {
  return {
    firestore: {
      collection(name) {
        return {
          doc(id) {
            const docId = id || `${name}_fixture_event`;
            return { id: docId, path: `${name}/${docId}` };
          }
        };
      },
      async runTransaction(callback) {
        const txn = {
          async get() {
            return {
              exists: false,
              data() {
                return {};
              }
            };
          },
          set() {}
        };
        await callback(txn);
      }
    },
    logger: {
      warn() {},
      error() {}
    },
    fieldValue: {
      serverTimestamp: () => "SERVER_TIMESTAMP",
      increment: (value) => ({ __increment: value })
    }
  };
}

function createPayloadFromFixture(fixture) {
  return {
    userId: "consistency_user",
    sessionId: `session_${fixture.name}`,
    gameMode: "classic",
    targetShape: fixture.targetShape,
    points: fixture.points,
    timeLimitMs: fixture.timeLimitMs,
    startedAtMs: fixture.startedAtMs,
    endedAtMs: fixture.endedAtMs,
    difficulty: fixture.difficulty,
    streakBonus: fixture.streakBonus
  };
}

function loadFixtures() {
  const fixturePath = path.resolve(__dirname, "fixtures/score-fixtures.json");
  return JSON.parse(fs.readFileSync(fixturePath, "utf8"));
}

function writeReport(results, maxDrift) {
  const lines = [
    "# Score Consistency Report",
    "",
    `Date: ${new Date().toISOString()}`,
    "Source: local `scoreRound` vs function `roundSubmitHandler` response",
    `Tolerance: ${TOLERANCE}`,
    `Max drift observed: ${maxDrift.toFixed(4)}`,
    "",
    "| Fixture | Accuracy drift | XP drift | Stars drift | Status |",
    "| --- | --- | --- | --- | --- |"
  ];

  for (const item of results) {
    lines.push(
      `| ${item.name} | ${item.accuracyDrift.toFixed(4)} | ${item.xpDrift.toFixed(4)} | ${item.starsDrift.toFixed(4)} | ${item.status} |`
    );
  }

  const reportPath = path.resolve(__dirname, "../../docs/score-consistency-report.md");
  fs.writeFileSync(reportPath, `${lines.join("\n")}\n`, "utf8");
}

async function main() {
  const fixtures = loadFixtures();
  const deps = createMockDeps();
  const results = [];
  let maxDrift = 0;

  for (const fixture of fixtures) {
    const payload = createPayloadFromFixture(fixture);
    const processedPoints = preprocessStroke(payload.points, {
      smoothingWindow: 2,
      minDistance: 1.5,
      minPoints: minimumRequiredPoints(payload.timeLimitMs)
    });
    const local = scoreRound(processedPoints, payload.targetShape, payload.difficulty, payload.streakBonus);

    const req = { method: "POST", body: payload };
    const res = createMockResponse();
    await __test.roundSubmitHandler(req, res, deps);

    assert.equal(res.statusCode, 200, `Fixture ${fixture.name} expected HTTP 200`);

    const accuracyDrift = Math.abs(local.accuracyPercent - res.body.accuracyPercent);
    const xpDrift = Math.abs(local.xpGained - res.body.xpGained);
    const starsDrift = Math.abs(local.stars - res.body.stars);

    maxDrift = Math.max(maxDrift, accuracyDrift, xpDrift, starsDrift);

    assert.ok(accuracyDrift <= TOLERANCE, `${fixture.name} accuracy drift ${accuracyDrift}`);
    assert.ok(xpDrift <= TOLERANCE, `${fixture.name} xp drift ${xpDrift}`);
    assert.ok(starsDrift <= TOLERANCE, `${fixture.name} stars drift ${starsDrift}`);

    results.push({
      name: fixture.name,
      accuracyDrift,
      xpDrift,
      starsDrift,
      status: "pass"
    });

    console.log(`PASS consistency fixture: ${fixture.name}`);
  }

  writeReport(results, maxDrift);
  console.log(`PASS score consistency tests (max drift ${maxDrift.toFixed(4)})`);
}

main().catch((error) => {
  console.error("FAIL score consistency tests");
  console.error(error);
  process.exit(1);
});
