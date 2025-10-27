'use client'
import { createContext } from 'react'
import type { ISearchContext } from '@types'

export const SearchContext = createContext<ISearchContext | undefined>(undefined)
