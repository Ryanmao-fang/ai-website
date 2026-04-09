import { useRef, useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { uploadToCmsAssets } from "@/lib/cmsMediaUpload";
import { Upload } from "lucide-react";

type Props = {
  token: string | null;
  label: string;
  helper?: string;
  value: string;
  onChange: (url: string) => void;
  previewClassName?: string;
};

/** 封面或图标：URL 或上传 */
export function CmsImageUrlField({ token, label, helper, value, onChange, previewClassName }: Props) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const isHttp = /^https?:\/\//i.test(String(value || "").trim());

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-end gap-2">
        <div className="flex-1 min-w-[200px]">
          <p className="text-xs text-muted-foreground mb-1">{label}</p>
          <Input value={value} onChange={(e) => onChange(e.target.value)} className="rounded-full" placeholder="https://… 或上传后自动填入" />
        </div>
        <div>
          <input ref={ref} type="file" accept="image/*" className="hidden" onChange={(e) => void pick(e.target.files)} />
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-full gap-1"
            disabled={!token || busy}
            onClick={() => ref.current?.click()}
          >
            <Upload className="w-3.5 h-3.5" />
            {busy ? "上传中" : "上传图片"}
          </Button>
        </div>
      </div>
      {helper ? <p className="text-[11px] text-muted-foreground/90">{helper}</p> : null}
      {err ? <p className="text-xs text-destructive">{err}</p> : null}
      {isHttp ? (
        <div className={`rounded-2xl border border-border overflow-hidden bg-muted/20 ${previewClassName || "w-24 h-24"}`}>
          <img src={value} alt="" className="w-full h-full object-cover" />
        </div>
      ) : null}
    </div>
  );

  async function pick(files: FileList | null) {
    if (!token || !files?.length) {
      return;
    }
    setBusy(true);
    setErr("");
    try {
      const { publicUrl } = await uploadToCmsAssets(token, files[0], "public-assets");
      if (!publicUrl) {
        throw new Error("未得到公网 URL：请配置 VITE_SUPABASE_URL");
      }
      onChange(publicUrl);
    } catch (e) {
      setErr((e as Error)?.message || "上传失败");
    } finally {
      setBusy(false);
      if (ref.current) {
        ref.current.value = "";
      }
    }
  }
}
