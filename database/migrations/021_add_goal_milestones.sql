-- Add goal milestones table for sub-goals and tracking checkpoints

CREATE TABLE IF NOT EXISTS goal_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  target_value DECIMAL,
  current_value DECIMAL DEFAULT 0,
  is_completed BOOLEAN DEFAULT FALSE,
  due_date DATE,
  completed_at TIMESTAMPTZ,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS policies for goal_milestones
ALTER TABLE goal_milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own goal milestones"
  ON goal_milestones
  FOR ALL
  USING (auth.uid() = user_id);

-- Index for performance
CREATE INDEX idx_goal_milestones_goal_id ON goal_milestones(goal_id);
CREATE INDEX idx_goal_milestones_user_id ON goal_milestones(user_id);
