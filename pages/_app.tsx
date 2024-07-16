import type { AppProps } from 'next/app';
import { AuthProvider } from '../contexts/AuthContext';
import Header from '../components/Header';
import '../styles/global.css';
import Head from 'next/head';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" />
      <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@100..900&display=swap" rel="stylesheet" />
      </Head>
      <AuthProvider>
      <Header />
      <main>
        <div className='inner'>
          <Component {...pageProps} />
        </div>
      </main>
    </AuthProvider>
    </>
  );
}
