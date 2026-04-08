import { adminApi } from "@/app/lib/adminApi";

export function publicStorageObjectUrl(bucket: string, path: string): string {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
  if (!supabaseUrl) {
    return "";
  }
  const base = supabaseUrl.replace(/\/$/, "");
  return `${base}/storage/v1/object/public/${bucket}/${path}`;
}

/**
 * 上传到 Supabase（经后台签发 URL），并写入 cms_assets。
 * 公开 bucket 时返回可直连的 publicUrl，用于正文插图 / 封面 / 工具图标。
 */
export async function uploadToCmsAssets(
  token: string,
  file: File,
  bucket: "public-assets" | "private-assets" = "public-assets"
): Promise<{ publicUrl: string; path: string }> {
  const extRaw = (file.name.split(".").pop() || "").toLowerCase();
  const ext = extRaw.replace(/[^a-z0-9]+/g, "").slice(0, 8);
  const rand = `${Date.now()}_${Math.floor(Math.random() * 1_000_000)}`;
  const key = `${new Date().toISOString().slice(0, 10)}/${rand}${ext ? `.${ext}` : ""}`;
  const up = await adminApi.createAssetUploadUrl(token, {
    bucket,
    path: key,
    contentType: file.type || "application/octet-stream",
    upsert: false,
  });
  const signedUrl = String((up as any)?.signedUrl || "");
  if (!signedUrl) {
    throw new Error("无法获取上传 URL，请检查后台素材接口与 Supabase Storage");
  }
  const put = await fetch(signedUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type || "application/octet-stream" },
    body: file,
  });
  if (!put.ok) {
    throw new Error(`上传失败（HTTP ${put.status}）`);
  }
  const pub = "public-assets" === bucket ? publicStorageObjectUrl(bucket, key) : "";
  await adminApi.recordAsset(token, {
    bucket,
    path: key,
    publicUrl: pub,
    mime: file.type || "",
    sizeBytes: file.size,
  });
  return { publicUrl: pub, path: key };
}
