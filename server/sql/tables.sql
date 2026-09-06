-- 1. Create the Users Table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  google_id TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL,
  display_name TEXT NOT NULL,
  score BIGINT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX users_score_leaderboard_idx
  ON users (score DESC, id ASC);

-- 2. Create the Questions Table
CREATE TABLE questions (
    id SERIAL PRIMARY KEY,
    question_text VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create the Answers Table (The multiple-choice options)
CREATE TABLE answers (
    id SERIAL PRIMARY KEY,
  question_id INT NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  answer_text VARCHAR(255) NOT NULL,
  UNIQUE (question_id, id)
);

-- 4. Update or Create the Votes Table with proper Foreign Keys
CREATE TABLE votes (
    id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  question_id INT NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  answer_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- Ensures the answer belongs to the voted question
  CONSTRAINT votes_answer_question_fkey
    FOREIGN KEY (question_id, answer_id)
    REFERENCES answers(question_id, id)
    ON DELETE CASCADE,
    
    -- Guarantee one vote per user per question
    CONSTRAINT unique_user_question_vote UNIQUE (user_id, question_id)
);

