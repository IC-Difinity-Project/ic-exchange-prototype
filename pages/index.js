/* eslint-disable @next/next/no-img-element */
// Next, React
import Head from "next/head"

import styles from "../ui/styles/Home.module.css"

import { GreetingSection } from "../ui/components/GreetingSection"
import { NftSection } from "../ui/components/NftSection"

import { ImageSection } from "../ui/components/ImageSection"

function HomePage() {
  return (
    <div className="overflow-hidden max-w-9xl mx-auto sm:px-4 flex flex-col min-h-screen">
      <NftSection />
      {/* <Head>
        <title>Internet Computer</title>
      </Head> */}
      {/* <main className={styles.main}> */}
      {/* <h3 className={styles.title}>
          Welcome to Next.js Internet Computer Starter Template!
        </h3>

        <img src="/logo.png" alt="DFINITY logo" className={styles.logo} /> */}

      {/* <NftSection /> */}
      {/* <GreetingSection /> */}
      {/* <ImageSection /> */}
      {/* </main> */}
    </div>
  )
}

export default HomePage
