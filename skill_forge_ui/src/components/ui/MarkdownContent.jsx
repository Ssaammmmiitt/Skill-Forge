import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

const MarkdownContent = ({ children, className = '' }) => {
  if (!children) return null

  return (
    <div className={`markdown-content ${className}`.trim()}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children: c }) => (
            <h1 className="font-raw text-lg uppercase tracking-[2px] text-raw-text mt-6 mb-3 first:mt-0">
              {c}
            </h1>
          ),
          h2: ({ children: c }) => (
            <h2 className="font-raw text-[13px] uppercase tracking-[2px] text-raw-text mt-5 mb-2 first:mt-0">
              {c}
            </h2>
          ),
          h3: ({ children: c }) => (
            <h3 className="font-raw text-[12px] uppercase tracking-[1px] text-raw-text mt-4 mb-2 first:mt-0">
              {c}
            </h3>
          ),
          p: ({ children: c }) => (
            <p className="font-mono text-[13px] md:text-[14px] text-raw-text leading-relaxed mb-3 last:mb-0">
              {c}
            </p>
          ),
          strong: ({ children: c }) => (
            <strong className="font-semibold text-raw-text">{c}</strong>
          ),
          em: ({ children: c }) => (
            <em className="italic text-raw-text-secondary">{c}</em>
          ),
          ul: ({ children: c }) => (
            <ul className="font-mono text-[13px] md:text-[14px] text-raw-text leading-relaxed list-disc pl-5 mb-3 space-y-1.5">
              {c}
            </ul>
          ),
          ol: ({ children: c }) => (
            <ol className="font-mono text-[13px] md:text-[14px] text-raw-text leading-relaxed list-decimal pl-5 mb-3 space-y-1.5">
              {c}
            </ol>
          ),
          li: ({ children: c }) => <li className="pl-1">{c}</li>,
          blockquote: ({ children: c }) => (
            <blockquote className="border-l-[3px] border-raw-border pl-4 my-3 text-raw-text-secondary italic">
              {c}
            </blockquote>
          ),
          code: ({ inline, children: c }) =>
            inline ? (
              <code className="font-mono text-[12px] bg-raw-bg border border-raw-border px-1.5 py-0.5">
                {c}
              </code>
            ) : (
              <code className="block font-mono text-[12px] bg-raw-bg border-[2px] border-raw-border p-3 my-3 overflow-x-auto whitespace-pre-wrap">
                {c}
              </code>
            ),
          pre: ({ children: c }) => (
            <pre className="font-mono text-[12px] bg-raw-bg border-[2px] border-raw-border p-3 my-3 overflow-x-auto whitespace-pre-wrap">
              {c}
            </pre>
          ),
          hr: () => <hr className="border-raw-border my-5" />,
          a: ({ href, children: c }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-raw-link underline underline-offset-2 hover:opacity-80"
            >
              {c}
            </a>
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  )
}

export default MarkdownContent
