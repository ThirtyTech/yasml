import Image from "next/image";

const config = {
  logo: (
    <div style={{ display: "flex", alignItems: "center" }}>
      <Image
        src="/yasml.png"
        width={40}
        height={40}
        style={{ marginRight: 14 }}
        alt="yasml logo"
      />{" "}
      YASML Documentation
    </div>
  ),
  project: {
    link: "https://github.com/thirtytech/yasml",
  },
  useNextSeoProps() {
    return {
      titleTemplate: "%s – yasml",
    };
  },
  head: (
    <>
      <link
        rel="apple-touch-icon"
        sizes="180x180"
        href="/apple-touch-icon.png"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="32x32"
        href="/favicon-32x32.png"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="16x16"
        href="/favicon-16x16.png"
      />
      <link rel="manifest" href="/site.webmanifest" />
      {/* Global Site Tag (gtag.js) - Google Analytics */}
      <script
        async
        src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS}`}
      />
      <script
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS}', {
              page_path: window.location.pathname,
            });
          `,
        }}
      />
    </>
  ),
  docsRepositoryBase: "https://github.com/thirtytech/yasml/tree/main/docs",
  footer: {
    text: (
      <span>
        MIT {new Date().getFullYear()} ©{" "}
        <a href="https://thirtytech.net" target="_blank">
          ThirtyTech Inc
        </a>
        .
      </span>
    ),
  },
};

export default config;
