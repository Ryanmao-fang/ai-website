import { useEffect, useMemo, useState } from "react";
import { adminApi } from "../../lib/adminApi";
import { useAdmin } from "../../context/AdminContext";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";

function publicObjectUrl(bucket: string, path: string): string {
  if (!supabaseUrl) {
    return "";
  }
  const base = supabaseUrl.replace(/\/$/, "");
  return `${base}/storage/v1/object/public/${bucket}/${path}`;
}

export function AdminAssets() {
  const { token } = useAdmin();
  const [items, setItems] = useState<any[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [bucket, setBucket] = useState<"public-assets" | "private-assets">("public-assets");
  const [uploading, setUploading] = useState(false);

  const filtered = useMemo(() => items, [items]);

  const reload = async () => {
    if (!token) {
      return;
    }
    setLoading(true);
    setError("");
    try {
      const payload = await adminApi.listAssets(token, q || undefined);
      setItems(((payload as any)?.items || []) as any[]);
    } catch (e) {
      setError((e as Error)?.message || "加载失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const uploadFiles = async (files: FileList | null) => {
    if (!token || !files || 0 === files.length) {
      return;
    }
    setUploading(true);
    setError("");
    try {
      for (const f of Array.from(files)) {
        const extRaw = (f.name.split(".").pop() || "").toLowerCase();
        const ext = extRaw.replace(/[^a-z0-9]+/g, "").slice(0, 8);
        const rand = `${Date.now()}_${Math.floor(Math.random() * 1000000)}`;
        const key = `${new Date().toISOString().slice(0, 10)}/${rand}${ext ? `.${ext}` : ""}`;
        const up = await adminApi.createAssetUploadUrl(token, { bucket, path: key, contentType: f.type, upsert: false });
        const signedUrl = String((up as any)?.signedUrl || "");
        if (!signedUrl) {
          throw new Error("无法获取上传 URL");
        }
        const put = await fetch(signedUrl, { method: "PUT", headers: { "Content-Type": f.type }, body: f });
        if (!put.ok) {
          throw new Error(`上传失败（${put.status}）`);
        }
        const pub = "public-assets" === bucket ? publicObjectUrl(bucket, key) : "";
        await adminApi.recordAsset(token, {
          bucket,
          path: key,
          publicUrl: pub,
          mime: f.type,
          sizeBytes: f.size,
        });
      }
      await reload();
    } catch (e) {
      setError((e as Error)?.message || "上传失败");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="rounded-3xl border-border p-5 bg-white">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[220px]">
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="搜索 path / mime" className="rounded-full" />
          </div>
          <select
            value={bucket}
            onChange={(e) => setBucket(e.target.value as any)}
            className="h-10 rounded-full border border-border bg-white px-4 text-sm"
          >
            <option value="public-assets">public-assets</option>
            <option value="private-assets">private-assets</option>
          </select>
          <Button className="rounded-full" onClick={() => void reload()} disabled={loading}>
            刷新
          </Button>
          <label className="inline-flex">
            <input
              type="file"
              className="hidden"
              multiple
              accept="image/*,video/*"
              onChange={(e) => void uploadFiles(e.target.files)}
              disabled={uploading}
            />
            <span className="inline-flex items-center justify-center rounded-full bg-primary hover:bg-accent text-primary-foreground px-4 h-10 text-sm font-medium cursor-pointer">
              {uploading ? "上传中…" : "上传"}
            </span>
          </label>
        </div>
        {error ? <p className="text-sm text-destructive mt-3">{error}</p> : null}
        {!supabaseUrl ? (
          <p className="text-xs text-muted-foreground mt-3">
            未配置 <code className="px-1 bg-muted rounded">VITE_SUPABASE_URL</code>，public bucket 的可访问 URL 将无法自动生成。
          </p>
        ) : null}
      </Card>

      <Card className="rounded-3xl border-border p-5 bg-white">
        <div className="flex items-center justify-between mb-3">
          <p className="font-semibold text-foreground">素材列表</p>
          <p className="text-xs text-muted-foreground">{filtered.length} 条</p>
        </div>
        <div className="space-y-2">
          {filtered.map((a) => (
            <div key={a.id} className="rounded-2xl border border-border p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="rounded-full border-0 text-xs">
                      {a.bucket}
                    </Badge>
                    <span className="text-sm font-medium text-foreground truncate">{a.path}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{a.mime || "unknown"} · {a.size_bytes || 0} bytes</p>
                  {a.public_url ? (
                    <p className="text-xs text-primary mt-1 break-all">{a.public_url}</p>
                  ) : null}
                </div>
                {a.public_url ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(String(a.public_url));
                      } catch {
                        // ignore
                      }
                    }}
                  >
                    复制URL
                  </Button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

