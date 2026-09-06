import { useEffect, useState } from "react"
import type { LeaderboardResponse } from "../types/api"

type LeaderboardProps = {
  apiUrl: string
}

function Leaderboard({ apiUrl }: LeaderboardProps) {
  const [entries, setEntries] = useState<LeaderboardResponse["leaderboard"]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const response = await fetch(`${apiUrl}/leaderboard`)
        if (!response.ok) throw new Error("Failed to fetch leaderboard")

        const data: LeaderboardResponse = await response.json()
        setEntries(data.leaderboard)
      } catch {
        setError("Leaderboards not here right now. Try again later!")
      } finally {
        setIsLoading(false)
      }
    }

    fetchLeaderboard()
  }, [apiUrl])

  return (
    <main className="leaderboard-page">
      <div className="leaderboard-heading">
        <a className="back-link" href="/">Back to voting</a>
        <p className="eyebrow">TrendRanker standings</p>
        <h1>Most Trendy</h1>
        <p>See who is reading the room best.</p>
      </div>

      {isLoading && <p className="leaderboard-message">Loading standings...</p>}
      {error && <p className="leaderboard-message">{error}</p>}
      {!isLoading && !error && entries.length > 0 && (
        <ol className="leaderboard-list">
          {entries.map(entry => (
            <li className={entry.rank <= 3 ? "leaderboard-entry top-entry" : "leaderboard-entry"} key={entry.rank}>
              <span className="leaderboard-rank">{entry.rank}</span>
              <span className="leaderboard-name">{entry.displayName}</span>
              <strong className="leaderboard-score">{entry.score}</strong>
            </li>
          ))}
        </ol>
      )}
    </main>
  )
}

export default Leaderboard
