import G2iStudyHub from '@/components/G2iStudyHub'

export const metadata = {
  title: 'G2i Teoría — DevProbe',
  description:
    'Banco amplio de preguntas teóricas para el vetting de G2i: JavaScript, TypeScript, React, React Native, CSS, testing y soft skills, con respuestas modelo.',
}

export default function G2iTheoryPage() {
  return <G2iStudyHub initialTab="theory" />
}
