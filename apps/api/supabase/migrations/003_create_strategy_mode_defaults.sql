CREATE TABLE strategy_mode_defaults (
  id SERIAL PRIMARY KEY,
  mode strategy_mode NOT NULL,
  param_name TEXT NOT NULL,
  param_value TEXT NOT NULL,
  description TEXT,
  UNIQUE(mode, param_name)
);
