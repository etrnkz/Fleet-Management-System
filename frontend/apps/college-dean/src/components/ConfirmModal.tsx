'use client'

interface ConfirmModalProps {
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  confirmColor?: 'emerald' | 'red' | 'blue'
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmModal({
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmColor = 'emerald',
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const getConfirmButtonClass = () => {
    switch (confirmColor) {
      case 'emerald':
        return 'bg-emerald-700 hover:bg-emerald-800 text-white'
      case 'red':
        return 'bg-red-500 hover:bg-red-600 text-white'
      case 'blue':
        return 'bg-emerald-700 hover:bg-emerald-800 text-white'
    }
  }

  const getIconColor = () => {
    switch (confirmColor) {
      case 'emerald':
        return 'bg-emerald-100 text-emerald-600'
      case 'red':
        return 'bg-red-100 text-red-600'
      case 'blue':
        return 'bg-emerald-100 text-emerald-600'
    }
  }

  const getIcon = () => {
    switch (confirmColor) {
      case 'emerald':
        return (
          <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        )
      case 'red':
        return (
          <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        )
      case 'blue':
        return (
          <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onCancel}
      ></div>

      <div className="flex min-h-full items-center justify-center p-3 md:p-4">
        <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-3">
          <div className="p-4 md:p-6">
            {/* Icon */}
            <div className={`w-12 h-12 md:w-16 md:h-16 ${getIconColor()} rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4`}>
              {getIcon()}
            </div>

            {/* Content */}
            <h3 className="text-lg md:text-xl font-semibold text-gray-900 text-center mb-2">
              {title}
            </h3>
            <p className="text-sm md:text-base text-gray-600 text-center mb-4 md:mb-6">
              {message}
            </p>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
              <button
                onClick={onCancel}
                className="w-full sm:flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm md:text-base"
              >
                {cancelText}
              </button>
              <button
                onClick={onConfirm}
                className={`w-full sm:flex-1 px-4 py-2 rounded-lg transition-colors font-medium text-sm md:text-base ${getConfirmButtonClass()}`}
              >
                {confirmText}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
