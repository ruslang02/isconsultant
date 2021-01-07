import Head from 'next/head'
import React from 'react'
import { Button } from 'semantic-ui-react'
import styles from '../styles/Home.module.css'

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Create Next App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Button>Click here!</Button>
    </div>
  )
}
