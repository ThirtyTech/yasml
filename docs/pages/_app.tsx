import { GoogleAnalytics } from "@next/third-parties/google";
import { AppProps } from "next/app";

const App = ({ Component, pageProps }: AppProps) => {
  return (
    <>
      <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS ?? ""} />
      {/* Note: No idea why this type is broken. Works in a new app. Workspace related? Babel+Core in the middle. */}
      {/* @ts-ignore */}
      <Component {...pageProps} />
    </>
  );
};

export default App;
