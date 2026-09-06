type ScoreCounterProps = {
  score: number
  scoreChange: number | null
  animationKey: number
}

function ScoreCounter({ score, scoreChange, animationKey }: ScoreCounterProps) {
  return (
    <div className="score-wrap">
      <div className="score-counter">
        <span>Trendiness</span>
        <strong>{score.toFixed(0)}</strong>
      </div>
      {scoreChange !== null && (
        <span
          key={animationKey}
          className={`score-delta ${scoreChange < 0 ? "negative" : ""}`}
        >
          {scoreChange >= 0 ? "+" : ""}{scoreChange.toFixed(1)}
        </span>
      )}
    </div>
  )
}

export default ScoreCounter
