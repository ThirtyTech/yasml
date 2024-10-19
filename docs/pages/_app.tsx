import { GoogleAnalytics } from "@next/third-parties/google";
import { AppProps } from "next/app";

const App = ({ Component, pageProps }: AppProps) => {
  return (
    <>
      <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS ?? ""} />
      {/* @ts-ignore */}
      <Component {...pageProps} />
    </>
  );
};

export default App;
