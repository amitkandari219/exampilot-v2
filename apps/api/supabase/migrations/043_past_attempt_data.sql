ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS past_attempt_data JSONB;
COMMENT ON COLUMN user_profiles.past_attempt_data IS 'For 2nd+ attempt: { prelims_score, mains_weakest_papers, biggest_challenge }';
