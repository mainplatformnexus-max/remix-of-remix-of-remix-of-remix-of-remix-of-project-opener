import { useEffect, useState } from "react";
import { Check, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

type InstallPrompt = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function InstallAppButton() {
  const [prompt, setPrompt] = useState<InstallPrompt | null>(null);
  const [installed, setInstalled] = useState(false);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    const standalone = window.matchMedia("(display-mode: standalone)");
    const sync = () => setInstalled(standalone.matches || Boolean((navigator as Navigator & { standalone?: boolean }).standalone));
    const ready = (event: Event) => { event.preventDefault(); setPrompt(event as InstallPrompt); };
    const done = () => { setInstalled(true); setPrompt(null); };
    sync();
    window.addEventListener("beforeinstallprompt", ready);
    window.addEventListener("appinstalled", done);
    standalone.addEventListener("change", sync);
    return () => {
      window.removeEventListener("beforeinstallprompt", ready);
      window.removeEventListener("appinstalled", done);
      standalone.removeEventListener("change", sync);
    };
  }, []);
  const install = async () => {
    if (!prompt || busy) return;
    setBusy(true);
    try {
      await prompt.prompt();
      const result = await prompt.userChoice;
      if (result.outcome === "accepted") setInstalled(true);
    } finally { setPrompt(null); setBusy(false); }
  };
  return (
    <span className="shrink-0" title={installed ? "App installed" : !prompt ? "App installation is not available in this browser yet" : "Install MOVIE MAX"}>
      <Button size="sm" variant="secondary" onClick={() => void install()} disabled={installed || !prompt || busy}
        aria-label={installed ? "App installed" : "Download app"}
        className="h-8 gap-1 rounded-full px-1.5 text-[10px] sm:px-3 sm:text-xs">
        {installed ? <Check /> : <Download />}
        <span>{installed ? "Installed" : "Download app"}</span>
      </Button>
    </span>
  );
}