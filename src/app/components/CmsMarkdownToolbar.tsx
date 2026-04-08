import { useRef, useState } from "react";
import { Button } from "./ui/button";
import { uploadToCmsAssets } from "@/lib/cmsMediaUpload";
import { ImageIcon, Video, Link2 } from "lucide-react";

type Props = {
  token: string | null;
  markdown: string;
  onChangeMarkdown: (next: string) => void;
};

/**
 * 在 Markdown 末尾插入图片/视频语法；B 站 / YouTube 请用按钮插入「单独一行」视频页链接（渲染器会嵌播放器）。
 * 图片：![说明](url)  ·  视频文件：![讲解](url.mp4)
 */
export function CmsMarkdownToolbar({ token, markdown, onChangeMarkdown }: Props) {
  const imgRef = useRef<HTMLInputElement>(null);
  const vidRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const append = (snippet: string) => {
    const base = markdown.trimEnd();
    const sep = base.length > 0 && !base.endsWith("\n") ? "\n\n" : "\n";
    onChangeMarkdown(`${base}${sep}${snippet}\n`);
  };

  const onPick = async (files: FileList | null, kind: "image" | "video") => {
    if (!token || !files?.length) {
      return;
    }
    setBusy(true);
    setErr("");
    try {
      const f = files[0];
      const { publicUrl } = await uploadToCmsAssets(token, f, "public-assets");
      if (!publicUrl) {
        throw new Error("未得到公网 URL：请配置 VITE_SUPABASE_URL，并确认 bucket 为 public-assets");
      }
      const label = kind === "image" ? "配图" : "讲解视频";
      append(`![${label}](${publicUrl})`);
    } catch (e) {
      setErr((e as Error)?.message || "上传失败");
    } finally {
      setBusy(false);
      if (imgRef.current) {
        imgRef.current.value = "";
      }
      if (vidRef.current) {
        vidRef.current.value = "";
      }
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-muted/30 p-3 space-y-2">
      <p className="text-xs text-muted-foreground">
        插图/视频会写入正文 Markdown。国内用户请优先用「B站链接」（需
        bilibili.com 视频页完整链接，短链 b23.tv 请先浏览器打开后复制地址栏）。YouTube 仅作境外补充。
      </p>
      <div className="flex flex-wrap gap-2 items-center">
        <input
          ref={imgRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => void onPick(e.target.files, "image")}
        />
        <input
          ref={vidRef}
          type="file"
          accept="video/*,audio/*"
          className="hidden"
          onChange={(e) => void onPick(e.target.files, "video")}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="rounded-full h-8 text-xs gap-1"
          disabled={!token || busy}
          onClick={() => imgRef.current?.click()}
        >
          <ImageIcon className="w-3.5 h-3.5" />
          上传插图
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="rounded-full h-8 text-xs gap-1"
          disabled={!token || busy}
          onClick={() => vidRef.current?.click()}
        >
          <Video className="w-3.5 h-3.5" />
          上传视频
        </Button>
        <Button
          type="button"
          variant="default"
          size="sm"
          className="rounded-full h-8 text-xs gap-1 bg-primary hover:bg-accent"
          disabled={busy}
          onClick={() => {
            const url = window.prompt("粘贴哔哩哔哩视频页链接（需含 bilibili.com/video/BV… 或 /video/av…）");
            if (url?.trim()) {
              append(String(url).trim());
            }
          }}
        >
          <Link2 className="w-3.5 h-3.5" />
          插入 B 站链接行
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="rounded-full h-8 text-xs gap-1"
          disabled={busy}
          onClick={() => {
            const url = window.prompt("（可选）粘贴 YouTube 链接，境内用户通常无法播放");
            if (url?.trim()) {
              append(String(url).trim());
            }
          }}
        >
          <Link2 className="w-3.5 h-3.5" />
          YouTube（可选）
        </Button>
        {busy ? <span className="text-xs text-muted-foreground">上传中…</span> : null}
      </div>
      {err ? <p className="text-xs text-destructive">{err}</p> : null}
    </div>
  );
}
