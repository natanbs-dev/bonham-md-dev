import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container">
      <div className="notfound">
        <div>
          <div className="notfound__code">404</div>
          <h1>Página não encontrada</h1>
          <p>O caminho que você digitou não existe — ou o artigo foi movido.</p>
          <Link href="/" className="btn btn--primary">
            Voltar ao início
          </Link>
        </div>
      </div>
    </div>
  );
}