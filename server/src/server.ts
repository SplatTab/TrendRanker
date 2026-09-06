import "dotenv/config";
import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import helmet from "helmet";

import pool from "./db.js";
import type { PostgresError } from "./db.js";
import { configureAuth } from "./auth.js";

const app = express();
const PORT = process.env.PORT || 10000;
const clientUrl = (process.env.CLIENT_URL ?? "http://localhost:5173").replace(/\/+$/, "");

app.set("trust proxy", 1);

app.use(cors({
  origin: clientUrl,
  credentials: true,
}));
app.use(helmet());
app.use(express.json());

const rateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute window
  max: 30, // Limit each IP to 30 requests per window
  message: { error: "Too many requests. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

configureAuth(app, rateLimiter);

/*
 * GET /api/health
 * Checks the health of the server and database connection.
 * Returns:
 * {
 *   message: string,
 *   databaseTime: string
 * }
 */
app.get("/api/health", rateLimiter, async (_req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");

    res.json({
      message: "Database is on 0_0 " + result.rows[0].now,
      databaseTime: result.rows[0].now,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Database connection failed",
    });
  }
});

app.get("/leaderboard", rateLimiter, async (_req, res) => {
  try {
    const result = await pool.query(`
      SELECT display_name, score
      FROM users
      ORDER BY score DESC, id ASC
      LIMIT 10;
    `);

    return res.json({
      leaderboard: result.rows.map((user, index) => ({
        rank: index + 1,
        displayName: user.display_name,
        score: Number(user.score),
      })),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to fetch leaderboard." });
  }
});

/*
 * GET /questions/random
 * Fetches a random question, its answers, and the total votes for the question.
 * Returns:
 * {
 *   questionId: number,
 *   questionText: string,
 *   totalVotes: number,
 *   answers: [{ answerId: number, answerText: string }]
 * }
 * Answer vote totals are intentionally hidden until the user votes.
 */
app.get("/questions/random", rateLimiter, async (req, res) => {
  try {
    const userId = req.user?.id ?? null;
    const randomQuestionResult = await pool.query(`
      WITH bounds AS (
        SELECT COALESCE(MAX(id), 0) AS max_id,
               FLOOR(RANDOM() * COALESCE(MAX(id), 0))::int + 1 AS start_id
        FROM questions
      ), candidates AS (
        (
          SELECT q.id, q.question_text AS "questionText"
          FROM questions q
          CROSS JOIN bounds b
          WHERE q.id >= b.start_id
            AND ($1::int IS NULL OR NOT EXISTS (
              SELECT 1
              FROM votes v
              WHERE v.question_id = q.id
                AND v.user_id = $1
            ))
          ORDER BY q.id
          LIMIT 1
        )
        UNION ALL
        (
          SELECT q.id, q.question_text AS "questionText"
          FROM questions q
          CROSS JOIN bounds b
          WHERE q.id < b.start_id
            AND ($1::int IS NULL OR NOT EXISTS (
              SELECT 1
              FROM votes v
              WHERE v.question_id = q.id
                AND v.user_id = $1
            ))
          ORDER BY q.id
          LIMIT 1
        )
      )
      SELECT id, "questionText"
      FROM candidates
      LIMIT 1;
        `, [userId]);

    const question = randomQuestionResult.rows[0];
    if (!question) {
      return res.status(404).json({ error: "No questions found." });
    }

    const [answersResult, voteCountResult] = await Promise.all([
      pool.query(
        `SELECT id AS "answerId", answer_text AS "answerText"
         FROM answers
         WHERE question_id = $1
         ORDER BY id;`,
        [question.id]
      ),
      pool.query(
        `SELECT COUNT(*)::int AS "totalVotes"
         FROM votes
         WHERE question_id = $1;`,
        [question.id]
      ),
    ]);

    return res.json({
      questionId: question.id,
      questionText: question.questionText,
      totalVotes: voteCountResult.rows[0].totalVotes,
      answers: answersResult.rows,
    });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Failed to fetch poll details." });
    }
});

/*
 * POST /questions/:questionId/vote
 * Request body should contain:
 * {
 *   "answerId": number
 * }
 * Records a vote when the user is authenticated(unless already voted), then reveals all answer totals.
 * Returns:
 * {
 *   success: boolean,
 *   answers: [{ answerId: number, answerText: string, totalVotes: number }]
 *   scoreChange: number
 * }
*/
app.post("/questions/:questionId/vote", rateLimiter, async (req, res) => {
    const { questionId } = req.params;
    const { answerId } = req.body ?? {};
    const userId = req.user?.id;
    console.log(`User ${userId} voting on question ${questionId} for answer ${answerId}`);

    if (!Number.isInteger(answerId)) {
      return res.status(400).json({
        error: "Request body must contain an integer answerId.",
      });
    }

    try {
      if (userId) {
        await pool.query(
          `INSERT INTO votes (user_id, question_id, answer_id)
           VALUES ($1, $2, $3)`,
          [userId, questionId, answerId]
        );
      }

        // Reveal answer totals only after the user has voted.
        const answerCountsResult = await pool.query(
          `SELECT
            a.id AS "answerId",
            a.answer_text AS "answerText",
            COUNT(v.id)::int AS "totalVotes"
           FROM answers a
           LEFT JOIN votes v ON a.id = v.answer_id
           WHERE a.question_id = $1
           GROUP BY a.id, a.answer_text
           ORDER BY a.id;`,
          [questionId]
        );

        let scoreChange: number = 0;
        /* Formula for score gained is 
        If top two answers 
        voteShare = (answerVotes / allAnswersVotes) * 100
        20(Points for being the best answer or first) + voteShare
        If bottom two answers
        negative(voteShare)
        */

        const totalVotes = answerCountsResult.rows.reduce(
          (sum, answer) => sum + Number(answer.totalVotes),
          0
        );
        const rankedAnswers = [...answerCountsResult.rows].sort((first, second) => {
          const voteDifference = Number(second.totalVotes) - Number(first.totalVotes);
          return voteDifference || first.answerId - second.answerId;
        });
        const selectedAnswer = rankedAnswers.find(
          answer => Number(answer.answerId) === answerId
        );
        const selectedRank = rankedAnswers.findIndex(
          answer => Number(answer.answerId) === answerId
        );

        if (selectedAnswer && totalVotes > 0) {
          const voteShare = Number(selectedAnswer.totalVotes) / totalVotes * 100;
          const calculatedScoreChange = selectedRank < 2
            ? 20 + voteShare
            : -voteShare;
          scoreChange = Math.round(calculatedScoreChange);
        }

        if (userId) {
          await pool.query(
            `UPDATE users
             SET score = score + $1
             WHERE id = $2`,
            [scoreChange, userId]
          );
        }

        return res.json({ 
          success: true, 
          answers: answerCountsResult.rows,
          scoreChange: scoreChange
        });

    } catch (error) {
      console.error(error);
      // PG duplicate key violation error code (23505)
        if (error && (error as PostgresError).code === "23505") {
            return res.status(400).json({ error: "You have already voted on this question." });
        } 

        return res.status(500).json({ error: "Server error processing your vote." });
    }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
