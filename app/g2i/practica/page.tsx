import G2iStudyHub from '@/components/G2iStudyHub'

export const metadata = {
  title: 'G2i Práctica — DevProbe',
  description:
    'Ejercicios de live coding estilo G2i con premisa, código base para copiar a un sandbox y solución completa para comparar.',
}

export default function G2iPracticePage() {
  return <G2iStudyHub initialTab="practice" />
}
