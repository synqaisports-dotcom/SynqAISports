import test from "node:test";
import assert from "node:assert/strict";
import {
  mapOperativaAssignmentsToUi,
  mapOperativaRequestsToUi,
} from "./operativa-mappers";

test("mapOperativaAssignmentsToUi mapea campos clave", () => {
  const rows = [
    {
      id: "a1",
      teamId: "team_1",
      mcc: "OCT_W2",
      session: "2",
      blockKey: "central" as const,
      exerciseKey: "ex_1",
      exerciseTitle: "Rondo 6x3",
      updatedAt: "2026-03-01T10:00:00.000Z",
    },
  ];
  const out = mapOperativaAssignmentsToUi(rows);
  assert.equal(out.length, 1);
  assert.equal(out[0].blockKey, "central");
  assert.equal(out[0].exerciseTitle, "Rondo 6x3");
  assert.equal(out[0].updatedAt, "2026-03-01T10:00:00.000Z");
});

test("mapOperativaRequestsToUi conserva estado y comentarios", () => {
  const rows = [
    {
      id: "r1",
      teamId: "team_1",
      mcc: "NOV_W1",
      session: "1",
      blockKey: "warmup" as const,
      original: "Activación básica",
      proposed: "Activación reactiva",
      reason: "Subir intensidad",
      status: "Approved" as const,
      coach: "Coach Test",
      createdAt: "2026-03-01T10:00:00.000Z",
      directorComment: "OK",
      processedAt: "2026-03-01T11:00:00.000Z",
    },
  ];
  const out = mapOperativaRequestsToUi(rows);
  assert.equal(out.length, 1);
  assert.equal(out[0].status, "Approved");
  assert.equal(out[0].directorComment, "OK");
  assert.equal(out[0].proposed, "Activación reactiva");
});
