"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import type { SearchHit } from "@/lib/admin/search";

const TYPE_BADGE: Record<SearchHit["type"], string> = {
  company: "bg-[#3987e5]/15 text-[#6da7ec]",
  recruiter: "bg-violet-500/15 text-violet-300",
  candidate: "bg-emerald-500/15 text-emerald-300",
  project: "bg-[#fab219]/15 text-[#fab219]",
};

/**
 * The console's front door: ⌘K / Ctrl+K entity search + link decoder.
 * Paste a name, an email, an invite URL or a bare token — Enter opens the hit.
 */
export default function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<SearchHit[]>([]);
  const [active, setActive] = useState(0);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const openPalette = useCallback(() => {
    setQuery("");
    setHits([]);
    setActive(0);
    setOpen(true);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (open) setOpen(false);
        else openPalette();
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, openPalette]);

  // Focus the input once the palette actually mounts — a real DOM side
  // effect (not a state reset, that lives in openPalette above).
  useEffect(() => {
    if (!open) return;
    const id = setTimeout(() => inputRef.current?.focus(), 10);
    return () => clearTimeout(id);
  }, [open]);

  useEffect(() => {
    if (!open || query.trim().length < 2) {
      setHits([]); // eslint-disable-line react-hooks/set-state-in-effect -- clearing stale results is part of syncing with the debounced search API below, not derived render state.
      return;
    }
    const timer = setTimeout(async () => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/search?q=${encodeURIComponent(query)}`, {
          signal: controller.signal,
        });
        if (res.ok) {
          const data = await res.json();
          setHits(data.hits ?? []);
          setActive(0);
        }
      } catch {
        /* aborted or offline — keep previous hits */
      } finally {
        setLoading(false);
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [query, open]);

  const go = useCallback(
    (hit: SearchHit | undefined) => {
      if (!hit) return;
      setOpen(false);
      router.push(hit.href);
    },
    [router]
  );

  return (
    <>
      <button
        type="button"
        onClick={openPalette}
        className="flex cursor-pointer items-center gap-2 rounded-lg border border-[var(--it-hairline)] px-3 py-1.5 text-xs text-slate-400 transition-colors hover:border-[#3d3b34] hover:text-slate-200"
      >
        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z" />
        </svg>
        Search everything…
        <kbd className="rounded border border-[var(--it-hairline)] bg-[var(--it-bg)] px-1.5 py-0.5 font-mono text-[10px] text-slate-500">⌘K</kbd>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 px-4 pt-[15vh] backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-xl overflow-hidden rounded-xl border border-[#3d3b34] bg-[var(--it-surface)] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-label="Console search"
          >
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  setActive((a) => Math.min(a + 1, hits.length - 1));
                } else if (e.key === "ArrowUp") {
                  e.preventDefault();
                  setActive((a) => Math.max(a - 1, 0));
                } else if (e.key === "Enter") {
                  e.preventDefault();
                  go(hits[active]);
                }
              }}
              placeholder="Company, recruiter, candidate, project — or paste an invite link…"
              className="w-full border-b border-[var(--it-hairline)] bg-transparent px-4 py-3.5 text-sm text-white outline-none placeholder:text-slate-600"
            />
            <div className="max-h-80 overflow-y-auto">
              {hits.length === 0 ? (
                <p className="px-4 py-6 text-center text-sm text-slate-500">
                  {loading ? "Searching…" : query.trim().length < 2 ? "Type at least 2 characters" : "No matches"}
                </p>
              ) : (
                hits.map((hit, i) => (
                  <button
                    key={`${hit.type}-${hit.id}`}
                    type="button"
                    onMouseEnter={() => setActive(i)}
                    onClick={() => go(hit)}
                    className={`flex w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-left ${
                      i === active ? "bg-[var(--it-hairline)]/60" : ""
                    }`}
                  >
                    <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${TYPE_BADGE[hit.type]}`}>
                      {hit.type}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-slate-200">{hit.title}</span>
                      <span className="block truncate text-xs text-slate-500">{hit.subtitle}</span>
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
