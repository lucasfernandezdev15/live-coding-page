'use client'

import dynamic from 'next/dynamic'
import { Component, type ReactNode, useMemo } from 'react'
import type { Challenge } from '@/lib/types'

class PreviewErrorBoundary extends Component<{ children: ReactNode }, { message: string | null }> {
  state = { message: null }

  static getDerivedStateFromError(error: Error) {
    return { message: error.message || 'Error en la vista previa' }
  }

  render() {
    if (this.state.message) {
      return (
        <pre
          className="h-full overflow-auto p-3 text-xs leading-relaxed"
          style={{ color: 'var(--red)', background: 'var(--surface)', fontFamily: 'var(--font-mono)' }}
        >
          {this.state.message}
          {'\n\n'}
          Corregí el código y pulsá «Actualizar vista previa».
        </pre>
      )
    }
    return this.props.children
  }
}

const Sandpack = dynamic(
  async () => {
    const mod = await import('@codesandbox/sandpack-react')
    return function SandpackInner({
      files,
      dependencies,
    }: {
      files: Record<string, string>
      dependencies: Record<string, string>
    }) {
      return (
        <mod.SandpackProvider
          template="react-ts"
          files={files}
          customSetup={{ dependencies }}
          theme="dark"
          options={{ recompileMode: 'delayed', recompileDelay: 400 }}
        >
          <mod.SandpackLayout style={{ height: '100%' }}>
            <mod.SandpackPreview
              style={{ height: '100%', border: '0', background: 'var(--bg)' }}
              showNavigator={false}
              showRefreshButton={false}
              showOpenInCodeSandbox={false}
            />
          </mod.SandpackLayout>
        </mod.SandpackProvider>
      )
    }
  },
  { ssr: false, loading: () => <div className="h-full animate-pulse rounded-md" style={{ background: 'var(--surface)' }} /> },
)

interface Props {
  code: string
  challenge: Challenge
}

export default function SandpackPreview({ code, challenge }: Props) {
  const { files, dependencies } = useMemo(() => {
    const baseFiles = challenge.sandpack?.files ?? {}
    const filename = baseFiles['/Solution.tsx'] ? '/Solution.tsx' : '/App.tsx'
    return {
      files: { ...baseFiles, [filename]: code },
      dependencies: {
        react: '^18.3.1',
        'react-dom': '^18.3.1',
        ...(challenge.sandpack?.dependencies ?? {}),
      },
    }
  }, [challenge, code])

  return (
    <PreviewErrorBoundary>
      <Sandpack files={files} dependencies={dependencies} />
    </PreviewErrorBoundary>
  )
}
