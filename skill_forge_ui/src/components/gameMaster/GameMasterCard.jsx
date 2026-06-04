import { useNavigate } from 'react-router-dom'
import CardStar from '../ui/CardStar'
import BadgeStar from '../ui/BadgeStar'
import ButtonStar from '../ui/ButtonStar'
import ButtonArcade from '../ui/ButtonArcade'
import MetricStar from '../ui/MetricStar'

/**
 * @param {object} props
 * @param {object} props.gameMaster - API game_master payload
 * @param {'star'|'arcade'} props.variant
 * @param {boolean} props.compact
 */
const GameMasterCard = ({ gameMaster, variant = 'star', compact = false }) => {
  const navigate = useNavigate()

  if (!gameMaster) {
    return (
      <CardStar variant="default">
        <p className="font-body-space text-sm text-space-nebula">
          Complete a quiz to receive personalized guidance from the Game Master.
        </p>
        <ButtonStar size="sm" onClick={() => navigate('/quiz')}>
          Start quiz
        </ButtonStar>
      </CardStar>
    )
  }

  const styleLabel = (gameMaster.learning_style || 'unknown').replace(/_/g, ' ')
  const confidencePct =
    gameMaster.confidence > 0
      ? `${(gameMaster.confidence * 100).toFixed(0)}%`
      : '—'

  const Wrapper = variant === 'arcade' ? ArcadeShell : StarShell
  const ActionBtn = variant === 'arcade' ? ButtonArcade : ButtonStar

  return (
    <Wrapper compact={compact}>
      <div className="flex flex-wrap items-start justify-between gap-2 md:gap-4 mb-3 md:mb-4">
        <div>
          <p className="font-space text-[10px] md:text-xs uppercase tracking-widest text-space-nebula mb-1">
            {gameMaster.title || 'GAME MASTER'}
          </p>
          <h3
            className={
              variant === 'arcade'
                ? 'font-arcade text-[12px] md:text-[14px] text-space-star tracking-[2px]'
                : 'font-space text-base md:text-xl text-space-star'
            }
          >
            Your learning briefing
          </h3>
        </div>
        {gameMaster.model_agreement && (
          <BadgeStar status="completed">Models agree</BadgeStar>
        )}
      </div>

      <p
        className={
          variant === 'arcade'
            ? 'font-body-space text-[12px] md:text-[14px] text-arcade-secondary leading-relaxed mb-3 md:mb-4'
            : 'font-body-space text-[13px] md:text-[15px] text-space-nebula leading-relaxed mb-4 md:mb-6'
        }
      >
        {gameMaster.focus}
      </p>

      <div
        className={`grid gap-2 md:gap-4 mb-4 ${
          compact ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-4'
        }`}
      >
        <MetricStar label="Style" value={styleLabel} />
        <MetricStar label="Confidence" value={confidencePct} />
        <MetricStar
          label="Difficulty"
          value={gameMaster.difficulty_label || '—'}
        />
        <MetricStar
          label="Next level"
          value={String(gameMaster.suggested_difficulty ?? '—')}
        />
      </div>

      {gameMaster.task_types?.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {gameMaster.task_types.map((t) => (
            <BadgeStar key={t} status="pending">
              {t.replace(/_/g, ' ')}
            </BadgeStar>
          ))}
        </div>
      )}

      {gameMaster.explanations?.length > 0 && (
        <ul className="mb-4 md:mb-5 space-y-1.5 md:space-y-2 font-body-space text-[11px] md:text-[13px] text-space-text-secondary list-disc pl-4 md:pl-5">
          {gameMaster.explanations.map((line, i) => (
            <li key={i}>{line}</li>
          ))}
        </ul>
      )}

      <ActionBtn
        size={compact ? 'sm' : 'md'}
        onClick={() => navigate(gameMaster.action_route || '/quiz')}
      >
        {gameMaster.action_label || 'Start quiz'}
      </ActionBtn>
    </Wrapper>
  )
}

const StarShell = ({ children, compact }) => (
  <CardStar variant="achievement" className={compact ? '' : ''}>
    {children}
  </CardStar>
)

const ArcadeShell = ({ children, compact }) => (
  <div
    className={`border-[3px] border-dotted border-arcade-primary bg-arcade-surface text-left ${
      compact ? 'p-5 mt-6' : 'p-6'
    }`}
    style={{ borderRadius: 0 }}
  >
    {children}
  </div>
)

export default GameMasterCard
