const fs = require("node:fs");
const path = require("node:path");
const {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds
} = require("@firebase/rules-unit-testing");

const PROJECT_ID = "precision-arena-test";

async function run() {
  const rules = fs.readFileSync(path.resolve(__dirname, "../../firestore.rules"), "utf8");
  const testEnv = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: { rules }
  });

  try {
    await testUsersOwnerReadAndUpdate(testEnv);
    await testUsersNonOwnerAccessDenied(testEnv);
    await testEventsWriteDenied(testEnv);
    console.log("PASS firestore.rules tests");
  } finally {
    await testEnv.cleanup();
  }
}

async function testUsersOwnerReadAndUpdate(testEnv) {
  await testEnv.withSecurityRulesDisabled(async (context) => {
    await context
      .firestore()
      .collection("users")
      .doc("user_1")
      .set({
        totals: { xp: 10, stars: 2 },
        lastSessionId: "session-1",
        updatedAt: 1000,
        rank: "bronze"
      });
  });

  const ownerDb = testEnv.authenticatedContext("user_1").firestore();
  const ownerRef = ownerDb.collection("users").doc("user_1");

  await assertSucceeds(ownerRef.get());

  // Allowed updates are restricted to this key set by security rules.
  await assertSucceeds(
    ownerRef.update({
      totals: { xp: 42, stars: 3 },
      updatedAt: 2000
    })
  );

  await assertFails(ownerRef.update({ rank: "silver" }));
}

async function testUsersNonOwnerAccessDenied(testEnv) {
  const intruderDb = testEnv.authenticatedContext("user_2").firestore();
  const victimRef = intruderDb.collection("users").doc("user_1");

  await assertFails(victimRef.get());
  await assertFails(victimRef.update({ updatedAt: 3000 }));
}

async function testEventsWriteDenied(testEnv) {
  const userDb = testEnv.authenticatedContext("user_1").firestore();
  const eventRef = userDb.collection("events").doc("evt_1");

  await assertFails(
    eventRef.set({
      userId: "user_1",
      type: "round_completed",
      createdAt: 1111
    })
  );
}

run().catch((error) => {
  console.error("FAIL firestore.rules tests");
  console.error(error);
  process.exit(1);
});
