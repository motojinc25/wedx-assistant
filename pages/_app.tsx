import type { AppProps } from 'next/app';
import Head from 'next/head';
import 'antd/dist/reset.css';
import 'reactflow/dist/style.css';
import '@/styles/globals.css';

export default function App({ Component, pageProps: { ...pageProps } }: AppProps) {
  return (
    <>
      <Head>
        <title>WeDX Assistant</title>
        <meta name="description" content="WeDX Assistant for Azure IoT Edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" type="image/x-icon" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}
