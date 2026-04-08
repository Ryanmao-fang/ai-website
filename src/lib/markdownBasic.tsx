import { Fragment } from "react";

/**
 * 轻量 Markdown：标题、列表、代码块、链接、[图片](url) 与 ![alt](url) 图片 / 视频、
 * 单独成行的 bilibili / YouTube 链接（国内主推 B 站单独成行嵌入）。
 */

export function isVideoAssetUrl(url: string): boolean {
  const u = String(url).split("?")[0].toLowerCase();
  return /\.(mp4|webm|ogg|mov|m4v)$/i.test(u);
}

/** 解析单行中的 B 站 BV 号或旧版 av 号（用于官方 player 嵌入） */
function bilibiliFromLine(line: string): { bvid: string | null; aid: string | null } {
  const t = line.trim();
  const bv = t.match(/(?:https?:\/\/)?(?:www\.|m\.)?bilibili\.com\/video\/(BV[a-zA-Z0-9]{10,12})(?:\/|\?|$|#)?/i);
  if (bv) {
    return { bvid: bv[1], aid: null };
  }
  const av = t.match(/(?:https?:\/\/)?(?:www\.|m\.)?bilibili\.com\/video\/(av\d+)(?:\/|\?|$|#)?/i);
  if (av) {
    const num = av[1].replace(/^av/i, "");
    return { bvid: null, aid: num };
  }
  return { bvid: null, aid: null };
}

export function extractBilibiliEmbedFromMarkdown(md: string): { bvid: string } | { aid: string } | null {
  const flat = String(md || "");
  for (const line of flat.split("\n")) {
    const r = bilibiliFromLine(line);
    if (r.bvid) {
      return { bvid: r.bvid };
    }
    if (r.aid) {
      return { aid: r.aid };
    }
  }
  const bvMatch = flat.match(/bilibili\.com\/video\/(BV[a-zA-Z0-9]{10,12})/i);
  if (bvMatch) {
    return { bvid: bvMatch[1] };
  }
  const avMatch = flat.match(/bilibili\.com\/video\/(av\d+)/i);
  if (avMatch) {
    return { aid: avMatch[1].replace(/^av/i, "") };
  }
  return null;
}

function youtubeIdFromLine(line: string): string | null {
  const t = line.trim();
  const m1 = t.match(/(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]{6,})/);
  if (m1) {
    return m1[1];
  }
  const m2 = t.match(/(?:https?:\/\/)?youtu\.be\/([a-zA-Z0-9_-]{6,})/);
  if (m2) {
    return m2[1];
  }
  return null;
}

export function extractFirstVideoUrlFromMarkdown(md: string): string | null {
  const re = /!\[([^\]]*)\]\(([^)]+)\)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(String(md || ""))) !== null) {
    const url = m[2].trim();
    if (isVideoAssetUrl(url)) {
      return url;
    }
  }
  return null;
}

export function extractYoutubeIdFromMarkdown(md: string): string | null {
  const flat = String(md || "");
  for (const line of flat.split("\n")) {
    const id = youtubeIdFromLine(line);
    if (id) {
      return id;
    }
  }
  const a = flat.match(/(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]{6,})/);
  if (a) {
    return a[1];
  }
  const b = flat.match(/(?:https?:\/\/)?youtu\.be\/([a-zA-Z0-9_-]{6,})/);
  if (b) {
    return b[1];
  }
  return null;
}

function renderLinksOnly(text: string, keyPrefix: string): (string | JSX.Element)[] {
  const out: (string | JSX.Element)[] = [];
  let rest = text;
  let k = 0;
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
      <a
        key={`${keyPrefix}-a-${k++}`}
        href={url}
        target="_blank"
        rel="noreferrer"
        className="text-primary hover:underline"
      >
        {label}
      </a>
    );
    rest = rest.slice(m.index + m[0].length);
  }
  return out;
}

function renderInlineWithMedia(text: string, keyPrefix: string): React.ReactNode[] {
  const re = /!\[([^\]]*)\]\(([^)]+)\)/g;
  const out: React.ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  let k = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) {
      const chunk = text.slice(last, m.index);
      renderLinksOnly(chunk, `${keyPrefix}-l${k}`).forEach((node, i) => {
        out.push(<Fragment key={`${keyPrefix}-lk-${k}-${i}`}>{node}</Fragment>);
      });
      k += 1;
    }
    const alt = m[1];
    const url = m[2].trim();
    if (isVideoAssetUrl(url)) {
      out.push(
        <video
          key={`${keyPrefix}-v-${m.index}`}
          className="w-full max-w-3xl rounded-2xl border border-border bg-black/80 my-2"
          controls
          playsInline
          preload="metadata"
          src={url}
        >
          您的浏览器不支持视频播放
        </video>
      );
    } else {
      out.push(
        <img
          key={`${keyPrefix}-i-${m.index}`}
          src={url}
          alt={alt || ""}
          className="max-w-full h-auto rounded-2xl border border-border my-2"
          loading="lazy"
        />
      );
    }
    last = m.index + m[0].length;
  }
  if (last < text.length) {
    renderLinksOnly(text.slice(last), `${keyPrefix}-tail`).forEach((node, i) => {
      out.push(<Fragment key={`${keyPrefix}-tl-${i}`}>{node}</Fragment>);
    });
  }
  if (0 === out.length) {
    return renderLinksOnly(text, keyPrefix);
  }
  return out;
}

function BilibiliFrame({ bvid, aid }: { bvid?: string | null; aid?: string | null }) {
  const src = bvid
    ? `https://player.bilibili.com/player.html?bvid=${encodeURIComponent(bvid)}&high_quality=1&danmaku=0&autoplay=0`
    : aid
      ? `https://player.bilibili.com/player.html?aid=${encodeURIComponent(aid)}&high_quality=1&danmaku=0&autoplay=0&page=1`
      : "";
  if (!src) {
    return null;
  }
  return (
    <div className="w-full max-w-3xl aspect-video rounded-2xl overflow-hidden border border-border bg-black my-2">
      <iframe
        title="哔哩哔哩"
        className="w-full h-full"
        src={src}
        allow="fullscreen; autoplay; clipboard-write"
        allowFullScreen
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
}

function YoutubeFrame({ id }: { id: string }) {
  return (
    <div className="w-full max-w-3xl aspect-video rounded-2xl overflow-hidden border border-border bg-black my-2">
      <iframe
        title="YouTube"
        className="w-full h-full"
        src={`https://www.youtube-nocookie.com/embed/${id}`}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
    </div>
  );
}

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
        const bil = bilibiliFromLine(trimmed);
        if ((bil.bvid || bil.aid) && trimmed.length < 320) {
          return <BilibiliFrame key={idx} bvid={bil.bvid} aid={bil.aid} />;
        }
        const yt = youtubeIdFromLine(trimmed);
        if (yt && trimmed.length < 240) {
          return <YoutubeFrame key={idx} id={yt} />;
        }

        const mediaOnly = trimmed.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
        if (mediaOnly) {
          const alt = mediaOnly[1];
          const url = mediaOnly[2].trim();
          if (isVideoAssetUrl(url)) {
            return (
              <div key={idx} className="my-2">
                <video
                  className="w-full max-w-3xl rounded-2xl border border-border bg-black/80"
                  controls
                  playsInline
                  preload="metadata"
                  src={url}
                >
                  您的浏览器不支持视频播放
                </video>
              </div>
            );
          }
          return (
            <div key={idx} className="my-2">
              <img
                src={url}
                alt={alt || ""}
                className="max-w-full h-auto rounded-2xl border border-border"
                loading="lazy"
              />
            </div>
          );
        }

        if (trimmed.startsWith("### ")) {
          return (
            <h3 key={idx} className="text-lg font-semibold text-foreground">
              {renderInlineWithMedia(trimmed.slice(4), `h3-${idx}`).map((n, i) => (
                <Fragment key={i}>{n}</Fragment>
              ))}
            </h3>
          );
        }
        if (trimmed.startsWith("## ")) {
          return (
            <h2 key={idx} className="text-xl font-semibold text-foreground">
              {renderInlineWithMedia(trimmed.slice(3), `h2-${idx}`).map((n, i) => (
                <Fragment key={i}>{n}</Fragment>
              ))}
            </h2>
          );
        }
        if (trimmed.startsWith("# ")) {
          return (
            <h1 key={idx} className="text-2xl font-semibold text-foreground">
              {renderInlineWithMedia(trimmed.slice(2), `h1-${idx}`).map((n, i) => (
                <Fragment key={i}>{n}</Fragment>
              ))}
            </h1>
          );
        }

        const listLines = text.split("\n").filter((l) => l.trim().startsWith("- "));
        if (listLines.length >= 2 && listLines.length === text.split("\n").filter((l) => l.trim()).length) {
          return (
            <ul key={idx} className="list-disc pl-5 space-y-1">
              {listLines.map((l, i) => (
                <li key={i} className="text-muted-foreground">
                  {renderInlineWithMedia(l.trim().slice(2), `li-${idx}-${i}`).map((n, j) => (
                    <Fragment key={j}>{n}</Fragment>
                  ))}
                </li>
              ))}
            </ul>
          );
        }

        return (
          <p key={idx} className="text-muted-foreground whitespace-pre-wrap">
            {renderInlineWithMedia(text, `p-${idx}`).map((n, i) => (
              <Fragment key={i}>{n}</Fragment>
            ))}
          </p>
        );
      })}
    </div>
  );
}
