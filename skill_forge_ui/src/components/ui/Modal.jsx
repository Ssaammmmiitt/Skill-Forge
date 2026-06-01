import CardStar from './CardStar'
import CardRaw from './CardRaw'
import CardArcade from './CardArcade'
import ButtonArcade from './ButtonArcade'

const Modal = ({ open, onClose, title, system = 'star', children }) => {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.85)' }}
      onClick={onClose}
    >
      <div
        className="max-w-2xl w-full mx-4 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {system === 'star' && (
          <CardStar variant="achievement">
            <div className="flex items-start justify-between mb-6">
              <h2 className="font-space font-bold text-[22px] text-space-star">
                {title}
              </h2>
              <ButtonArcade size="sm" onClick={onClose}>
                ×
              </ButtonArcade>
            </div>
            <div>{children}</div>
          </CardStar>
        )}

        {system === 'raw' && (
          <CardRaw>
            <div className="flex items-start justify-between mb-6">
              <h2 className="font-raw text-[32px] uppercase text-raw-black">
                {title}
              </h2>
              <ButtonArcade size="sm" onClick={onClose}>
                ×
              </ButtonArcade>
            </div>
            <div>{children}</div>
          </CardRaw>
        )}

        {system === 'arcade' && (
          <CardArcade>
            <div className="flex items-start justify-between mb-6">
              <h2 className="font-arcade text-[12px] text-space-star">
                {title}
              </h2>
              <ButtonArcade size="sm" onClick={onClose}>
                ×
              </ButtonArcade>
            </div>
            <div>{children}</div>
          </CardArcade>
        )}
      </div>
    </div>
  )
}

export default Modal
