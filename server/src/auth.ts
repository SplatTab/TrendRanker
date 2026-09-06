import session from "express-session";
import type { Express } from "express";
import type { RateLimitRequestHandler } from "express-rate-limit";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import pool from "./db.js";

type AuthenticatedUser = {
  id: number;
  email: string;
  displayName: string;
  score: number;
};

declare global {
  namespace Express {
    interface User extends AuthenticatedUser {}
  }
}

const clientUrl = process.env.CLIENT_URL ?? "http://localhost:5173";
const googleAuthConfigured = Boolean(
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
);

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id: number, done) => {
  try {
    const result = await pool.query<AuthenticatedUser>(
      `SELECT id, email, display_name AS "displayName", score
       FROM users WHERE id = $1`,
      [id]
    );
    done(null, result.rows[0] ?? false);
  } catch (error) {
    done(error);
  }
});

if (googleAuthConfigured) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    callbackURL: process.env.GOOGLE_CALLBACK_URL ?? "http://localhost:3000/auth/google/callback",
    state: true,
  }, async (_accessToken, _refreshToken, profile, done) => {
    try {
      const email = profile.emails?.[0]?.value;
      if (!email) return done(new Error("Google account has no email address."));

      const result = await pool.query<AuthenticatedUser>(
        `INSERT INTO users (google_id, email, display_name)
         VALUES ($1, $2, $3)
         ON CONFLICT (google_id) DO UPDATE SET email = EXCLUDED.email,
           display_name = EXCLUDED.display_name
         RETURNING id, email, display_name AS "displayName", score`,
        [profile.id, email, profile.displayName || email]
      );
      return done(null, result.rows[0]);
    } catch (error) {
      return done(error as Error);
    }
  }));
}

export function configureAuth(app: Express, rateLimiter: RateLimitRequestHandler) {
  app.use(session({
    secret: process.env.SESSION_SECRET ?? crypto.getRandomValues(new Uint8Array(32)).toString(),
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    },
  }));
  app.use(passport.initialize());
  app.use(passport.session());

  app.get("/auth/google", rateLimiter, (req, res, next) => {
    if (!googleAuthConfigured) {
      return res.status(503).json({ error: "Google OAuth is not configured." });
    }
    return passport.authenticate("google", { scope: ["profile", "email"] })(req, res, next);
  });

  app.get(
    "/auth/google/callback",
    rateLimiter,
    (req, res, next) => {
      if (!googleAuthConfigured) {
        return res.status(503).json({ error: "Google OAuth is not configured." });
      }
      return passport.authenticate("google", {
        failureRedirect: `${clientUrl}/?auth=failed`,
      })(req, res, next);
    },
    (_req, res) => res.redirect(clientUrl)
  );

  app.get("/auth/me", rateLimiter, (req, res) => {
    if (!req.user) return res.status(401).json({ authenticated: false });
    return res.json({ authenticated: true, user: req.user });
  });

  app.get("/auth/score", rateLimiter, async (req, res) => {
    if (!req.user) return res.status(401).json({ error: "Not authenticated." });

    try {
      const result = await pool.query<{ score: number }>(
        `SELECT score FROM users WHERE id = $1`,
        [req.user.id]
      );
      if (!result.rows[0]) return res.status(404).json({ error: "User not found." });
      return res.json({ score: Number(result.rows[0].score) });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Failed to fetch user score." });
    }
  });

  app.post("/auth/logout", rateLimiter, (req, res, next) => {
    req.logout(error => {
      if (error) return next(error);
      req.session.destroy(destroyError => {
        if (destroyError) return next(destroyError);
        res.clearCookie("connect.sid");
        return res.status(204).end();
      });
    });
  });
}
