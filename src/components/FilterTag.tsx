'use client'

interface FilterTagProps {
  type: 'search' | 'category' | 'consoleType' | 'console'
  label: string
  value: string
  onRemove: () => void
}

const colorSchemes = {
  search: 'bg-purple-100 text-purple-700 hover:bg-purple-200',
  category: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
  consoleType: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
  console: 'bg-green-100 text-green-700 hover:bg-green-200',
}

export default function FilterTag({ type, label, value, onRemove }: FilterTagProps) {
  const colorScheme = colorSchemes[type]

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${colorScheme}`}
    >
      <span className="text-xs opacity-75">{label}:</span>
      <span className="max-w-[150px] truncate">{value}</span>
      <button
        onClick={onRemove}
        className="ml-1 p-0.5 rounded-full hover:bg-black/10 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-current"
        aria-label={`Remove ${label} filter`}
      >
        <svg
          className="w-3.5 h-3.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </span>
  )
}
