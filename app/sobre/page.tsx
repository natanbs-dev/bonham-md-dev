import { site } from "@/lib/site";
import Reveal from "@/components/reveal";

export const metadata = {
  title: "Sobre",
  description: "Sobre o autor e desenvolvedor por trás deste blog.",
};

const skills = [
  "TypeScript",
  "React",
  "Next.js",
  "Node.js",
  "Python",
  "PostgreSQL",
  "Docker",
  "Linux",
  "Git",
  "REST",
  "Vitest",
  "Tailwind",
];

const timeline = [
  {
    role: "Engenheiro de Software",
    when: "2024 — presente",
    desc: "Desenvolvendo produtos web de alto desempenho, com foco em experiência do usuário e qualidade de código.",
  },
  {
    role: "Desenvolvedor Front-end",
    when: "2022 — 2024",
    desc: "Construí interfaces e componentes reutilizáveis para plataformas usadas por milhares de pessoas.",
  },
  {
    role: "Início da jornada",
    when: "2020",
    desc: "Comecei com Python e automações; de lá para cá não parei de aprender e de escrever sobre isso.",
  },
];

export default function AboutPage() {
  return (
    <div className="container" style={{ paddingBottom: 80 }}>
      <div className="page-head">
        <span className="hi">#sobre</span>
        <h1>Olá, eu sou o {site.author}.</h1>
        <p>
          Desenvolvedor de software que acredita em código legível, interfaces
          rápidas e em documentar o próprio aprendizado.
        </p>
      </div>

      <RevealWrap>
        <div className="about-card">
          <div className="about-card__head">
            <div className="avatar">~/</div>
            <div>
              <h1>{site.author}</h1>
              <p>Engenheiro de software · criador deste blog</p>
            </div>
          </div>

          <div className="about-card__body">
            <section className="about-section">
              <h2>Um pouco sobre mim</h2>
              <p style={{ color: "var(--text-2)", fontSize: 16 }}>
                Escrevo código e escrevo sobre código. Este blog nasceu da
                vontade de transformar as anotações soltas do meu dia a dia em
                conteúdo útil para outras pessoas desenvolvedoras — tutoriais,
                decisões de projeto e dicas de ferramentas que realmente fazem
                diferença.
              </p>
            </section>

            <section className="about-section">
              <h2>Tecnologias que uso no dia a dia</h2>
              <div className="skills">
                {skills.map((s) => (
                  <span className="skill-chip" key={s}>
                    {s}
                  </span>
                ))}
              </div>
            </section>

            <section className="about-section">
              <h2>Trajetória</h2>
              <ul className="timeline">
                {timeline.map((item) => (
                  <li key={item.role}>
                    <h3>{item.role}</h3>
                    <span className="when">{item.when}</span>
                    <p>{item.desc}</p>
                  </li>
                ))}
              </ul>
            </section>

            <section className="about-section">
              <h2>Vamos conversar</h2>
              <p style={{ color: "var(--text-2)", fontSize: 16 }}>
                Adoro trocar ideia sobre tecnologia, carreira e produtividade.
                Me chame por e-mail ou acompanhe as publicações via RSS.
              </p>
              <a className="btn btn--primary" href={`mailto:${site.email}`}>
                Enviar e-mail
              </a>{" "}
              <a className="btn btn--ghost" href="/rss.xml">
                Assinar RSS
              </a>
            </section>
          </div>
        </div>
      </RevealWrap>
    </div>
  );
}

function RevealWrap({ children }: { children: React.ReactNode }) {
  return <Reveal>{children}</Reveal>;
}