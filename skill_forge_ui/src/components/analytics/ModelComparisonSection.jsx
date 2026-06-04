import { useEffect, useState } from 'react'
import CardStar from '../ui/CardStar'
import MetricStar from '../ui/MetricStar'
import Spinner from '../ui/Spinner'
import { getModelComparison, confusionMatrixUrl } from '../../api/ml'

const ModelComparisonSection = () => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
      ; (async () => {
        setLoading(true)
        setError(null)
        try {
          const result = await getModelComparison()
          if (!cancelled) setData(result)
        } catch (err) {
          if (!cancelled) setError(err.message)
        } finally {
          if (!cancelled) setLoading(false)
        }
      })()
    return () => {
      cancelled = true
    }
  }, [])

  const imgUrl = confusionMatrixUrl()

  return (
    <section className="mb-12">
      <h2 className="font-space font-bold text-[28px] text-raw-white mb-2">
        ML model comparison
      </h2>
      <p className="font-body-space text-[14px] text-space-nebula mb-6">
        Decision Tree vs Neural Network on the held-out test set (accuracy,
        precision, recall, F1).
      </p>

      {loading && (
        <div className="py-12 flex justify-center">
          <Spinner variant="star" size="lg" />
        </div>
      )}

      {error && (
        <CardStar>
          <p className="font-body-space text-sm text-space-error mb-2">{error}</p>
          <p className="font-mono text-xs text-space-text-secondary">
            Run from project root: python scripts/setup_ml.py
          </p>
        </CardStar>
      )}

      {!loading && !error && data && (
        <>
          {data.winner && (
            <p className="font-body-space text-[15px] text-space-star mb-6">
              Winner by macro F1: <strong>{data.winner}</strong> (
              {(data.winner_f1 * 100).toFixed(1)}%)
            </p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {data.models?.map((model) => (
              <CardStar key={model.key} variant="default">
                <h3 className="font-space text-lg text-raw-white mb-4">
                  {model.name}
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <MetricStar
                    label="Accuracy"
                    value={`${(model.accuracy * 100).toFixed(1)}%`}
                  />
                  <MetricStar
                    label="Precision"
                    value={`${(model.precision * 100).toFixed(1)}%`}
                  />
                  <MetricStar
                    label="Recall"
                    value={`${(model.recall * 100).toFixed(1)}%`}
                  />
                  <MetricStar
                    label="F1 (macro)"
                    value={`${(model.f1_score * 100).toFixed(1)}%`}
                  />
                </div>
              </CardStar>
            ))}
          </div>

          <CardStar>
            <h3 className="font-space text-lg text-raw-white mb-4">
              Confusion matrices
            </h3>
            <p className="font-body-space text-[13px] text-space-nebula mb-4">
              Left: Decision Tree · Right: Neural Network
            </p>
            {data.has_confusion_matrix ? (
              <img
                src={imgUrl}
                alt="Decision Tree and Neural Network confusion matrices"
                className="w-full max-w-3xl mx-auto border border-space-overlay rounded-lg"
              />
            ) : (
              <p className="font-mono text-xs text-space-text-secondary">
                Image not generated yet - run setup_ml.py
              </p>
            )}
          </CardStar>

          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-space-overlay">
                  <th className="py-2 font-body-space text-xs uppercase text-space-text-secondary">
                    Model
                  </th>
                  <th className="py-2 font-body-space text-xs uppercase text-space-text-secondary">
                    Accuracy
                  </th>
                  <th className="py-2 font-body-space text-xs uppercase text-space-text-secondary">
                    Precision
                  </th>
                  <th className="py-2 font-body-space text-xs uppercase text-space-text-secondary">
                    Recall
                  </th>
                  <th className="py-2 font-body-space text-xs uppercase text-space-text-secondary">
                    F1
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.models?.map((m) => (
                  <tr key={m.key} className="border-b border-space-overlay/50">
                    <td className="py-3 font-body-space text-sm text-raw-white">
                      {m.name}
                    </td>
                    <td className="py-3 font-mono text-sm text-space-nebula">
                      {(m.accuracy * 100).toFixed(1)}%
                    </td>
                    <td className="py-3 font-mono text-sm text-space-nebula">
                      {(m.precision * 100).toFixed(1)}%
                    </td>
                    <td className="py-3 font-mono text-sm text-space-nebula">
                      {(m.recall * 100).toFixed(1)}%
                    </td>
                    <td className="py-3 font-mono text-sm text-space-star">
                      {(m.f1_score * 100).toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  )
}

export default ModelComparisonSection
