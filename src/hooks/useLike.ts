import { useState } from 'react'

export function useLike(initialLikes: number) {
  const [isLiked, setIsLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(initialLikes)

  const toggleLike = () => {
    setIsLiked((prev) => !prev)
    setLikesCount((prev) => (isLiked ? prev - 1 : prev + 1))
  }

  const likeButtonProps = {
    className: `cursor-pointer transition-colors ${
      isLiked ? 'text-red-500 hover:text-red-600' : 'hover:text-gray-400'
    }`,
    onClick: toggleLike,
    fill: isLiked ? 'currentColor' : 'none',
  }

  return {
    isLiked,
    likesCount,
    toggleLike,
    likeButtonProps,
  }
}
