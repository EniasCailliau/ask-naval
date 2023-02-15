import type { AppProps } from 'next/app'
import { Analytics } from '@vercel/analytics/react'

import Layout, { getLayout } from '../components/Layout'

import '@vercel/examples-ui/globals.css'

function App({ Component, pageProps }: AppProps) {
  // const Layout = getLayout<LayoutProps>(Component)

  return (
    <Layout
      title="prompt-app"
      path="prompt-app"
      description="Prompt App"
    >
      <Component {...pageProps} />
      <Analytics />
    </Layout>
  )
}

export default App
