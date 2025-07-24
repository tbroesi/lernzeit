-- First step: Extend achievement_type enum with new types
ALTER TYPE achievement_type ADD VALUE 'perfect_sessions';
ALTER TYPE achievement_type ADD VALUE 'total_questions';  
ALTER TYPE achievement_type ADD VALUE 'fast_sessions';
ALTER TYPE achievement_type ADD VALUE 'subjects_mastered';