-- Insert Default Exercises (user_id IS NULL makes them visible to everyone)
INSERT INTO public.exercises (id, user_id, name, logging_type, is_bodyweight, default_rest, updated_at)
VALUES 
  ('ex_bench_press', NULL, 'Bench Press (Barbell / Dumbbell)', 'reps', false, 120, extract(epoch from now()) * 1000),
  ('ex_incline_bench', NULL, 'Incline Bench Press (Barbell / Dumbbell)', 'reps', false, 120, extract(epoch from now()) * 1000),
  ('ex_decline_bench', NULL, 'Decline Bench Press (Barbell / Dumbbell)', 'reps', false, 120, extract(epoch from now()) * 1000),
  ('ex_chest_flyes', NULL, 'Dumbbell Chest Flyes', 'reps', false, 90, extract(epoch from now()) * 1000),
  ('ex_cable_crossover', NULL, 'Cable Crossover', 'reps', false, 90, extract(epoch from now()) * 1000),
  ('ex_chest_press_mach', NULL, 'Chest Press Machine', 'reps', false, 90, extract(epoch from now()) * 1000),
  
  ('ex_deadlift', NULL, 'Deadlift (Barbell)', 'reps', false, 180, extract(epoch from now()) * 1000),
  ('ex_bb_row', NULL, 'Barbell Row (Bent-over)', 'reps', false, 120, extract(epoch from now()) * 1000),
  ('ex_db_row', NULL, 'One-Arm Dumbbell Row', 'reps', false, 90, extract(epoch from now()) * 1000),
  ('ex_lat_pulldown', NULL, 'Lat Pulldown (Machine)', 'reps', false, 90, extract(epoch from now()) * 1000),
  ('ex_seated_cable_row', NULL, 'Seated Cable Row', 'reps', false, 90, extract(epoch from now()) * 1000),
  ('ex_face_pulls', NULL, 'Face Pulls (Cable)', 'reps', false, 60, extract(epoch from now()) * 1000),

  ('ex_ohp', NULL, 'Overhead Press / Military Press (Barbell / Dumbbell)', 'reps', false, 120, extract(epoch from now()) * 1000),
  ('ex_lat_raises', NULL, 'Lateral Raises (Dumbbell / Cable)', 'reps', false, 60, extract(epoch from now()) * 1000),
  ('ex_front_raises', NULL, 'Front Raises (Dumbbell / Plate)', 'reps', false, 60, extract(epoch from now()) * 1000),
  ('ex_rear_delt_flyes', NULL, 'Rear Delt Flyes (Dumbbell / Machine)', 'reps', false, 60, extract(epoch from now()) * 1000),
  ('ex_shrugs', NULL, 'Shrugs (Barbell / Dumbbell)', 'reps', false, 60, extract(epoch from now()) * 1000),

  ('ex_back_squat', NULL, 'Back Squat (Barbell)', 'reps', false, 180, extract(epoch from now()) * 1000),
  ('ex_front_squat', NULL, 'Front Squat (Barbell)', 'reps', false, 180, extract(epoch from now()) * 1000),
  ('ex_leg_press', NULL, 'Leg Press (Machine)', 'reps', false, 120, extract(epoch from now()) * 1000),
  ('ex_rdl', NULL, 'Romanian Deadlift (RDL) (Barbell / Dumbbell)', 'reps', false, 120, extract(epoch from now()) * 1000),
  ('ex_bulgarian_squat', NULL, 'Bulgarian Split Squat (Dumbbell)', 'reps', false, 120, extract(epoch from now()) * 1000),
  ('ex_lunges', NULL, 'Lunges (Walking / Reverse)', 'reps', false, 90, extract(epoch from now()) * 1000),
  ('ex_leg_extension', NULL, 'Leg Extension (Machine)', 'reps', false, 60, extract(epoch from now()) * 1000),
  ('ex_leg_curl', NULL, 'Seated / Lying Leg Curl (Machine)', 'reps', false, 60, extract(epoch from now()) * 1000),
  ('ex_calf_raises', NULL, 'Standing / Seated Calf Raises', 'reps', false, 60, extract(epoch from now()) * 1000),

  ('ex_bb_bicep_curl', NULL, 'Barbell Bicep Curl', 'reps', false, 90, extract(epoch from now()) * 1000),
  ('ex_db_hammer_curl', NULL, 'Dumbbell Hammer Curl', 'reps', false, 60, extract(epoch from now()) * 1000),
  ('ex_incline_db_curl', NULL, 'Incline Dumbbell Curl', 'reps', false, 60, extract(epoch from now()) * 1000),
  ('ex_rope_pushdown', NULL, 'Tricep Rope Pushdown (Cable)', 'reps', false, 60, extract(epoch from now()) * 1000),
  ('ex_oh_tricep_ext', NULL, 'Overhead Tricep Extension (Dumbbell / Cable)', 'reps', false, 60, extract(epoch from now()) * 1000),
  ('ex_skull_crushers', NULL, 'Skull Crushers (EZ Bar / Dumbbell)', 'reps', false, 90, extract(epoch from now()) * 1000),

  ('ex_plank', NULL, 'Plank', 'time', true, 60, extract(epoch from now()) * 1000),
  ('ex_ab_wheel', NULL, 'Ab Wheel Rollout', 'reps', true, 60, extract(epoch from now()) * 1000),
  ('ex_hanging_leg_raises', NULL, 'Hanging Leg Raises', 'reps', true, 60, extract(epoch from now()) * 1000),
  ('ex_cable_crunch', NULL, 'Cable Crunch', 'reps', false, 60, extract(epoch from now()) * 1000),
  ('ex_russian_twists', NULL, 'Russian Twists', 'reps', true, 60, extract(epoch from now()) * 1000),

  ('ex_push_ups', NULL, 'Push Ups', 'reps', true, 60, extract(epoch from now()) * 1000),
  ('ex_pull_ups', NULL, 'Pull Ups', 'reps', true, 90, extract(epoch from now()) * 1000),
  ('ex_chin_ups', NULL, 'Chin Ups', 'reps', true, 90, extract(epoch from now()) * 1000),
  ('ex_dips', NULL, 'Dips', 'reps', true, 90, extract(epoch from now()) * 1000)
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name, 
  logging_type = EXCLUDED.logging_type,
  is_bodyweight = EXCLUDED.is_bodyweight,
  default_rest = EXCLUDED.default_rest;
