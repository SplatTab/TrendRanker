import ScoreCounter from "./ScoreCounter"

type NavBarProps = {
  isAuthenticated: boolean
  score: number
  scoreChange: number | null
  scoreAnimationKey: number
  onLogin: () => void
  onLogout: () => void
}

function NavBar({
  isAuthenticated,
  score,
  scoreChange,
  scoreAnimationKey,
  onLogin,
  onLogout,
}: NavBarProps) {
  return (
    <nav className="top-nav">
      <a className="leaderboard-link" href="/leaderboard">
        <span aria-hidden="true">🏆</span>
        Leaderboard
      </a>
      <ScoreCounter
        score={score}
        scoreChange={scoreChange}
        animationKey={scoreAnimationKey}
      />
      <div className="nav-actions">
        <p className={isAuthenticated ? "login-status" : "login-prompt"}>
          {isAuthenticated ? "Signed in with Google" : "Trendiness and votes only saved when signed in."}
        </p>
        <button
          type="button"
          className="google-login"
          onClick={isAuthenticated ? onLogout : onLogin}
        >
          {isAuthenticated ? "Log out" : "Login with Google"}
        </button>
      </div>
    </nav>
  )
}

export default NavBar
