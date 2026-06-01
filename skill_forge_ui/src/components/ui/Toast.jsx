import CardStar from './CardStar'
import CardArcade from './CardArcade'
import BadgeArcade from './BadgeArcade'

const Toast = ({ message, type = 'info', onDismiss }) => {
  if (type === 'arcade') {
    return (
      <div className="fixed bottom-6 right-6 z-50 animate-slide-in">
        <CardArcade className="min-w-[300px]">
          <div className="flex items-center justify-between gap-4">
            <div className="font-arcade text-[9px] text-space-star leading-relaxed flex-1">
              {message}
            </div>
            <BadgeArcade>+XP</BadgeArcade>
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="font-arcade text-[10px] text-arcade-primary hover:text-space-star ml-2"
              >
                ×
              </button>
            )}
          </div>
        </CardArcade>
      </div>
    )
  }

  if (type === 'success') {
    return (
      <div className="fixed bottom-6 right-6 z-50 animate-slide-in">
        <CardStar variant="achievement" className="min-w-[300px]">
          <div className="flex items-center justify-between gap-4">
            <div className="font-body-space text-[14px] text-space-success leading-relaxed flex-1">
              {message}
            </div>
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="text-space-success hover:text-space-star text-xl font-bold"
              >
                ×
              </button>
            )}
          </div>
        </CardStar>
      </div>
    )
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-slide-in">
      <CardStar className="min-w-[300px]">
        <div className="flex items-center justify-between gap-4">
          <div className="font-body-space text-[14px] text-space-text leading-relaxed flex-1">
            {message}
          </div>
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="text-space-text hover:text-space-star text-xl font-bold"
            >
              ×
            </button>
          )}
        </div>
      </CardStar>
    </div>
  )
}

export default Toast
