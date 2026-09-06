import { useEffect, useRef, useState } from "react"
import "./App.css"
import AnswerButton from "./components/AnswerButton"
import Leaderboard from "./components/Leaderboard"
import NavBar from "./components/NavBar"
import PrivacyPolicy from "./components/PrivacyPolicy"
import type {
  AuthResponse,
  QuestionResponse,
  ScoreResponse,
  VoteResponse,
} from "./types/api"

const API_URL = import.meta.env.API_URL ?? "http://localhost:10000"

function NextButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      className="button"
      id="next"
      onClick={onClick}
    >
      Next Trend
    </button>
  )
}

function App() {
  const isPrivacyPolicy = window.location.pathname === "/privacy"
  const isLeaderboard = window.location.pathname === "/leaderboard"
  const [questionId, setQuestionId] = useState<number | null>(null)
  const [question, setQuestion] = useState("Loading question...")
  const [answers, setAnswers] = useState<{ id: number; text: string }[]>([])
  const [error, setError] = useState("")
  const [voteCounts, setVoteCounts] = useState<Record<number, number>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasVoted, setHasVoted] = useState(false)
  const [questionRefresh, setQuestionRefresh] = useState(0)
  const [score, setScore] = useState(0)
  const [scoreDelta, setScoreDelta] = useState<number | null>(null)
  const [scoreAnimationKey, setScoreAnimationKey] = useState(0)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const voteInFlightRef = useRef(false)

  useEffect(() => {
    async function checkAuthentication() {
      if (isPrivacyPolicy || isLeaderboard) return

      try {
        const response = await fetch(`${API_URL}/auth/me`, {
          credentials: "include",
        })
        const data: AuthResponse = await response.json()
        setIsAuthenticated(data.authenticated)

        if (data.authenticated) {
          const scoreResponse = await fetch(`${API_URL}/auth/score`, {
            credentials: "include",
          })
          if (scoreResponse.ok) {
            const scoreData: ScoreResponse = await scoreResponse.json()
            setScore(scoreData.score)
          }
        }
      } catch {
        setIsAuthenticated(false)
      }
    }

    checkAuthentication()
  }, [isPrivacyPolicy, isLeaderboard])

  useEffect(() => {
    async function fetchQuestion() {
      if (isPrivacyPolicy || isLeaderboard) return

      try {
        const response = await fetch(
          `${API_URL}/questions/random`,
          { credentials: "include" }
        )

        if (!response.ok) {
          throw new Error("Failed to fetch question")
        }

        const data: QuestionResponse = await response.json()
        setQuestionId(data.questionId)
        setQuestion(data.questionText)
        setAnswers(data.answers.map(answer => ({
          id: answer.answerId,
          text: answer.answerText,
        })))
      } catch {
        setError("Ran out of questions for today come back later!")
      }
    }

    fetchQuestion()
  }, [isPrivacyPolicy, isLeaderboard, questionRefresh])

  async function handleAnswerClick(answerId: number) {
    if (questionId === null || isSubmitting || hasVoted || voteInFlightRef.current) return

    voteInFlightRef.current = true
    setIsSubmitting(true)
    setError("")

    try {
      const response = await fetch(`${API_URL}/questions/${questionId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ answerId }),
      })

      if (!response.ok) throw new Error("Failed to submit vote")

      const data: VoteResponse = await response.json()
      setVoteCounts(Object.fromEntries(
        data.answers.map(answer => [answer.answerId, answer.totalVotes])
      ))
      const scoreChange = data.scoreChange
      const startingScore = score
      const targetScore = startingScore + scoreChange
      const animationStart = performance.now()
      const animationDuration = 900

      setScoreDelta(scoreChange)
      setScoreAnimationKey(animationKey => animationKey + 1)

      function animateScore(currentTime: number) {
        const progress = Math.min(
          (currentTime - animationStart) / animationDuration,
          1
        )
        const easedProgress = 1 - Math.pow(1 - progress, 3)
        setScore(startingScore + (targetScore - startingScore) * easedProgress)

        if (progress < 1) {
          requestAnimationFrame(animateScore)
        }
      }

      requestAnimationFrame(animateScore)
      setHasVoted(true)
    } catch {
      setError("Unable to submit vote. Refresh the page and try again.")
    } finally {
      voteInFlightRef.current = false
      setIsSubmitting(false)
    }
  }

  const totalVotes = Object.values(voteCounts).reduce((sum, count) => sum + count, 0)

  if (isPrivacyPolicy) {
    return <PrivacyPolicy />
  }

  if (isLeaderboard) {
    return <Leaderboard apiUrl={API_URL} />
  }

  return (
    <>
      <NavBar
        isAuthenticated={isAuthenticated}
        score={score}
        scoreChange={scoreDelta}
        scoreAnimationKey={scoreAnimationKey}
        onLogin={() => {
          window.location.href = `${API_URL}/auth/google`
        }}
        onLogout={async () => {
          const response = await fetch(`${API_URL}/auth/logout`, {
            method: "POST",
            credentials: "include",
          })

          if (response.ok) {
            setIsAuthenticated(false)
            setScore(0)
            setScoreDelta(null)
          }
        }}
      />
      <section id="center">
        {error ? <p>{error}</p> : <>
          <h2>{question}</h2>
          {answers.map((answer, index) => (
            <AnswerButton
              key={answer.id}
              id={answer.id}
              colorId={index + 1}
              text={answer.text}
              percentage={hasVoted
                ? totalVotes === 0
                  ? 0
                  : Math.round((voteCounts[answer.id] ?? 0) / totalVotes * 100)
                : undefined}
              disabled={isSubmitting || hasVoted}
              onClick={handleAnswerClick}
            />
          ))}

          {hasVoted && <NextButton onClick={() => {
              setQuestionId(null)
              setQuestion("Loading question...")
              setAnswers([])
              setVoteCounts({})
              setHasVoted(false)
              setQuestionRefresh(refresh => refresh + 1)
            }}/>
          }
        </>}


      </section>

      <footer>
        <a href="/privacy">Privacy Policy</a>
      </footer>
    </>
  )
}

export default App
