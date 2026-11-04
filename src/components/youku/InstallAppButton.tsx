import { useEffect, useState } from "react";
import { Download } from "lucide-react";
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
    const sync = () => {
      let remembered = false;
      try { remembered = localStorage.getItem("moviemax-app-installed") === "yes"; } catch { /* unavailable */ }
      setInstalled(remembered || standalone.matches || Boolean((navigator as Navigator & { standalone?: boolean }).standalone));
    };
    const ready = (event: Event) => {
      event.preventDefault(); setInstalled(false); setPrompt(event as InstallPrompt);
      try { localStorage.removeItem("moviemax-app-installed"); } catch { /* unavailable */ }
    };
    const done = () => {
      setInstalled(true); setPrompt(null);
      try { localStorage.setItem("moviemax-app-installed", "yes"); } catch { /* unavailable */ }
    };
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
      if (result.outcome === "accepted") {
        setInstalled(true);
        try { localStorage.setItem("moviemax-app-installed", "yes"); } catch { /* unavailable */ }
      }
    } finally { setPrompt(null); setBusy(false); }
  };
  if (installed) return null;
  return (
    <span className="shrink-0 rounded-full border border-border bg-secondary p-0.5" title={!prompt ? "App installation is not available in this browser yet" : "Install MOVIE MAX"}>
      <Button size="sm" variant="secondary" onClick={() => void install()} disabled={installed || !prompt || busy}
        aria-label={installed ? "App installed" : "Download app"}
        className="h-8 gap-1 rounded-full px-1.5 text-[10px] sm:px-3 sm:text-xs">
        <Download />
        <span>Download app</span>
      </Button>
    </span>
  );
}