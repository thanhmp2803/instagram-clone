import { useEffect, useLayoutEffect } from 'react'

// Hook to prevent hydration mismatch
export const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect
