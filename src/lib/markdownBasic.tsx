import { Fragment } from "react";

/**
 * 极简 Markdown 渲染（无三方依赖）：支持段落、标题(#/##/###)、代码块```、无序列表(- )、链接[txt](url)
 * 目的：给 CMS 后台输入一个“够用且好看”的展示。
 */
export function renderMarkdownBasic(md: string): JSX.Element {
  const lines = String(md || "").replace(/\r\n/g, "\n").split("\n");

  const blocks: { type: string; lines: string[] }[] = [];
  let buf: string[] = [];
  let inCode = false;
  let codeBuf: string[] = [];

  const flushParagraph = () => {
    const text = buf.join("\n").trim();
    if (text) {
      blocks.push({ type: "p", lines: [text] });
    }
    buf = [];
  };

  for (const raw of lines) {
    const line = raw ?? "";
    if (line.startsWith("```")) {
      if (inCode) {
        blocks.push({ type: "code", lines: codeBuf.slice() });
        codeBuf = [];
        inCode = false;
      } else {
        flushParagraph();
        inCode = true;
      }
      continue;
    }
    if (inCode) {
      codeBuf.push(line);
      continue;
    }
    if (!line.trim()) {
      flushParagraph();
      continue;
    }
    buf.push(line);
  }
  flushParagraph();
  if (inCode && codeBuf.length) {
    blocks.push({ type: "code", lines: codeBuf.slice() });
  }

  const renderInline = (text: string): (string | JSX.Element)[] => {
    // very small link parser: [text](url)
    const out: (string | JSX.Element)[] = [];
    let rest = text;
    while (true) {
      const m = rest.match(/\[([^\]]+)\]\(([^)]+)\)/);
      if (!m || null == m.index) {
        out.push(rest);
        break;
      }
      const before = rest.slice(0, m.index);
      if (before) {
        out.push(before);
      }
      const label = m[1];
      const url = m[2];
      out.push(
        <a key={`${label}:${url}:${m.index}`} href={url} target="_blank" rel="noreferrer" className="text-primary hover:underline">
          {label}
        </a>
      );
      rest = rest.slice(m.index + m[0].length);
    }
    return out;
  };

  return (
    <div className="space-y-4 leading-relaxed">
      {blocks.map((b, idx) => {
        if ("code" === b.type) {
          return (
            <pre key={idx} className="rounded-2xl border border-border bg-muted/40 p-4 overflow-auto text-sm">
              <code>{b.lines.join("\n")}</code>
            </pre>
          );
        }

        const text = b.lines[0];
        const trimmed = text.trim();
        if (trimmed.startsWith("### ")) {
          return (
            <h3 key={idx} className="text-lg font-semibold text-foreground">
              {renderInline(trimmed.slice(4))}
            </h3>
          );
        }
        if (trimmed.startsWith("## ")) {
          return (
            <h2 key={idx} className="text-xl font-semibold text-foreground">
              {renderInline(trimmed.slice(3))}
            </h2>
          );
        }
        if (trimmed.startsWith("# ")) {
          return (
            <h1 key={idx} className="text-2xl font-semibold text-foreground">
              {renderInline(trimmed.slice(2))}
            </h1>
          );
        }

        const listLines = text.split("\n").filter((l) => l.trim().startsWith("- "));
        if (listLines.length >= 2 && listLines.length === text.split("\n").filter((l) => l.trim()).length) {
          return (
            <ul key={idx} className="list-disc pl-5 space-y-1">
              {listLines.map((l, i) => (
                <li key={i} className="text-muted-foreground">
                  {renderInline(l.trim().slice(2))}
                </li>
              ))}
            </ul>
          );
        }

        return (
          <p key={idx} className="text-muted-foreground whitespace-pre-wrap">
            {renderInline(text).map((n, i) => (
              <Fragment key={i}>{n}</Fragment>
            ))}
          </p>
        );
      })}
    </div>
  );
}

