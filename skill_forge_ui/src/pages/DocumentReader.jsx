import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import ButtonOffset from '../components/ui/ButtonOffset'
import PageIntro from '../components/layout/PageIntro'
import { useNotifStore } from '../store/useNotifStore'
import { analyzeDocument } from '../api/reader'

const ACCEPT =
  '.pdf,.docx,.pptx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.presentationml.presentation'

const MAX_UPLOAD_MB = 25
const COMPRESS_ABOVE_MB = 12
const COMPRESS_ABOVE_BYTES = COMPRESS_ABOVE_MB * 1024 * 1024

const formatSize = (bytes) => {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  return `${(bytes / 1024).toFixed(1)} KB`
}

const STATUS_LABELS = {
  idle: 'Ready to upload',
  uploading: 'Uploading file…',
  analyzing: 'Extracting text & generating…',
  done: 'Complete',
  error: 'Failed',
}

const DocumentReader = () => {
  const addToast = useNotifStore((s) => s.addToast)
  const fileInputRef = useRef(null)

  const [file, setFile] = useState(null)
  const [mode, setMode] = useState('summary')
  const [status, setStatus] = useState('idle')
  const [uploadPercent, setUploadPercent] = useState(0)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    document.title = 'SKILL FORGE // DOCUMENT READER'
  }, [])

  const reset = () => {
    setFile(null)
    setResult(null)
    setError(null)
    setStatus('idle')
    setUploadPercent(0)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleFileChange = (e) => {
    const picked = e.target.files?.[0]
    if (!picked) return
    const ext = picked.name.split('.').pop()?.toLowerCase()
    if (!['pdf', 'docx', 'pptx'].includes(ext)) {
      setError('Use PDF, DOCX, or PPTX files only.')
      addToast({ message: 'Unsupported file type', type: 'error' })
      return
    }
    if (picked.size > MAX_UPLOAD_MB * 1024 * 1024) {
      setError(`File must be under ${MAX_UPLOAD_MB} MB.`)
      addToast({ message: `File too large (max ${MAX_UPLOAD_MB} MB)`, type: 'error' })
      return
    }
    setFile(picked)
    setError(null)
    setResult(null)
    setStatus('idle')
    if (picked.size > COMPRESS_ABOVE_BYTES) {
      addToast({
        message: `File over ${COMPRESS_ABOVE_MB} MB — server will compress before analysis`,
        type: 'info',
      })
    }
  }

  const handleAnalyze = async () => {
    if (!file) {
      setError('Choose a file first.')
      addToast({ message: 'Select a document to upload', type: 'error' })
      return
    }

    setError(null)
    setResult(null)
    setStatus('uploading')
    setUploadPercent(0)

    try {
      const data = await analyzeDocument(file, mode, (pct) => {
        setUploadPercent(pct)
        if (pct >= 99) setStatus('analyzing')
      })
      setResult(data)
      setStatus('done')
      setUploadPercent(100)
      if (data.compression?.applied) {
        const c = data.compression
        addToast({
          message: `Compressed ${formatSize(c.original_size_bytes)} → ${formatSize(c.compressed_size_bytes)} (${c.savings_percent}% smaller)`,
          type: 'success',
          duration: 7000,
        })
      }
      addToast({
        message: mode === 'summary' ? 'Summary ready' : 'Detailed guide ready',
        type: 'success',
      })
    } catch (err) {
      setStatus('error')
      const msg = err.message || 'Could not process document'
      setError(msg)
      addToast({ message: msg, type: 'error', duration: 8000 })
    }
  }

  const progress =
    status === 'uploading'
      ? Math.min(uploadPercent, 45)
      : status === 'analyzing'
        ? 45 + Math.min(uploadPercent || 50, 50)
        : status === 'done'
          ? 100
          : 0

  return (
    <motion.div
      className="min-h-full bg-raw-bg"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28 }}
    >
      <div className="max-w-4xl mx-auto px-4 md:px-0 py-2">
        <PageIntro
          title="DOCUMENT READER"
          purpose="Upload lecture notes or slides (PDF, Word, PowerPoint). AI builds a study summary or a detailed point-wise guide from your file."
          steps={[
            'Choose summary or detailed mode',
            `Upload PDF, DOCX, or PPTX (up to ${MAX_UPLOAD_MB} MB; files over ${COMPRESS_ABOVE_MB} MB auto-compress)`,
            'Review extracted preview and generated study content',
          ]}
        />

        <div
          className="border-[3px] border-raw-border bg-raw-surface p-6 mb-6"
          style={{ borderRadius: 0 }}
        >
          <p className="font-raw text-[10px] uppercase tracking-[2px] text-raw-text-secondary mb-4">
            Output style
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 border-[2px] border-raw-border p-4 bg-raw-bg">
              <ButtonOffset
                size="md"
                active={mode === 'summary'}
                onClick={() => setMode('summary')}
                className="w-full mb-3"
              >
                Quick summary
              </ButtonOffset>
              <p className="font-mono text-[11px] text-raw-text-secondary leading-relaxed">
                Shorter overview with key takeaways—best for a fast read.
              </p>
            </div>
            <div className="flex-1 border-[2px] border-raw-border p-4 bg-raw-bg">
              <ButtonOffset
                size="md"
                active={mode === 'detailed'}
                onClick={() => setMode('detailed')}
                className="w-full mb-3"
              >
                Detailed guide
              </ButtonOffset>
              <p className="font-mono text-[11px] text-raw-text-secondary leading-relaxed">
                Point-wise, sectioned notes—best for exam prep.
              </p>
            </div>
          </div>
        </div>

        <div
          className="border-[3px] border-dotted border-raw-border bg-raw-surface p-6 mb-6"
          style={{ borderRadius: 0 }}
        >
          <p className="font-raw text-[10px] uppercase tracking-[2px] text-raw-text-secondary mb-3">
            Upload document
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPT}
            onChange={handleFileChange}
            className="sr-only"
            aria-hidden
          />
          <ButtonOffset
            size="md"
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full sm:w-auto"
          >
            {file ? 'CHANGE FILE' : 'SELECT FILE'}
          </ButtonOffset>
          {file && (
            <p className="font-mono text-[11px] text-raw-text-secondary mt-3">
              {file.name} · {formatSize(file.size)}
              {file.size > COMPRESS_ABOVE_BYTES && (
                <span className="block mt-1 text-raw-text-tertiary">
                  Over {COMPRESS_ABOVE_MB} MB — will be compressed on the server
                </span>
              )}
            </p>
          )}

          {(status === 'uploading' || status === 'analyzing') && (
            <div className="mt-5">
              <div className="flex justify-between font-mono text-[10px] text-raw-text-tertiary uppercase mb-2">
                <span>{STATUS_LABELS[status]}</span>
                <span>{progress}%</span>
              </div>
              <div className="h-2 bg-raw-bg border-[2px] border-raw-border">
                <motion.div
                  className="h-full bg-raw-border"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
          )}

          {error && (
            <div className="mt-4 border-[2px] border-raw-error p-3 font-mono text-[11px] text-raw-error">
              {error}
            </div>
          )}

          <div className="flex flex-wrap gap-3 mt-6">
            <ButtonOffset
              size="md"
              onClick={handleAnalyze}
              disabled={!file || status === 'uploading' || status === 'analyzing'}
            >
              {status === 'uploading' || status === 'analyzing'
                ? 'PROCESSING…'
                : 'GENERATE STUDY CONTENT'}
            </ButtonOffset>
            {(file || result) && (
              <ButtonOffset size="md" onClick={reset}>
                CLEAR
              </ButtonOffset>
            )}
          </div>
        </div>

        {result && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div
              className="border-[3px] border-raw-border bg-raw-surface p-6"
              style={{ borderRadius: 0 }}
            >
              <p className="font-raw text-[10px] uppercase tracking-[2px] text-raw-text-secondary mb-2">
                File · {result.filename}
              </p>
              <p className="font-mono text-[10px] text-raw-text-tertiary mb-4">
                {result.char_count?.toLocaleString()} characters extracted · Mode:{' '}
                {result.mode === 'detailed' ? 'Detailed guide' : 'Summary'}
              </p>
              {result.compression?.applied && (
                <p className="font-mono text-[10px] text-raw-success mb-4 border-[2px] border-raw-border p-2 bg-raw-bg">
                  Auto-compressed: {formatSize(result.compression.original_size_bytes)} →{' '}
                  {formatSize(result.compression.compressed_size_bytes)} (
                  {result.compression.savings_percent}% smaller via {result.compression.method})
                </p>
              )}
              <p className="font-raw text-[10px] uppercase tracking-[2px] text-raw-text-secondary mb-2">
                Extracted preview
              </p>
              <pre className="font-mono text-[11px] text-raw-text-secondary whitespace-pre-wrap leading-relaxed max-h-40 overflow-y-auto border-[2px] border-raw-border p-3 bg-raw-bg">
                {result.extracted_preview}
              </pre>
            </div>

            <div
              className="border-[3px] border-dotted border-raw-border bg-raw-surface p-6 md:p-8"
              style={{ borderRadius: 0 }}
            >
              <p className="font-raw text-[12px] uppercase tracking-[2px] text-raw-text mb-4">
                {result.mode === 'detailed' ? 'Detailed study guide' : 'Summary'}
              </p>
              <div className="font-mono text-[13px] md:text-[14px] text-raw-text leading-relaxed whitespace-pre-wrap">
                {result.content}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}

export default DocumentReader
