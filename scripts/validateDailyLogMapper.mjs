import assert from "node:assert/strict";
import {
  dbRowToDay,
  FRONTEND_DAY_DEFAULT,
  normalizeDayForDb,
} from "../server/mappers/conquerDailyLogMapper.js";

const fullDay = {
  ...FRONTEND_DAY_DEFAULT,
  wt: "06:30",
  st: "01:10",
  lc: true,
  lc_na: false,
  as: true,
  as_na: false,
  ap: false,
  ap_na: true,
  vp: true,
  vp_na: false,
  vp_count: 2,
  ph: 3,
  pm: 20,
  q: 18,
  v: 7,
  l: 6,
  sk: true,
  skm: 8,
  sks: 45,
  skd: "hard",
  vm: true,
  vmt: "Nikhilam",
  ca: true,
  iq: "Class note",
  n: "Journal note",
  officeBefore10: true,
  gymDone: true,
  gymMinutes: 45,
  waterLiters: 3.5,
  contentPosted: true,
  editingUnder1Hr: true,
  calories: 2100,
  protein: 120,
  carbs: 240,
  fat: 70,
  foodEntries: [
    { id: "meal-1", name: "Oats", qty: "1 bowl", calories: 300, protein: 12, carbs: 52, fat: 5 },
    { id: "meal-2", name: "Paneer", qty: "150g", calories: 420, protein: 32, carbs: 8, fat: 28 },
  ],
  missionSectionId: "quant",
  missionUnitId: "quant-number-system",
  missionChapterId: "quant-number-system-classification-of-numbers",
  effortScore: 84,
  effortBreakdownV2: { learn: 25, practice: 20, errorLog: 10, discipline: 29 },
  mockPI: true,
  watDone: false,
  topicsRevised: "Acads and current affairs",
  customUnknownField: "preserve me",
};

const { row, foodEntries } = normalizeDayForDb(fullDay);

assert.equal(row.wake_time, fullDay.wt);
assert.equal(row.sleep_time, fullDay.st);
assert.equal(row.live_class, true);
assert.equal(row.live_class_na, false);
assert.equal(row.afternoon_session, true);
assert.equal(row.application_class_na, true);
assert.equal(row.varc_passage_count, 2);
assert.equal(row.practice_hrs, 3);
assert.equal(row.practice_mins, 20);
assert.equal(row.quant, 18);
assert.equal(row.varc, 7);
assert.equal(row.lrdi, 6);
assert.equal(row.office_before_10, true);
assert.equal(row.gym_minutes, 45);
assert.equal(row.water_liters, 3.5);
assert.equal(row.mission_chapter_id, fullDay.missionChapterId);
assert.deepEqual(row.effort_breakdown_v2, fullDay.effortBreakdownV2);
assert.equal(row.raw_day.customUnknownField, "preserve me");
assert.equal(foodEntries.length, 2);
assert.equal(foodEntries[0].entry_id, "meal-1");

const mappedBack = dbRowToDay({
  id: "daily-1",
  log_date: "2026-06-27",
  ...row,
}, foodEntries.map(entry => ({ id: `db-${entry.entry_id}`, ...entry })));

assert.equal(mappedBack.wt, fullDay.wt);
assert.equal(mappedBack.vp_count, 2);
assert.equal(mappedBack.q, 18);
assert.equal(mappedBack.officeBefore10, true);
assert.equal(mappedBack.missionChapterId, fullDay.missionChapterId);
assert.deepEqual(mappedBack.effortBreakdownV2, fullDay.effortBreakdownV2);
assert.equal(mappedBack.customUnknownField, "preserve me");
assert.equal(mappedBack.foodEntries.length, 2);
assert.equal(mappedBack.foodEntries[1].name, "Paneer");

const sparse = normalizeDayForDb({ q: 5, n: "old sparse payload", anotherUnknown: 12 });
assert.equal(sparse.row.quant, 5);
assert.equal(sparse.row.notes, "old sparse payload");
assert.equal(sparse.row.live_class, false);
assert.equal(sparse.row.raw_day.anotherUnknown, 12);

const legacyDbDay = dbRowToDay({
  quant: 3,
  varc: 2,
  lrdi: 1,
  vp_count: 4,
  wake_time: "07:00",
  raw_day: { legacyOnly: "still here" },
}, []);
assert.equal(legacyDbDay.q, 3);
assert.equal(legacyDbDay.vp_count, 4);
assert.equal(legacyDbDay.legacyOnly, "still here");
assert.deepEqual(legacyDbDay.foodEntries, []);

console.log("Daily log mapper validation passed.");

