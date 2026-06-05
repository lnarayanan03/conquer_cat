export const ASSESSMENT_TOPICS = ["quant", "varc", "lrdi"];

export const DAILY_TOPIC_COUNTS = {
  quant: 2,
  varc: 2,
  lrdi: 2,
};

export const WEEKLY_TOPIC_COUNTS = {
  quant: 5,
  varc: 5,
  lrdi: 5,
};

export const ASSESSMENT_TOPIC_COUNTS = {
  daily: DAILY_TOPIC_COUNTS,
  weekly: WEEKLY_TOPIC_COUNTS,
};

export function getAssessmentTopicCounts(type = "daily") {
  return ASSESSMENT_TOPIC_COUNTS[type] || ASSESSMENT_TOPIC_COUNTS.daily;
}

export function getAssessmentQuestionCount(type = "daily") {
  return Object.values(getAssessmentTopicCounts(type)).reduce((sum, count) => sum + count, 0);
}
