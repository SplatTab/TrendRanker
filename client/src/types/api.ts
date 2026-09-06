export type AnswerResponse = {
  answerId: number
  answerText: string
}

export type VoteAnswerResponse = AnswerResponse & {
  totalVotes: number
}

export type QuestionResponse = {
  questionId: number
  questionText: string
  totalVotes: number
  answers: AnswerResponse[]
}

export type VoteResponse = {
  answers: VoteAnswerResponse[]
  scoreChange: number
}

export type AuthResponse = {
  authenticated: boolean
}

export type ScoreResponse = {
  score: number
}

export type LeaderboardResponse = {
  leaderboard: {
    rank: number
    displayName: string
    score: number
  }[]
}
