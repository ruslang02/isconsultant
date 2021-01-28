import React from 'react'
import '../styles/globals.css'
import 'semantic-ui-css/semantic.min.css'



function MyApp({ Component, pageProps }: {Component: React.ComponentClass, pageProps: Record<string, string>}) {
  return <Component {...pageProps} />
}

export default MyApp