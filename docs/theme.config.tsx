import Image from "next/image";

const config = {
  logo: (
    <div style={{ display: "flex", alignItems: "center" }}>
      <Image
        src="/yasml.png"
        width={40}
        height={40}
        style={{ marginRight: 14, width: 40, height: 40 }}
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
      <meta property="og:title" content="Yasml" />
      <meta property="og:site_name" content="Yasml Documentation" />
      <meta property="og:url" content="https://yasml.thirtytech.net" />
      <meta
        property="og:description"
        content="Yet another react state management library. Type safe API over React Context"
      />
      <meta property="og:type" content="product" />
      <meta
        property="og:image"
        content="https://yasml.thirtytech.net/opengraph.png"
      />
    </>
  ),
  docsRepositoryBase: "https://github.com/thirtytech/yasml/tree/main/docs",
  footer: {
    content: (
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
