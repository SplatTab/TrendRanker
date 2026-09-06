import type { CSSProperties } from "react"

type AnswerButtonProps = {
  id: number
  colorId: number
  text: string
  percentage?: number
  disabled: boolean
  onClick: (id: number) => void
}

export default function AnswerButton({
  id,
  colorId,
  text,
  percentage,
  disabled,
  onClick,
}: AnswerButtonProps) {
  return (
    <button
      type="button"
      className="button"
      id={`a-${colorId}`}
      style={{ "--vote-progress": `${percentage ?? 0}%` } as CSSProperties}
      onClick={() => onClick(id)}
      disabled={disabled}
    >
      <span className="answer-label">
        {text}{percentage !== undefined ? `: ${percentage}%` : ""}
      </span>
    </button>
  )
}
