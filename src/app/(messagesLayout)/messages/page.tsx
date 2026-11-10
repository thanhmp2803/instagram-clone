'use client'

import { Suspense } from 'react'
import { MessagesView } from '@components'

export default function MessagesPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full h-screen bg-black flex overflow-hidden">
          <div className="w-full lg:w-[350px] xl:w-[380px] h-full border-r border-zinc-800 p-4 animate-pulse">
            <div className="h-8 bg-zinc-800 rounded-md w-32 mb-6" />
            <div className="h-10 bg-zinc-900 rounded-xl mb-4" />
          </div>
          <div className="hidden lg:flex flex-1 h-full bg-black" />
        </div>
      }
    >
      <MessagesView />
    </Suspense>
  )
}
