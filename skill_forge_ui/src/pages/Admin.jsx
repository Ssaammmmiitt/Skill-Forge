import { useState, useEffect } from 'react'
import { getMetrics, triggerRetrain } from '../api/admin'
import { useNotifStore } from '../store/useNotifStore'
import CardRaw from '../components/ui/CardRaw'
import MetricRaw from '../components/ui/MetricRaw'
import ButtonOffset from '../components/ui/ButtonOffset'
import Spinner from '../components/ui/Spinner'

const Admin = () => {
  const addToast = useNotifStore(state => state.addToast)
  const [metrics, setMetrics] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [retraining, setRetraining] = useState(false)
  const [retrainError, setRetrainError] = useState(null)

  // Document title
  useEffect(() => {
    document.title = 'SKILL FORGE // ADMIN'
  }, [])

  useEffect(() => {
    fetchMetrics()
  }, [])

  const fetchMetrics = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getMetrics()
      setMetrics(data)
    } catch (err) {
      setError(err.message || 'Failed to load metrics')
    } finally {
      setLoading(false)
    }
  }

  const handleRetrain = async () => {
    setRetraining(true)
    setRetrainError(null)
    try {
      await triggerRetrain()
      addToast({
        message: 'RETRAIN STARTED',
        type: 'info'
      })
    } catch (err) {
      setRetrainError(err.message || 'Retrain failed')
    } finally {
      setRetraining(false)
    }
  }

  const formatPercent = (value) => {
    if (value === null || value === undefined || isNaN(value)) return 'N/A'
    return (value * 100).toFixed(1) + '%'
  }

  const getWinner = () => {
    if (!metrics) return null
    try {
      const dtF1 = metrics.decision_tree?.f1_score
      const nnF1 = metrics.neural_net?.f1_score
      
      if (dtF1 === undefined || nnF1 === undefined) return null
      
      return dtF1 >= nnF1 
        ? { name: 'DECISION TREE', f1: formatPercent(dtF1) }
        : { name: 'NEURAL NET', f1: formatPercent(nnF1) }
    } catch (err) {
      console.error('Error calculating winner:', err)
      return null
    }
  }

  const winner = getWinner()

  // Check if metrics data is valid
  const hasValidMetrics = metrics && 
    metrics.decision_tree && 
    metrics.neural_net &&
    typeof metrics.decision_tree.accuracy !== 'undefined' &&
    typeof metrics.neural_net.accuracy !== 'undefined'

  return (
    <div className="min-h-full bg-raw-white">
      
      {/* HEADER BAND */}
      <div className="bg-raw-black px-8 py-10">
        <h1 className="font-raw text-raw-white text-[48px] uppercase leading-tight">
          ADMIN
        </h1>
        <p className="font-mono text-[#888] text-xs tracking-[2px] mt-2">
          MODEL PERFORMANCE DASHBOARD
        </p>
      </div>

      {/* MODEL METRICS SECTION */}
      <div className="bg-raw-white px-8 py-10">
        <div className="font-raw text-raw-black text-[10px] uppercase tracking-[3px] mb-8">
          MODEL COMPARISON
        </div>

        {loading && (
          <div className="flex items-center justify-center py-20">
            <Spinner variant="raw" size="lg" />
          </div>
        )}

        {error && !loading && (
          <div className="border-[3px] border-raw-error p-4 font-raw text-raw-error text-[14px] uppercase tracking-[1px]">
            FAILED — {error}
          </div>
        )}

        {!loading && !error && metrics && !hasValidMetrics && (
          <div className="border-[3px] border-raw-warning p-4 font-raw text-raw-black text-[14px] uppercase tracking-[1px]">
            INVALID METRICS DATA — Model comparison file may be corrupted. Try retraining the models.
          </div>
        )}

        {!loading && !error && metrics && hasValidMetrics && (
          <div>
            {/* DECISION TREE MODEL */}
            <CardRaw>
              <h3 className="font-raw text-[24px] uppercase text-raw-black mb-6">
                DECISION TREE
              </h3>
              <div className="flex gap-4 flex-wrap">
                <MetricRaw 
                  label="ACCURACY" 
                  value={formatPercent(metrics.decision_tree?.accuracy)} 
                />
                <MetricRaw 
                  label="PRECISION" 
                  value={formatPercent(metrics.decision_tree?.precision)} 
                />
                <MetricRaw 
                  label="RECALL" 
                  value={formatPercent(metrics.decision_tree?.recall)} 
                />
                <MetricRaw 
                  label="F1" 
                  value={formatPercent(metrics.decision_tree?.f1_score)} 
                />
              </div>
            </CardRaw>

            {/* DIVIDER */}
            <div className="border-b-[5px] border-raw-black my-6" />

            {/* NEURAL NET MODEL */}
            <CardRaw>
              <h3 className="font-raw text-[24px] uppercase text-raw-black mb-6">
                NEURAL NET
              </h3>
              <div className="flex gap-4 flex-wrap">
                <MetricRaw 
                  label="ACCURACY" 
                  value={formatPercent(metrics.neural_net?.accuracy)} 
                />
                <MetricRaw 
                  label="PRECISION" 
                  value={formatPercent(metrics.neural_net?.precision)} 
                />
                <MetricRaw 
                  label="RECALL" 
                  value={formatPercent(metrics.neural_net?.recall)} 
                />
                <MetricRaw 
                  label="F1" 
                  value={formatPercent(metrics.neural_net?.f1_score)} 
                />
              </div>
            </CardRaw>

            {/* WINNER LINE */}
            {winner && (
              <div className="mt-6 font-raw text-[16px] uppercase tracking-[2px] text-raw-black">
                WINNER: {winner.name} // F1: {winner.f1}
              </div>
            )}
          </div>
        )}
      </div>

      {/* SYSTEM ACTIONS SECTION */}
      <div className="bg-raw-black px-8 py-10 border-t-[5px] border-raw-white">
        <div className="font-raw text-raw-white text-[10px] uppercase tracking-[3px] mb-6">
          SYSTEM ACTIONS
        </div>

        <ButtonOffset
          size="lg"
          className="mt-1"
          onClick={handleRetrain}
          disabled={retraining}
        >
          {retraining ? 'RETRAINING...' : 'RETRAIN MODELS'}
        </ButtonOffset>

        {retrainError && (
          <div className="mt-4 font-mono text-raw-error text-sm">
            {retrainError}
          </div>
        )}

        <div className="mt-6">
          <a
            href="/api/admin/metrics"
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-raw-link text-sm underline"
          >
            DOWNLOAD MODEL REPORT (CSV)
          </a>
        </div>
      </div>

    </div>
  )
}

export default Admin
