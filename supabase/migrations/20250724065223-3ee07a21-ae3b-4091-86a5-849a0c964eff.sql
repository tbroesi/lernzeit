-- Second step: Add new achievement templates using the extended enum types
INSERT INTO achievements_template (name, description, category, type, requirement_value, reward_minutes, icon, color)
VALUES 
  ('Perfektionist', 'Beantworte alle 5 Fragen einer Session richtig', 'general', 'perfect_sessions', 1, 1, '💯', '#22c55e'),
  ('Perfekte Serie', 'Schaffe 5 perfekte Sessions', 'general', 'perfect_sessions', 5, 5, '🎯', '#22c55e'),
  ('Perfektion Meister', 'Schaffe 25 perfekte Sessions', 'general', 'perfect_sessions', 25, 15, '🏆', '#22c55e'),

  ('Wissensdurst', 'Löse insgesamt 25 Aufgaben in allen Fächern', 'general', 'total_questions', 25, 10, '🧠', '#3b82f6'),
  ('Lern-Enthusiast', 'Löse insgesamt 100 Aufgaben in allen Fächern', 'general', 'total_questions', 100, 25, '🚀', '#3b82f6'),
  ('Wissens-Champion', 'Löse insgesamt 500 Aufgaben in allen Fächern', 'general', 'total_questions', 500, 50, '🌟', '#3b82f6'),

  ('Schneller Denker', 'Beende 10 Sessions unter der Zielzeit', 'general', 'fast_sessions', 10, 20, '⚡', '#f59e0b'),
  ('Zeit-Magier', 'Beende 50 Sessions unter der Zielzeit', 'general', 'fast_sessions', 50, 40, '🕰️', '#f59e0b'),

  ('Vielseitig', 'Löse Aufgaben in mindestens 3 verschiedenen Fächern', 'general', 'subjects_mastered', 3, 15, '🎨', '#8b5cf6'),
  ('Universalgelehrter', 'Löse Aufgaben in mindestens 6 verschiedenen Fächern', 'general', 'subjects_mastered', 6, 30, '📚', '#8b5cf6');