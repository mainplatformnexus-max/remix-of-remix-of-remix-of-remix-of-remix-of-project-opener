import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { FileText, FileDown, FileType, FileCode2, KeyRound } from "lucide-react";
import { toast } from "sonner";
import { Sidebar } from "@/components/youku/Sidebar";
import { TopBar } from "@/components/youku/TopBar";
import { MobileNav } from "@/components/youku/MobileNav";
import { getSiteOrigin } from "@/lib/api-token.functions";
import { docLegacyBlob, docStandaloneHtml, docToHtml, docToc, docxBlob, downloadBlob, fillDoc } from "@/lib/doc-export";
import guide from "@/content/moviemax-api.md?raw";

const TITLE = "MOVIE MAX Content API — Developer Guide";
const FILE = "MOVIEMAX-API-Guide";

export const Route = createFileRoute("/doc")({
  loader: () => getSiteOrigin(),
  head: () => ({
    meta: [
      { title: "Developer API Guide — MOVIE MAX" },
      { name: "description", content: "Full MOVIE MAX developer guide: search, English, Luganda VJ, Luo and Teso catalogs, play, download and subtitle links on our own domain, with API token access." },
      { property: "og:title", content: "Developer API Guide — MOVIE MAX" },
      { property: "og:description", content: "Build on the MOVIE MAX library: every endpoint, token access, code examples, downloadable as PDF, DOCX, DOC or Markdown." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: DocPage,
});

function DocPage() {
  const origin = Route.useLoaderData();
  const md = useMemo(() => fillDoc(guide, origin), [origin]);
  const html = useMemo(() => docToHtml(md), [md]);
  const toc = useMemo(() => docToc(md), [md]);
  const [busy, setBusy] = useState(false);

  const saveMd = () => downloadBlob(new Blob([md], { type: "text/markdown;charset=utf-8" }), `${FILE}.md`);
  const saveDoc = () => downloadBlob(docLegacyBlob(md, TITLE), `${FILE}.doc`);
  const saveDocx = async () => {
    setBusy(true);
    try {
      downloadBlob(await docxBlob(md, TITLE), `${FILE}.docx`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not build the Word file");
    } finally {
      setBusy(false);
    }
  };
  const savePdf = () => {
    const w = window.open("", "_blank");
    if (!w) return toast.error("Allow pop-ups to save the PDF");
    w.document.write(docStandaloneHtml(md, TITLE));
    w.document.close();
    toast.message("Choose “Save as PDF” in the print window");
    setTimeout(() => w.print(), 400);
  };

  const btn = "inline-flex items-center gap-2 rounded-full bg-card px-4 py-2 text-[13px] font-bold text-foreground ring-1 ring-border transition hover:bg-muted disabled:opacity-60";

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="lg:pl-[var(--sidebar-w)]">
        <div className="relative h-[56px] lg:h-14">
          <TopBar />
        </div>
        <main className="mx-auto max-w-6xl px-3 pb-28 sm:px-4 lg:px-8 lg:pb-16">
          <div className="mt-4 rounded-2xl bg-card/70 p-4 ring-1 ring-border sm:p-5">
            <p className="text-[12px] font-bold uppercase tracking-wide text-brand">Developers</p>
            <h1 className="mt-1 text-2xl font-black tracking-tight text-foreground lg:text-3xl">{TITLE}</h1>
            <p className="mt-2 break-all font-mono text-[13px] text-muted-foreground">{origin}/api/public/v1</p>
            <p className="mt-3 flex items-start gap-2 text-[13px] text-muted-foreground">
              <KeyRound className="mt-0.5 size-4 shrink-0 text-brand" />
              Every data call needs the API token created by the MOVIE MAX admin. Ask the admin for it, then send it as
              <code className="rounded bg-muted px-1 text-foreground">Authorization: Bearer &lt;token&gt;</code>.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" onClick={savePdf} className={btn}><FileDown className="size-4" /> PDF</button>
              <button type="button" onClick={saveDocx} disabled={busy} className={btn}><FileText className="size-4" /> {busy ? "Building…" : "DOCX"}</button>
              <button type="button" onClick={saveDoc} className={btn}><FileType className="size-4" /> DOC</button>
              <button type="button" onClick={saveMd} className={btn}><FileCode2 className="size-4" /> Markdown</button>
            </div>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
            <nav className="hidden lg:block">
              <div className="sticky top-20 max-h-[calc(100vh-6rem)] space-y-1 overflow-y-auto text-[13px]">
                {toc.map((t) => (
                  <a key={t.id} href={`#${t.id}`} className={`block rounded-lg px-2 py-1 transition hover:bg-card hover:text-foreground ${t.depth === 1 ? "font-bold text-foreground" : "pl-4 text-muted-foreground"}`}>
                    {t.text}
                  </a>
                ))}
              </div>
            </nav>
            <article className="api-doc min-w-0" dangerouslySetInnerHTML={{ __html: html }} />
          </div>
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
