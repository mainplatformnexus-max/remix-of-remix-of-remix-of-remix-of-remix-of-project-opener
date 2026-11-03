import { useEffect, useState } from "react";
import { Loader2, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CardLogo } from "@/components/auth/PaymentLogos";
import { checkWhopPayment } from "@/lib/whop.functions";

/**
 * Whop card payment. Whop's embedded/express checkout refuses this account
 * ("This checkout is no longer available"), while Whop's own hosted checkout
 * works — so the pay button opens that real Whop checkout in a floating
 * window on top of the page (no new tab). While it is open we ask Whop every
 * few seconds whether the transaction was paid.
 */
export default function WhopEmbed({
  sessionId,
  txId,
  onDone,
}: {
  sessionId: string;
  txId?: string | undefined;
  email?: string | undefined;
  onDone?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const url = sessionId.startsWith("http") ? sessionId : `https://whop.com/checkout/${sessionId}/`;

  useEffect(() => {
    if (!open || !txId) return;
    let stop = false;
    const t = setInterval(async () => {
      try {
        const r = await checkWhopPayment({ data: { txId } });
        if (!stop && r.paid) {
          stop = true;
          setOpen(false);
          onDone?.();
        }
      } catch {
        /* keep waiting */
      }
    }, 4000);
    return () => {
      stop = true;
      clearInterval(t);
    };
  }, [open, txId, onDone]);

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setLoaded(false);
          setOpen(true);
        }}
        className="flex h-11 w-full items-center justify-center gap-2 rounded-full bg-foreground text-[14px] font-bold text-background transition hover:opacity-90"
      >
        <span className="rounded-md bg-white px-1.5 py-1"><CardLogo /></span> Pay with card · Whop
      </button>
      <Dialog
        open={open}
        onOpenChange={(v) => {
          setOpen(v);
          if (!v) onDone?.();
        }}
      >
        <DialogContent
          onInteractOutside={(e) => e.preventDefault()}
          className="h-[min(88vh,760px)] w-[calc(100vw-1rem)] max-w-[460px] overflow-hidden p-0 [&>button]:hidden"
        >
          <DialogHeader className="sr-only">
            <DialogTitle>Pay with card</DialogTitle>
          </DialogHeader>
          <button
            type="button"
            aria-label="Close"
            onClick={() => {
              setOpen(false);
              onDone?.();
            }}
            className="absolute right-2 top-2 z-10 grid size-8 place-items-center rounded-full bg-background/90 text-foreground shadow"
          >
            <X className="size-4" />
          </button>
          {!loaded && (
            <div className="absolute inset-0 grid place-items-center">
              <Loader2 className="size-6 animate-spin opacity-60" />
            </div>
          )}
          <iframe
            title="Whop secure checkout"
            src={url}
            onLoad={() => setLoaded(true)}
            allow="payment *; publickey-credentials-get *"
            className="h-full w-full border-0"
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
