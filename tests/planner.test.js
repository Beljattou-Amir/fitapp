const { getLocalDateString, getStartOfWeekString, getCurrentWeekDates, getRoutineColorTheme } = require('../src/planner');

describe('Planner Helpers', () => {
  describe('getLocalDateString & getStartOfWeekString', () => {
    it('should format date string correctly to YYYY-MM-DD', () => {
      const date = new Date(2026, 5, 21); // June 21, 2026 (Sunday)
      expect(getLocalDateString(date)).toBe('2026-06-21');
    });

    it('should find the Monday of the current week', () => {
      const sunday = new Date(2026, 5, 21); // June 21, 2026 (Sunday)
      const mondayStr = getStartOfWeekString(sunday);
      expect(mondayStr).toBe('2026-06-15'); // Monday of that week
    });
  });

  describe('getCurrentWeekDates', () => {
    it('should return 7 dates representing Mon-Sun of the reference week', () => {
      const refDate = new Date(2026, 5, 21); // June 21, 2026
      const weekDates = getCurrentWeekDates(refDate);
      expect(weekDates).toHaveLength(7);
      expect(getLocalDateString(weekDates[0])).toBe('2026-06-15'); // Monday
      expect(getLocalDateString(weekDates[6])).toBe('2026-06-21'); // Sunday
    });
  });

  describe('getRoutineColorTheme', () => {
    it('should match Push day keywords to Push theme', () => {
      const theme = getRoutineColorTheme('Push Power Block');
      expect(theme.name).toBe('Push Training');
      expect(theme.bg).toBe('bg-indigo-950/20');
    });

    it('should match Leg day keywords to Legs theme', () => {
      const theme = getRoutineColorTheme('Barbell Squats Legs Day');
      expect(theme.name).toBe('Legs / Lower Body');
      expect(theme.bg).toBe('bg-emerald-950/20');
    });

    it('should return a fallback theme when no keywords match', () => {
      const theme = getRoutineColorTheme('Unique Workout Routine');
      expect(theme.name).toBeDefined();
      expect(theme.bg).toBeDefined();
    });
  });
});
