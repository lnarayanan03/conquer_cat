const EMPTY_BREAKDOWN = null;

export const FRONTEND_DAY_DEFAULT = Object.freeze({
  wt: "",
  st: "",
  lc: false,
  lc_na: false,
  as: false,
  as_na: false,
  ap: false,
  ap_na: false,
  vp: false,
  vp_na: false,
  vp_count: 0,
  ph: 0,
  pm: 0,
  ah: 0,
  eh: 0,
  q: 0,
  v: 0,
  l: 0,
  sk: false,
  skm: 0,
  sks: 0,
  skd: "medium",
  vm: false,
  vmt: "",
  ca: false,
  iq: "",
  n: "",
  backlog: [],
  officeBefore10: false,
  gymDone: false,
  gymMinutes: 0,
  waterLiters: 0,
  contentPosted: false,
  editingUnder1Hr: false,
  calories: 0,
  protein: 0,
  carbs: 0,
  fat: 0,
  foodEntries: [],
  missionSectionId: "",
  missionUnitId: "",
  missionChapterId: "",
  effortScore: 0,
  effortBreakdownV2: EMPTY_BREAKDOWN,
});

function isPlainObject(value) {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function jsonClone(value, fallback) {
  try {
    return JSON.parse(JSON.stringify(value ?? fallback));
  } catch {
    return fallback;
  }
}

function hasValue(value) {
  return value !== undefined && value !== null;
}

function textOr(value, fallback = "") {
  return hasValue(value) ? String(value) : fallback;
}

function boolOr(value, fallback = false) {
  if (!hasValue(value)) return fallback;
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    const v = value.trim().toLowerCase();
    if (["true", "1", "yes", "y", "on"].includes(v)) return true;
    if (["false", "0", "no", "n", "off", ""].includes(v)) return false;
  }
  return Boolean(value);
}

function numberOr(value, fallback = 0) {
  if (value === "" || !hasValue(value)) return fallback;
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function intOr(value, fallback = 0) {
  return Math.trunc(numberOr(value, fallback));
}

function firstValue(...values) {
  return values.find(hasValue);
}

function dateKey(value) {
  if (!value) return "";
  return String(value).slice(0, 10);
}

function normalizeFoodEntryForDb(entry, index) {
  const source = isPlainObject(entry) ? entry : {};
  return {
    entry_id: textOr(source.id ?? source.entry_id ?? source.entryId ?? index),
    name: textOr(source.name),
    qty: textOr(source.qty),
    calories: numberOr(source.calories),
    protein: numberOr(source.protein),
    carbs: numberOr(source.carbs),
    fat: numberOr(source.fat),
    entry_order: index,
  };
}

function dbFoodEntryToFrontend(row) {
  return {
    id: textOr(row?.entry_id ?? row?.id),
    name: textOr(row?.name),
    qty: textOr(row?.qty),
    calories: numberOr(row?.calories),
    protein: numberOr(row?.protein),
    carbs: numberOr(row?.carbs),
    fat: numberOr(row?.fat),
  };
}

export function normalizeDayForDb(day = {}) {
  const source = isPlainObject(day) ? day : {};
  const foodEntries = Array.isArray(source.foodEntries) ? source.foodEntries : [];

  return {
    row: {
      wake_time: textOr(source.wt),
      sleep_time: textOr(source.st),
      live_class: boolOr(source.lc),
      live_class_na: boolOr(source.lc_na),
      afternoon_session: boolOr(source.as),
      afternoon_session_na: boolOr(source.as_na),
      application_class: boolOr(source.ap),
      application_class_na: boolOr(source.ap_na),
      varc_passage: boolOr(source.vp),
      varc_passage_na: boolOr(source.vp_na),
      varc_passage_count: intOr(source.vp_count),
      practice_hrs: intOr(source.ph),
      practice_mins: intOr(source.pm),
      quant: intOr(source.q),
      varc: intOr(source.v),
      lrdi: intOr(source.l),
      sudoku_done: boolOr(source.sk),
      sudoku_mins: intOr(source.skm),
      sudoku_seconds: intOr(source.sks),
      sudoku_difficulty: textOr(source.skd, "medium"),
      vedic_math_done: boolOr(source.vm),
      vedic_math_topic: textOr(source.vmt),
      cat_application_done: boolOr(source.ca),
      iq_notes: textOr(source.iq),
      notes: textOr(source.n),
      office_before_10: boolOr(source.officeBefore10),
      gym_done: boolOr(source.gymDone),
      gym_minutes: intOr(source.gymMinutes),
      water_liters: numberOr(source.waterLiters),
      content_posted: boolOr(source.contentPosted),
      editing_under_1hr: boolOr(source.editingUnder1Hr),
      calories: numberOr(source.calories),
      protein: numberOr(source.protein),
      carbs: numberOr(source.carbs),
      fat: numberOr(source.fat),
      mission_section_id: textOr(source.missionSectionId),
      mission_unit_id: textOr(source.missionUnitId),
      mission_chapter_id: textOr(source.missionChapterId),
      effort_score: intOr(source.effortScore),
      effort_breakdown_v2: source.effortBreakdownV2 ?? source.effortBreakdown ?? null,
      mock_pi: boolOr(source.mockPI),
      wat_done: boolOr(source.watDone),
      topics_revised: textOr(source.topicsRevised),
      raw_day: jsonClone(source, {}),
    },
    foodEntries: foodEntries.map(normalizeFoodEntryForDb),
  };
}

export function normalizeLegacyDayForDb(day = {}) {
  const source = isPlainObject(day) ? day : {};
  const { row } = normalizeDayForDb(source);
  return {
    quant: row.quant,
    varc: row.varc,
    lrdi: row.lrdi,
    vp_count: row.varc_passage_count,
    sudoku_done: row.sudoku_done,
    sudoku_mins: row.sudoku_mins,
    sudoku_seconds: row.sudoku_seconds,
    sudoku_difficulty: row.sudoku_difficulty,
    vedic_math_done: row.vedic_math_done,
    vedic_math_topic: row.vedic_math_topic,
    cat_application_done: row.cat_application_done,
    wake_time: row.wake_time,
    sleep_time: row.sleep_time,
    live_class: row.live_class,
    afternoon_session: row.afternoon_session,
    application_class: row.application_class,
    practice_hrs: row.practice_hrs,
    practice_mins: row.practice_mins,
    varc_passage: row.varc_passage,
    iq_notes: row.iq_notes,
    notes: row.notes,
    backlog: Array.isArray(source.backlog) ? source.backlog : [],
  };
}

export function dbRowToDay(row = {}, foodEntries = []) {
  const raw = isPlainObject(row.raw_day) ? jsonClone(row.raw_day, {}) : {};
  const day = {
    ...FRONTEND_DAY_DEFAULT,
    ...raw,
  };

  day.wt = textOr(firstValue(row.wake_time, day.wt));
  day.st = textOr(firstValue(row.sleep_time, day.st));
  day.lc = boolOr(firstValue(row.live_class, day.lc));
  day.lc_na = boolOr(firstValue(row.live_class_na, day.lc_na));
  day.as = boolOr(firstValue(row.afternoon_session, day.as));
  day.as_na = boolOr(firstValue(row.afternoon_session_na, day.as_na));
  day.ap = boolOr(firstValue(row.application_class, day.ap));
  day.ap_na = boolOr(firstValue(row.application_class_na, day.ap_na));
  day.vp = boolOr(firstValue(row.varc_passage, day.vp));
  day.vp_na = boolOr(firstValue(row.varc_passage_na, day.vp_na));
  day.vp_count = intOr(firstValue(row.varc_passage_count, row.vp_count, day.vp_count));
  day.ph = intOr(firstValue(row.practice_hrs, day.ph));
  day.pm = intOr(firstValue(row.practice_mins, day.pm));
  day.q = intOr(firstValue(row.quant, day.q));
  day.v = intOr(firstValue(row.varc, day.v));
  day.l = intOr(firstValue(row.lrdi, day.l));
  day.sk = boolOr(firstValue(row.sudoku_done, day.sk));
  day.skm = intOr(firstValue(row.sudoku_mins, day.skm));
  day.sks = intOr(firstValue(row.sudoku_seconds, day.sks));
  day.skd = textOr(firstValue(row.sudoku_difficulty, day.skd), "medium");
  day.vm = boolOr(firstValue(row.vedic_math_done, day.vm));
  day.vmt = textOr(firstValue(row.vedic_math_topic, day.vmt));
  day.ca = boolOr(firstValue(row.cat_application_done, day.ca));
  day.iq = textOr(firstValue(row.iq_notes, day.iq));
  day.n = textOr(firstValue(row.notes, day.n));
  day.officeBefore10 = boolOr(firstValue(row.office_before_10, day.officeBefore10));
  day.gymDone = boolOr(firstValue(row.gym_done, day.gymDone));
  day.gymMinutes = intOr(firstValue(row.gym_minutes, day.gymMinutes));
  day.waterLiters = numberOr(firstValue(row.water_liters, day.waterLiters));
  day.contentPosted = boolOr(firstValue(row.content_posted, day.contentPosted));
  day.editingUnder1Hr = boolOr(firstValue(row.editing_under_1hr, day.editingUnder1Hr));
  day.calories = numberOr(firstValue(row.calories, day.calories));
  day.protein = numberOr(firstValue(row.protein, day.protein));
  day.carbs = numberOr(firstValue(row.carbs, day.carbs));
  day.fat = numberOr(firstValue(row.fat, day.fat));
  day.missionSectionId = textOr(firstValue(row.mission_section_id, day.missionSectionId));
  day.missionUnitId = textOr(firstValue(row.mission_unit_id, day.missionUnitId));
  day.missionChapterId = textOr(firstValue(row.mission_chapter_id, day.missionChapterId));
  day.effortScore = intOr(firstValue(row.effort_score, day.effortScore));
  day.effortBreakdownV2 = firstValue(row.effort_breakdown_v2, day.effortBreakdownV2) ?? null;
  day.mockPI = boolOr(firstValue(row.mock_pi, day.mockPI));
  day.watDone = boolOr(firstValue(row.wat_done, day.watDone));
  day.topicsRevised = textOr(firstValue(row.topics_revised, day.topicsRevised));
  day.backlog = Array.isArray(day.backlog) ? day.backlog : [];

  const dbFood = Array.isArray(foodEntries) ? foodEntries : [];
  day.foodEntries = dbFood.length > 0
    ? dbFood.map(dbFoodEntryToFrontend)
    : (Array.isArray(day.foodEntries) ? day.foodEntries : []);

  return day;
}

export function isSchemaCompatibilityError(error) {
  const code = error?.code || "";
  const msg = String(error?.message || error || "").toLowerCase();
  return code === "PGRST204" ||
    code === "42703" ||
    code === "42P01" ||
    msg.includes("schema cache") ||
    msg.includes("column") ||
    msg.includes("relation") ||
    msg.includes("does not exist");
}

async function upsertLegacyDailyLog({ supabase, userId, date, day }) {
  const legacyRow = {
    user_id: userId,
    log_date: date,
    ...normalizeLegacyDayForDb(day),
  };

  const { error } = await supabase
    .from("daily_logs")
    .upsert(legacyRow, { onConflict: "user_id,log_date" });

  if (error) throw error;
  return { ok: true, legacyFallback: true, foodPersisted: false };
}

async function replaceFoodEntries({ supabase, userId, dailyLogId, foodEntries }) {
  if (!dailyLogId) return { foodPersisted: false };

  const deleteResult = await supabase
    .from("daily_food_entries")
    .delete()
    .eq("daily_log_id", dailyLogId);

  if (deleteResult.error) {
    if (isSchemaCompatibilityError(deleteResult.error)) return { foodPersisted: false };
    throw deleteResult.error;
  }

  if (!foodEntries.length) return { foodPersisted: true };

  const rows = foodEntries.map(entry => ({
    ...entry,
    user_id: userId,
    daily_log_id: dailyLogId,
  }));

  const insertResult = await supabase
    .from("daily_food_entries")
    .insert(rows);

  if (insertResult.error) {
    if (isSchemaCompatibilityError(insertResult.error)) return { foodPersisted: false };
    throw insertResult.error;
  }

  return { foodPersisted: true };
}

export async function upsertDailyLogWithFood({ supabase, userId, date, day }) {
  if (!supabase) return { ok: true, skipped: "supabase_not_configured" };
  if (!userId || !date) throw new Error("userId and date are required");

  const { row, foodEntries } = normalizeDayForDb(day);
  const now = new Date().toISOString();

  const payload = {
    user_id: userId,
    log_date: date,
    ...row,
    updated_at: now,
  };

  const result = await supabase
    .from("daily_logs")
    .upsert(payload, { onConflict: "user_id,log_date" })
    .select("id")
    .maybeSingle();

  if (result.error) {
    if (isSchemaCompatibilityError(result.error)) {
      return upsertLegacyDailyLog({ supabase, userId, date, day });
    }
    throw result.error;
  }

  const foodResult = await replaceFoodEntries({
    supabase,
    userId,
    dailyLogId: result.data?.id,
    foodEntries,
  });

  return {
    ok: true,
    dailyLogId: result.data?.id || null,
    ...foodResult,
  };
}

export async function fetchDailyLogsForUser({ supabase, userId }) {
  if (!supabase) return {};
  if (!userId) throw new Error("userId is required");

  const { data: rows, error } = await supabase
    .from("daily_logs")
    .select("*")
    .eq("user_id", userId)
    .order("log_date", { ascending: true });

  if (error) throw error;

  const safeRows = rows || [];
  const ids = safeRows.map(row => row.id).filter(Boolean);
  const foodByDailyLogId = new Map();

  if (ids.length > 0) {
    const foodResult = await supabase
      .from("daily_food_entries")
      .select("*")
      .in("daily_log_id", ids)
      .order("entry_order", { ascending: true });

    if (foodResult.error && !isSchemaCompatibilityError(foodResult.error)) {
      throw foodResult.error;
    }

    for (const entry of foodResult.data || []) {
      const list = foodByDailyLogId.get(entry.daily_log_id) || [];
      list.push(entry);
      foodByDailyLogId.set(entry.daily_log_id, list);
    }
  }

  return safeRows.reduce((acc, row) => {
    const key = dateKey(row.log_date);
    if (!key) return acc;
    acc[key] = dbRowToDay(row, foodByDailyLogId.get(row.id) || []);
    return acc;
  }, {});
}

