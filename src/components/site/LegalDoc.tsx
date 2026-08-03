import { Fragment, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { formatLegalDate } from "@/lib/legal";

/* ------------------------------------------------------------------ *
 * Minimal, safe Markdown subset renderer (no dangerouslySetInnerHTML)
 * Supports: ## / ### headings, paragraphs, "- " lists, "1." lists,
 * pipe tables, **bold**, and inline links [text](url).
 * ------------------------------------------------------------------ */

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const out: ReactNode[] = [];
  // Split on **bold** and [text](url)
  const re = /\*\*([^*]+)\*\*|\[([^\]]+)\]\(([^)\s]+)\)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    if (m[1]) {
      out.push(
        <strong key={`${keyPrefix}-b${i}`} className="font-semibold text-foreground">
          {m[1]}
        </strong>,
      );
    } else if (m[2] && m[3]) {
      const href = m[3];
      const internal = href.startsWith("/");
      out.push(
        internal ? (
          <Link key={`${keyPrefix}-l${i}`} to={href} className="text-rose-gold hover:underline">
            {m[2]}
          </Link>
        ) : (
          <a
            key={`${keyPrefix}-l${i}`}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-rose-gold hover:underline"
          >
            {m[2]}
          </a>
        ),
      );
    }
    last = m.index + m[0].length;
    i++;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

function splitRow(line: string) {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((c) => c.trim());
}

const isDivider = (line: string) => /^\|?[\s:-]+\|[\s|:-]*$/.test(line.trim());

export function LegalContent({ content }: { content: string }) {
  const lines = content.replace(/\r\n/g, "\n").split("\n");
  const blocks: ReactNode[] = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      i++;
      continue;
    }

    // Headings
    if (trimmed.startsWith("### ")) {
      blocks.push(
        <h3 key={key++} className="mt-8 font-serif text-lg text-foreground">
          {renderInline(trimmed.slice(4), `h3-${key}`)}
        </h3>,
      );
      i++;
      continue;
    }
    if (trimmed.startsWith("## ")) {
      blocks.push(
        <h2 key={key++} className="mt-10 border-b border-border/50 pb-2 font-serif text-2xl text-foreground">
          {renderInline(trimmed.slice(3), `h2-${key}`)}
        </h2>,
      );
      i++;
      continue;
    }
    if (trimmed.startsWith("# ")) {
      blocks.push(
        <h2 key={key++} className="mt-10 font-serif text-2xl text-foreground">
          {renderInline(trimmed.slice(2), `h1-${key}`)}
        </h2>,
      );
      i++;
      continue;
    }

    // Table
    if (trimmed.startsWith("|") && i + 1 < lines.length && isDivider(lines[i + 1])) {
      const header = splitRow(trimmed);
      i += 2;
      const rows: string[][] = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        rows.push(splitRow(lines[i]));
        i++;
      }
      blocks.push(
        <div key={key++} className="mt-5 overflow-x-auto rounded-2xl glass">
          <table className="w-full text-sm">
            <thead className="border-b border-border/50 text-xs text-muted-foreground">
              <tr>
                {header.map((h, hi) => (
                  <th key={hi} className="px-4 py-3 text-right font-medium">
                    {renderInline(h, `th-${key}-${hi}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, ri) => (
                <tr key={ri} className="border-t border-border/30">
                  {r.map((c, ci) => (
                    <td key={ci} className="px-4 py-3 align-top">
                      {renderInline(c, `td-${key}-${ri}-${ci}`)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      );
      continue;
    }

    // Unordered list
    if (/^[-*]\s/.test(trimmed)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*]\s/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^[-*]\s/, ""));
        i++;
      }
      blocks.push(
        <ul key={key++} className="mt-4 list-disc space-y-2 pr-6 text-muted-foreground">
          {items.map((it, ii) => (
            <li key={ii} className="leading-relaxed">{renderInline(it, `li-${key}-${ii}`)}</li>
          ))}
        </ul>,
      );
      continue;
    }

    // Paragraph (collect consecutive non-empty, non-special lines)
    const para: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      !/^([-*]\s|#{1,3}\s|\|)/.test(lines[i].trim())
    ) {
      para.push(lines[i].trim());
      i++;
    }
    blocks.push(
      <p key={key++} className="mt-4 leading-relaxed text-muted-foreground">
        {para.map((p, pi) => (
          <Fragment key={pi}>
            {pi > 0 && <br />}
            {renderInline(p, `p-${key}-${pi}`)}
          </Fragment>
        ))}
      </p>,
    );
  }

  return <div className="legal-body">{blocks}</div>;
}

export function LegalPage({
  eyebrow,
  title,
  intro,
  content,
  updatedAt,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  content: string;
  updatedAt?: string | null;
}) {
  return (
    <article className="mx-auto max-w-4xl px-4 py-16 md:px-8" dir="rtl">
      <nav aria-label="פירורי לחם" className="mb-6 text-xs text-muted-foreground">
        <Link to="/" className="hover:text-primary">בית</Link> / <span className="text-foreground">{title}</span>
      </nav>
      <header className="text-center">
        {eyebrow && <span className="text-xs uppercase tracking-[0.3em] text-rose-gold">{eyebrow}</span>}
        <h1 className="mt-3 font-serif text-4xl md:text-5xl">{title}</h1>
        {intro && <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">{intro}</p>}
        {updatedAt && (
          <p className="mt-4 text-xs text-muted-foreground">
            עדכון אחרון: {formatLegalDate(updatedAt)}
          </p>
        )}
      </header>

      <div className="mt-12 rounded-3xl glass p-6 md:p-10">
        {content ? (
          <LegalContent content={content} />
        ) : (
          <p className="text-muted-foreground">המסמך בעדכון. לשאלות דחופות ניתן ליצור איתנו קשר.</p>
        )}
      </div>

      <div className="mt-12 rounded-2xl glass-strong p-8 text-center">
        <h2 className="font-serif text-2xl">יש שאלה על המסמך?</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          צוות יהלום לבית זמין בטלפון 053-320-6500 ובדוא״ל moshemalkaa@gmail.com.
        </p>
        <Link to="/contact" className="mt-5 inline-block rounded-full btn-rose px-6 py-3 text-sm font-semibold hover:btn-rose-hover">
          צור קשר
        </Link>
      </div>
    </article>
  );
}
