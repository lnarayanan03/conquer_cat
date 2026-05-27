export const effortScore = (day, backlogVideos = day?.backlog || [], backlogConcepts = []) => {
  const q = Math.min((+day.q||0)/10, 1) * 18;
  const v = Math.min((+day.v||0)/5, 1) * 12;
  const l = Math.min((+day.l||0)/5, 1) * 12;
  const vp = Math.min((+day.vp_count||0)/1, 1) * 8;
  // N/A sessions count as done for score (not penalised, not rewarded)
  const sessionMins =
    ((day.lc || day.lc_na) ? 120 : 0) +
    ((day.as || day.as_na) ? 40 : 0) +
    ((day.ap || day.ap_na) ? 120 : 0) +
    ((day.vp || day.vp_na) ? 20 : 0) +
    ((+day.ph||0)*60) + (+day.pm||0);
  const hrs = Math.min(sessionMins / 300, 1) * 16;
  const lc = ((day.lc || day.lc_na) ? 1 : 0) * 8;
  const passage = ((day.vp || day.vp_na) ? 1 : 0) * 4;
  const sleepScore = (() => {
    if (!day.wt || !day.st) return 0;
    const [wh, wm] = day.wt.split(":").map(Number);
    const [sh, sm] = day.st.split(":").map(Number);
    let wakeMins = wh * 60 + wm;
    let sleepMins = sh * 60 + sm;
    if (wakeMins <= sleepMins) wakeMins += 24 * 60;
    const duration = (wakeMins - sleepMins) / 60;
    if (duration >= 4 && duration <= 6) return 8;
    if (duration >= 3.5 && duration < 4) return 5;
    if (duration > 6 && duration <= 7) return 5;
    if (duration >= 3 && duration < 3.5) return 2;
    return 0;
  })();
  const backlogScore = (() => {
    const allItems = [...(backlogVideos || []), ...(backlogConcepts || [])];
    if (allItems.length === 0) return 0;
    const checked = allItems.filter(item => item.checked).length;
    return Math.round((checked / allItems.length) * 10);
  })();
  const sudokuScore = day.sk ? 2 : 0;
  const vedicScore = day.vm ? 2 : 0;
  const catApplicationScore = day.ca ? 1 : 0;
  return Math.min(100, Math.round(q + v + l + vp + hrs + lc + passage + sleepScore + backlogScore + sudokuScore + vedicScore + catApplicationScore));
};

export function calcMinPercentile(category) {
  const cutoffs = {
    "General": { oldIIM: 99.5, babyIIM: 97.0, newIIM: 95.0 },
    "OBC-NCL": { oldIIM: 97.0, babyIIM: 92.0, newIIM: 88.0 },
    "SC": { oldIIM: 90.0, babyIIM: 85.0, newIIM: 80.0 },
    "ST": { oldIIM: 85.0, babyIIM: 75.0, newIIM: 70.0 },
    "EWS": { oldIIM: 98.0, babyIIM: 95.0, newIIM: 92.0 },
    "PWD": { oldIIM: 80.0, babyIIM: 72.0, newIIM: 65.0 },
  };
  return cutoffs[category] || cutoffs["General"];
}

export function calcIIMProfile({
  category,
  gender,
  primaryDegree,
  secondaryDegrees,
  workExpYears,
  workExpMonths,
}) {
  const engDegrees = ["B.Tech", "B.E.", "B.Sc (Engg)", "B.Sc Engineering"];
  const isEngineer = engDegrees.some(d => primaryDegree?.type?.includes(d));
  const isFemale = gender === "female";
  const totalWorkMonths = ((+workExpYears || 0) * 12) + (+workExpMonths || 0);

  const pgTypes = ["MBA", "M.Tech", "MS", "M.Sc", "MA", "M.Com", "M.Phil", "LLM", "MCA"];
  const hasMasters = secondaryDegrees?.some(d =>
    typeof d === "string"
      ? pgTypes.some(pg => d.includes(pg))
      : pgTypes.some(pg => d?.degree?.includes(pg) || d?.text?.includes(pg))
  );

  const rawGPA = parseFloat(primaryDegree?.gpa);
  const gpaScale = primaryDegree?.gpaScale || "percentage";
  let gradPct = NaN;
  if (!isNaN(rawGPA)) {
    if (gpaScale === "10") gradPct = rawGPA * 10;
    else if (gpaScale === "4") gradPct = (rawGPA / 4) * 100;
    else gradPct = rawGPA;
  }

  const categoryBase = {
    "General": { ABC: 99.0, KLIS: 97.5, newIIM: 94.0 },
    "OBC-NCL": { ABC: 96.5, KLIS: 93.0, newIIM: 88.5 },
    "EWS": { ABC: 97.5, KLIS: 95.0, newIIM: 91.0 },
    "SC": { ABC: 90.0, KLIS: 85.0, newIIM: 78.0 },
    "ST": { ABC: 83.0, KLIS: 77.0, newIIM: 66.0 },
    "PWD": { ABC: 76.0, KLIS: 68.0, newIIM: 58.0 },
  };
  const base = categoryBase[category] || categoryBase["General"];
  let adjustment = 0;

  if (category === "General") {
    if (isEngineer && !isFemale) adjustment += 0.65;
    else if (isEngineer && isFemale) adjustment -= 0.8;
    else if (!isEngineer && !isFemale) adjustment -= 0.5;
    else adjustment -= 2.0;
  } else if (category === "OBC-NCL") {
    if (!isEngineer) adjustment -= 3.0;
    if (isFemale) adjustment -= 0.5;
  }

  if (totalWorkMonths >= 36) adjustment -= 1.2;
  else if (totalWorkMonths >= 24) adjustment -= 1.0;
  else if (totalWorkMonths >= 12) adjustment -= 0.6;
  else if (totalWorkMonths >= 6) adjustment -= 0.3;

  if (hasMasters) adjustment -= 0.4;

  if (!isNaN(gradPct)) {
    if (gradPct >= 85) adjustment -= 0.5;
    else if (gradPct >= 75) adjustment -= 0.2;
    else if (gradPct < 55) adjustment += 0.8;
    else if (gradPct < 60) adjustment += 0.5;
  }

  const adjustedCutoffs = {
    ABC: Math.min(99.9, Math.max(75, base.ABC + adjustment)),
    KLIS: Math.min(99.5, Math.max(70, base.KLIS + adjustment)),
    newIIM: Math.min(98, Math.max(60, base.newIIM + adjustment)),
  };

  let profileScore = 50;

  if (totalWorkMonths >= 36) profileScore += 18;
  else if (totalWorkMonths >= 24) profileScore += 14;
  else if (totalWorkMonths >= 12) profileScore += 9;
  else if (totalWorkMonths >= 6) profileScore += 5;
  else profileScore -= 5;

  if (!isNaN(gradPct)) {
    if (gradPct >= 85) profileScore += 12;
    else if (gradPct >= 75) profileScore += 6;
    else if (gradPct >= 65) profileScore += 2;
    else profileScore -= 4;
  }

  if (hasMasters) profileScore += 8;
  if (isFemale) profileScore += 6;
  if (!isEngineer) profileScore += 4;

  const college = (primaryDegree?.college || "").toLowerCase();
  const tier1 = ["iit", "bits pilani", "nit", "srcc", "st. xavier", "lady shri ram", "miranda", "hindu college", "presidency", "christ university", "loyola"];
  if (tier1.some(k => college.includes(k))) profileScore += 8;

  profileScore = Math.min(100, Math.max(5, profileScore));

  const baseConversion = { ABC: 0.36, KLIS: 0.45, newIIM: 0.56 };
  const profileBonus = (profileScore - 50) / 150;
  const interviewProb = {
    ABC: Math.min(0.82, Math.max(0.12, baseConversion.ABC + profileBonus)),
    KLIS: Math.min(0.88, Math.max(0.18, baseConversion.KLIS + profileBonus)),
    newIIM: Math.min(0.92, Math.max(0.25, baseConversion.newIIM + profileBonus)),
  };

  return {
    adjustedCutoffs,
    profileScore,
    interviewProb,
    isGEM: isEngineer && !isFemale && category === "General",
    hasMasters,
    totalWorkMonths,
    gradPct: isNaN(gradPct) ? null : gradPct,
    adjustmentSummary: {
      gemPenalty: isEngineer && !isFemale && category === "General" ? +0.65 : 0,
      femaleDiversity: isFemale ? (category === "OBC-NCL" ? -0.5 : -0.8) : 0,
      nonEngineerDiversity: !isEngineer ? (category === "OBC-NCL" ? -3.0 : -0.5) : 0,
      workEx: totalWorkMonths >= 24 ? -1.0
        : totalWorkMonths >= 12 ? -0.6
          : totalWorkMonths >= 6 ? -0.3 : 0,
      mastersDegree: hasMasters ? -0.4 : 0,
      academics: !isNaN(gradPct) && gradPct >= 85 ? -0.5
        : !isNaN(gradPct) && gradPct < 60 ? +0.5 : 0,
    },
  };
}
