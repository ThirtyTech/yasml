import nextra from 'nextra'

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  images: {
    unoptimized: true,
  },
};

// In Nextra 4 the theme and themeConfig options are gone — the theme is
// configured directly in app/layout.tsx via <Layout>, <Navbar> and <Footer>.
const withNextra = nextra({});

export default withNextra(nextConfig);
