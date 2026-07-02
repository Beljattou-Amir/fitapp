function getLocalDateString(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getStartOfWeekString(date) {
  let d;
  if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
    const parts = date.split('-');
    d = new Date(parts[0], parts[1] - 1, parts[2]);
  } else {
    d = new Date(date);
  }
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Monday week start
  const start = new Date(d.setDate(diff));
  return getLocalDateString(start);
}

function extractHistory(workoutLogs, exerciseId) {
  const history = [];
  workoutLogs.forEach(log => {
    log.blocks.forEach(b => {
      b.exercises.forEach(subEx => {
        if (subEx.exerciseId === exerciseId) {
          subEx.sets.forEach(s => {
            if (s.completed) {
              history.push({
                date: log.date,
                weight: parseFloat(s.weight) || 0,
                reps: parseInt(s.reps) || 0,
                type: s.type
              });
            }
          });
        }
      });
    });
  });
  return history;
}

function calculateOneRm(history, exerciseType) {
  const nonWarmups = history.filter(h => h.type !== 'Warm-up');
  const dailyOnerm = {};

  nonWarmups.forEach(h => {
    let onerm = 0;
    if (exerciseType === 'time') {
      onerm = h.reps; // Hold time is standard metric
    } else {
      onerm = h.reps === 1 ? h.weight : (h.weight / (1.0278 - (0.0278 * h.reps)));
    }

    if (!dailyOnerm[h.date] || dailyOnerm[h.date] < onerm) {
      dailyOnerm[h.date] = Math.round(onerm * 10) / 10;
    }
  });

  const onermDates = Object.keys(dailyOnerm).sort();
  const onermVals = onermDates.map(d => dailyOnerm[d]);

  return { dates: onermDates, vals: onermVals };
}

function calculateWeeklyVolume(history) {
  const nonWarmups = history.filter(h => h.type !== 'Warm-up');
  const weeklyVolume = {};

  nonWarmups.forEach(h => {
    const weekStr = getStartOfWeekString(h.date);
    const vol = h.weight * h.reps;
    weeklyVolume[weekStr] = (weeklyVolume[weekStr] || 0) + vol;
  });

  const volumeWeeks = Object.keys(weeklyVolume).sort();
  const volumeVals = volumeWeeks.map(w => weeklyVolume[w]);

  return { weeks: volumeWeeks, vals: volumeVals };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    extractHistory,
    calculateOneRm,
    calculateWeeklyVolume
  };
} else if (typeof window !== 'undefined') {
  window.extractHistory = extractHistory;
  window.calculateOneRm = calculateOneRm;
  window.calculateWeeklyVolume = calculateWeeklyVolume;
}
