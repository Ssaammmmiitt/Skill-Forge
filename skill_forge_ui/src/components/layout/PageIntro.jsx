/**
 * Short page purpose blurb — keeps each screen approachable.
 */
const PageIntro = ({ title, purpose, steps }) => {
  return (
    <div className="mb-8 max-w-3xl">
      <h1 className="font-space text-[32px] md:text-[36px] text-space-star mb-2 leading-tight">
        {title}
      </h1>
      <p className="font-body-space text-[15px] text-space-nebula leading-relaxed mb-4">
        {purpose}
      </p>
      {steps?.length > 0 && (
        <ol className="font-body-space text-[13px] text-space-text-secondary space-y-1 list-decimal list-inside">
          {steps.map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ol>
      )}
    </div>
  )
}

export default PageIntro
