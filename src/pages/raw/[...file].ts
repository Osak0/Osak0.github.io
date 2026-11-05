import { documents } from "../../lib/documents";
export function getStaticPaths() {
  return documents.map((doc) => ({
    params: { file: doc.file },
    props: { doc },
  }));
}
export function GET({ props }: { props: { doc: { raw: string } } }) {
  return new Response(props.doc.raw, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
