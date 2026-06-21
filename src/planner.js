/**
 * Formats a Date object into a YYYY-MM-DD local date string.
 * @param {Date} date - The date to format.
 * @returns {string} The formatted date string (e.g. "2026-06-21").
 */
function getLocalDateString(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Calculates the local date string of the Monday of the week for a given reference date.
 * @param {Date} date - The reference date.
 * @returns {string} The formatted YYYY-MM-DD string of Monday of that week.
 */
function getStartOfWeekString(date) {
  const d = new Date(date);
  const day = d.getDay();
  // Adjust for Monday being the start of the week (1 = Monday, 0 = Sunday -> shift back 6)
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const start = new Date(d.setDate(diff));
  return getLocalDateString(start);
}

/**
 * Generates an array of Date objects representing the 7 days of the week starting from Monday,
 * relative to the provided reference date.
 * @param {Date} [referenceDate=new Date()] - The reference date.
 * @returns {Date[]} Array containing 7 Date objects (Monday to Sunday).
 */
function getCurrentWeekDates(referenceDate = new Date()) {
  const dates = [];
  const mondayStr = getStartOfWeekString(referenceDate);
  const monday = new Date(mondayStr);
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    dates.push(d);
  }
  return dates;
}

/**
 * Returns a styling theme (background, border, text colors, and name label)
 * based on the routine's name keywords to visually categorize training blocks.
 * @param {string} name - The name of the routine.
 * @returns {Object} The styling theme object.
 */
function getRoutineColorTheme(name) {
  const lower = name.toLowerCase();
  
  // Categorize by Chest/Push movements
  if (lower.includes('push') || lower.includes('chest') || lower.includes('press')) {
    return {
      name: 'Push Training',
      bg: 'bg-indigo-950/20',
      border: 'border-indigo-500/20 hover:border-indigo-500/40',
      text: 'text-indigo-400'
    };
  }
  // Categorize by Back/Pull movements
  if (lower.includes('pull') || lower.includes('back') || lower.includes('row')) {
    return {
      name: 'Pull Training',
      bg: 'bg-purple-950/20',
      border: 'border-purple-500/20 hover:border-purple-500/40',
      text: 'text-purple-400'
    };
  }
  // Categorize by Legs/Lower body movements
  if (lower.includes('leg') || lower.includes('squat') || lower.includes('quad') || lower.includes('lower')) {
    return {
      name: 'Legs / Lower Body',
      bg: 'bg-emerald-950/20',
      border: 'border-emerald-500/20 hover:border-emerald-500/40',
      text: 'text-emerald-400'
    };
  }
  // Categorize by Core/Abdominal movements
  if (lower.includes('core') || lower.includes('abs') || lower.includes('plank')) {
    return {
      name: 'Core / Abs',
      bg: 'bg-teal-950/20',
      border: 'border-teal-500/20 hover:border-teal-500/40',
      text: 'text-teal-400'
    };
  }
  // Categorize by Cardio/HIIT movements
  if (lower.includes('cardio') || lower.includes('run') || lower.includes('hiit')) {
    return {
      name: 'Cardio / Endurance',
      bg: 'bg-amber-950/20',
      border: 'border-amber-500/20 hover:border-amber-500/40',
      text: 'text-amber-400'
    };
  }
  
  // Fallback: Generate custom color theme based on a simple hash of the routine name
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % 4;
  const themes = [
    { name: 'Strength Block', bg: 'bg-gray-900/60', border: 'border-gray-800 hover:border-gray-700', text: 'text-gray-400' },
    { name: 'Athletic Block', bg: 'bg-sky-950/20', border: 'border-sky-500/20 hover:border-sky-500/40', text: 'text-sky-400' },
    { name: 'Fitness Block', bg: 'bg-rose-950/20', border: 'border-rose-500/20 hover:border-rose-500/40', text: 'text-rose-400' },
    { name: 'Conditioning Block', bg: 'bg-orange-950/20', border: 'border-orange-500/20 hover:border-orange-500/40', text: 'text-orange-400' }
  ];
  return themes[index];
}

// Export for Node environments (Jest tests) or hook into window for the browser
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    getLocalDateString,
    getStartOfWeekString,
    getCurrentWeekDates,
    getRoutineColorTheme
  };
} else if (typeof window !== 'undefined') {
  window.getCurrentWeekDates = getCurrentWeekDates;
  window.getRoutineColorTheme = getRoutineColorTheme;
}
