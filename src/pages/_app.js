import { useEffect, useState } from 'react';
import Router, { useRouter } from 'next/router';
import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from 'next-themes';
import ReactGA from 'react-ga';
import TopBarProgress from 'react-topbar-progress-indicator';
import { SWRConfig } from 'swr';
import i18n from "i18next";
import { useTranslation, initReactI18next } from "react-i18next";

import progressBarConfig from '@/config/progress-bar/index';
import swrConfig from '@/config/swr/index';
import WorkspaceProvider from '@/providers/workspace';

import '@/styles/globals.css';

// Initialize language data
let rawdata = require('../messages/en.json');
let langCode = "en";

// Define langObject dynamically for easier expansion
let langObject = {
  [langCode]: {
    translation: rawdata
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources: langObject,
    lng: langCode,
    fallbackLng: "en",
    interpolation: {
      escapeValue: false
    }
  });

const App = ({ Component, pageProps }) => {
  const [progress, setProgress] = useState(false);
  const { t } = useTranslation();
  const router = useRouter();
  const swrOptions = swrConfig();

  // Handle page progress
  Router.events.on('routeChangeStart', () => setProgress(true));
  Router.events.on('routeChangeComplete', () => setProgress(false));
  TopBarProgress.config(progressBarConfig());

  // Initialize Google Analytics in production
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') {
      try {
        ReactGA.initialize(process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID);
      } catch (error) {
        console.error('Error initializing ReactGA:', error);
      }
    }
  }, []);

  // Track page views with Google Analytics
  useEffect(() => {
    const handleRouteChange = (url) => {
      if (process.env.NODE_ENV === 'production') {
        ReactGA.pageview(url);
      }
    };

    router.events.on('routeChangeComplete', handleRouteChange);

    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);

  return (
    <SessionProvider session={pageProps.session}>
      <SWRConfig value={swrOptions}>
        <ThemeProvider attribute="class">
          <WorkspaceProvider>
            {progress && <TopBarProgress />}
            <Component {...pageProps} />
          </WorkspaceProvider>
        </ThemeProvider>
      </SWRConfig>
    </SessionProvider>
  );
};

export default App;
