const { extractHistory, calculateOneRm, calculateWeeklyVolume } = require('../src/analytics');

describe('Analytics Calculations', () => {
  const mockWorkoutLogs = [
    {
      date: '2023-10-01',
      blocks: [
        {
          exercises: [
            {
              exerciseId: 'ex1',
              sets: [
                { completed: true, type: 'Normal', weight: '100', reps: '5' },
                { completed: true, type: 'Warm-up', weight: '50', reps: '10' },
                { completed: false, type: 'Normal', weight: '100', reps: '5' }
              ]
            },
            {
              exerciseId: 'ex2',
              sets: [
                { completed: true, type: 'Normal', weight: '200', reps: '3' }
              ]
            }
          ]
        }
      ]
    },
    {
      date: '2023-10-08',
      blocks: [
        {
          exercises: [
            {
              exerciseId: 'ex1',
              sets: [
                { completed: true, type: 'Normal', weight: '105', reps: '5' },
              ]
            }
          ]
        }
      ]
    }
  ];

  it('extractHistory should correctly extract completed sets for a given exercise', () => {
    const history = extractHistory(mockWorkoutLogs, 'ex1');
    expect(history).toHaveLength(3);
    expect(history[0]).toEqual({ date: '2023-10-01', weight: 100, reps: 5, type: 'Normal' });
    expect(history[1]).toEqual({ date: '2023-10-01', weight: 50, reps: 10, type: 'Warm-up' });
    expect(history[2]).toEqual({ date: '2023-10-08', weight: 105, reps: 5, type: 'Normal' });
  });

  it('calculateOneRm should calculate 1RM correctly for normal exercises', () => {
    const history = extractHistory(mockWorkoutLogs, 'ex1');
    const onerm = calculateOneRm(history, 'normal');

    expect(onerm.dates).toEqual(['2023-10-01', '2023-10-08']);
    // Brzycki: 100 / (1.0278 - (0.0278 * 5)) = 112.5
    // Brzycki: 105 / (1.0278 - (0.0278 * 5)) = 118.1
    expect(onerm.vals).toEqual([112.5, 118.1]);
  });

  it('calculateOneRm should return max reps for time exercises', () => {
    const timeLogs = [{
      date: '2023-10-01',
      blocks: [{ exercises: [{ exerciseId: 'time_ex', sets: [{ completed: true, type: 'Normal', weight: '0', reps: '60' }] }] }]
    }];
    const history = extractHistory(timeLogs, 'time_ex');
    const onerm = calculateOneRm(history, 'time');

    expect(onerm.vals).toEqual([60]);
  });

  it('calculateWeeklyVolume should calculate total volume correctly', () => {
    const history = extractHistory(mockWorkoutLogs, 'ex1');
    const volume = calculateWeeklyVolume(history);

    // 2023-10-01 is Sunday, so Monday start is 2023-09-25
    // 2023-10-08 is Sunday, so Monday start is 2023-10-02
    expect(volume.weeks).toEqual(['2023-09-25', '2023-10-02']);

    // 100 * 5 = 500 (ignores warm-up)
    // 105 * 5 = 525
    expect(volume.vals).toEqual([500, 525]);
  });
});
