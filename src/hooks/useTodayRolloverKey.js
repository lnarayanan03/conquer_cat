import { useEffect, useState } from "react";

const toLocalDateKey = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const todayKey = () => toLocalDateKey(new Date());

function msUntilNextLocalMidnight() {
  const now = new Date();
  const next = new Date(now);
  next.setDate(next.getDate() + 1);
  next.setHours(0, 0, 0, 0);
  return Math.max(1000, next - now);
}

export function useTodayRolloverKey() {
  const [key, setKey] = useState(() => todayKey());

  useEffect(() => {
    let timer;
    const schedule = () => {
      timer = window.setTimeout(() => {
        setKey(todayKey());
        schedule();
      }, msUntilNextLocalMidnight());
    };
    schedule();
    return () => window.clearTimeout(timer);
  }, []);

  return key;
}
