import { useState } from 'react'

export function useSave() {
  const [isSaved, setIsSaved] = useState(false)

  const toggleSave = () => {
    setIsSaved((prev) => !prev)
  }

  const saveButtonProps = {
    className: `cursor-pointer transition-colors ${
      isSaved ? 'text-white hover:text-gray-300' : 'hover:text-gray-400'
    }`,
    onClick: toggleSave,
    fill: isSaved ? 'currentColor' : 'none',
  }

  return {
    isSaved,
    toggleSave,
    saveButtonProps,
  }
}
