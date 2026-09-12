/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  output: "export",
  basePath: "/bonham-md-dev",
  trailingSlash: true,
  /* Em modo de exportação estática os headers de segurança não se aplicam
     (não há servidor). O GitHub Pages já envia os defaults:
     X-Content-Type-Options, X-Frame-Options, Referrer-Policy, etc.
     Os headers via next.config voltam a valer se algum dia hospedar num runtime. */
};

export default nextConfig;