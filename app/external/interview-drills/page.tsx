'use client'

import InterviewDrillPrep from '@/components/InterviewDrillPrep'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function InterviewDrillsPageInner() {
  const searchParams = useSearchParams()
  const tab = searchParams.get('tab')
  const initialMode = tab === 'sanity' ? 'sanity-cms' : tab === 'coding' ? 'live-coding' : 'theory'
  return <InterviewDrillPrep initialMode={initialMode} />
}

export default function InterviewDrillsPage() {
  return (
    <Suspense fallback={null}>
      <InterviewDrillsPageInner />
    </Suspense>
  )
}
