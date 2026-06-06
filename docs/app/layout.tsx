import type { Metadata } from 'next'
import Image from 'next/image'
import { GoogleAnalytics } from '@next/third-parties/google'
import { Footer, Layout, Navbar } from 'nextra-theme-docs'
import { Head } from 'nextra/components'
import { getPageMap } from 'nextra/page-map'
import 'nextra-theme-docs/style.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://yasml.thirtytech.net'),
  title: {
    default: 'YASML Documentation',
    template: '%s – yasml',
  },
  description:
    'Yet another react state management library. Type safe API over React Context',
  applicationName: 'Yasml',
  appleWebApp: { title: 'Yasml' },
  manifest: '/site.webmanifest',
  icons: {
    icon: [
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
  },
  openGraph: {
    type: 'website',
    title: 'Yasml',
    siteName: 'Yasml Documentation',
    url: 'https://yasml.thirtytech.net',
    description:
      'Yet another react state management library. Type safe API over React Context',
    images: 'https://yasml.thirtytech.net/opengraph.png',
  },
}

const navbar = (
  <Navbar
    logo={
      <span style={{ display: 'flex', alignItems: 'center' }}>
        <Image
          src="/yasml.png"
          width={40}
          height={40}
          style={{ marginRight: 14, width: 40, height: 40 }}
          alt="yasml logo"
        />
        YASML Documentation
      </span>
    }
    projectLink="https://github.com/thirtytech/yasml"
  />
)

const footer = (
  <Footer>
    MIT {new Date().getFullYear()} ©{' '}
    <a href="https://thirtytech.net" target="_blank" rel="noreferrer">
      ThirtyTech Inc
    </a>
    .
  </Footer>
)

export default async function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <Head />
      <body>
        <Layout
          navbar={navbar}
          pageMap={await getPageMap()}
          docsRepositoryBase="https://github.com/thirtytech/yasml/tree/main/docs"
          footer={footer}
        >
          {children}
        </Layout>
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS ?? ''} />
      </body>
    </html>
  )
}
