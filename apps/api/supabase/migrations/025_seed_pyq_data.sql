-- Seed pyq_data for ALL topics (idempotent — skips topics that already have rows)
-- Uses deterministic pseudo-random via hashtext() for reproducibility
-- importance drives volume: 5→8-10 rows, 4→5-7, 3→3-5, 2→2-3, 1→1-2

DO $$
DECLARE
  rec RECORD;
  yr INT;
  hash_val INT;
  q_count INT;
  q_type TEXT;
  paper_val gs_paper;
  subject_papers gs_paper[];
  existing_count INT;
  target_rows INT;
  rows_added INT;
  year_prob FLOAT;
BEGIN
  FOR rec IN
    SELECT t.id AS topic_id, t.name AS topic_name, t.importance,
           c.subject_id, s.papers
    FROM topics t
    JOIN chapters c ON c.id = t.chapter_id
    JOIN subjects s ON s.id = c.subject_id
  LOOP
    -- Skip topics that already have pyq_data
    SELECT count(*) INTO existing_count FROM pyq_data WHERE topic_id = rec.topic_id;
    IF existing_count > 0 THEN
      CONTINUE;
    END IF;

    subject_papers := rec.papers;

    -- Determine target rows based on importance
    CASE rec.importance
      WHEN 5 THEN target_rows := 8 + abs(hashtext(rec.topic_id::text || 'target')) % 3;  -- 8-10
      WHEN 4 THEN target_rows := 5 + abs(hashtext(rec.topic_id::text || 'target')) % 3;  -- 5-7
      WHEN 3 THEN target_rows := 3 + abs(hashtext(rec.topic_id::text || 'target')) % 3;  -- 3-5
      WHEN 2 THEN target_rows := 2 + abs(hashtext(rec.topic_id::text || 'target')) % 2;  -- 2-3
      ELSE target_rows := 1 + abs(hashtext(rec.topic_id::text || 'target')) % 2;          -- 1-2
    END CASE;

    rows_added := 0;

    FOR yr IN REVERSE 2025..2015 LOOP
      EXIT WHEN rows_added >= target_rows;

      hash_val := abs(hashtext(rec.topic_id::text || yr::text));

      -- Recent years have higher probability of appearing
      CASE
        WHEN yr >= 2024 THEN year_prob := 0.85;
        WHEN yr >= 2022 THEN year_prob := 0.70;
        WHEN yr >= 2020 THEN year_prob := 0.55;
        WHEN yr >= 2018 THEN year_prob := 0.45;
        ELSE year_prob := 0.35;
      END CASE;

      -- Use hash to determine if this year gets a row
      IF (hash_val % 100)::float / 100.0 < year_prob THEN
        -- Pick paper from subject's papers array
        paper_val := subject_papers[1 + (hash_val % array_length(subject_papers, 1))];

        -- Question count: mostly 1, sometimes 2 for high-importance recent years
        IF rec.importance >= 4 AND yr >= 2023 AND (hash_val % 5 = 0) THEN
          q_count := 2;
        ELSE
          q_count := 1;
        END IF;

        -- Question type based on paper
        CASE
          WHEN paper_val = 'Prelims' THEN q_type := 'mcq';
          WHEN hash_val % 3 = 0 THEN q_type := 'short_answer';
          ELSE q_type := 'descriptive';
        END CASE;

        INSERT INTO pyq_data (topic_id, year, paper, question_count, question_type)
        VALUES (rec.topic_id, yr, paper_val, q_count, q_type)
        ON CONFLICT (topic_id, year, paper) DO NOTHING;

        rows_added := rows_added + 1;
      END IF;
    END LOOP;
  END LOOP;
END $$;

-- Update topic-level pyq fields from pyq_data
UPDATE topics t SET
  pyq_frequency = sub.total_q,
  last_pyq_year = sub.max_year,
  pyq_trend = CASE
    WHEN sub.recent_avg > sub.older_avg * 1.3 THEN 'rising'::pyq_trend
    WHEN sub.recent_avg < sub.older_avg * 0.7 THEN 'declining'::pyq_trend
    ELSE 'stable'::pyq_trend
  END
FROM (
  SELECT
    topic_id,
    sum(question_count) AS total_q,
    max(year) AS max_year,
    coalesce(avg(CASE WHEN year >= 2022 THEN question_count::float END), 0) AS recent_avg,
    coalesce(avg(CASE WHEN year <= 2021 THEN question_count::float END), 0.1) AS older_avg
  FROM pyq_data
  GROUP BY topic_id
) sub
WHERE t.id = sub.topic_id;

-- Populate pyq_subject_stats
INSERT INTO pyq_subject_stats (subject_id, avg_questions_per_year, total_questions_10yr, trend, highest_year, highest_count)
SELECT
  s.id,
  coalesce(round(sum(p.question_count)::numeric / 11.0, 2), 0),
  coalesce(sum(p.question_count), 0),
  CASE
    WHEN coalesce(avg(CASE WHEN p.year >= 2022 THEN p.question_count::float END), 0)
       > coalesce(avg(CASE WHEN p.year <= 2021 THEN p.question_count::float END), 0.1) * 1.3
    THEN 'rising'::pyq_trend
    WHEN coalesce(avg(CASE WHEN p.year >= 2022 THEN p.question_count::float END), 0)
       < coalesce(avg(CASE WHEN p.year <= 2021 THEN p.question_count::float END), 0.1) * 0.7
    THEN 'declining'::pyq_trend
    ELSE 'stable'::pyq_trend
  END,
  (SELECT year FROM pyq_data p2
   JOIN topics t2 ON t2.id = p2.topic_id
   JOIN chapters c2 ON c2.id = t2.chapter_id
   WHERE c2.subject_id = s.id
   GROUP BY year ORDER BY sum(question_count) DESC LIMIT 1),
  (SELECT coalesce(sum(question_count), 0) FROM pyq_data p3
   JOIN topics t3 ON t3.id = p3.topic_id
   JOIN chapters c3 ON c3.id = t3.chapter_id
   WHERE c3.subject_id = s.id
   GROUP BY year ORDER BY sum(question_count) DESC LIMIT 1)
FROM subjects s
LEFT JOIN chapters c ON c.subject_id = s.id
LEFT JOIN topics t ON t.chapter_id = c.id
LEFT JOIN pyq_data p ON p.topic_id = t.id
GROUP BY s.id
ON CONFLICT (subject_id) DO UPDATE SET
  avg_questions_per_year = EXCLUDED.avg_questions_per_year,
  total_questions_10yr = EXCLUDED.total_questions_10yr,
  trend = EXCLUDED.trend,
  highest_year = EXCLUDED.highest_year,
  highest_count = EXCLUDED.highest_count;
