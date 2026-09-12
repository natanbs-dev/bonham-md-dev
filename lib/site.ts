export const site = {
  name: "barbosa",
  author: "barbosa.md",
  domain: "barbosa.md",
  url:
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.NODE_ENV === "production"
      ? `https://barbosa.md`
      : "http://localhost:3000"),
  email: "hello@bonham.dev",
  description:
    "Blog de programação: guias práticos, boas práticas e reflexões sobre engenharia de software, ferramentas e produtividade.",
  github: "https://github.com/",
} as const;

