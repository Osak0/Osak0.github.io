import { assets } from "../../lib/documents";
import path from "node:path";
export function getStaticPaths() {
  return assets.map((asset) => ({
    params: { file: asset.file.slice(7) },
    props: { asset },
  }));
}
const types: Record<string, string> = {
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".pdf": "application/pdf",
  ".txt": "text/plain; charset=utf-8",
};
export function GET({
  props,
}: {
  props: { asset: { file: string; bytes: Buffer } };
}) {
  return new Response(new Uint8Array(props.asset.bytes), {
    headers: {
      "Content-Type":
        types[path.extname(props.asset.file).toLowerCase()] ||
        "application/octet-stream",
    },
  });
}
