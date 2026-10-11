"use client";

import { ArrowUpRight, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { SnapCnLogo } from "@/components/snapcn-logo";
import { LABS_SECTIONS, type LabsLink, SHADCN_LABS_URL } from "@/config/site";
import { cn } from "@/lib/utils";

/**
 * "[Labs mark] / snapcn ▾" — the header every Shadcn Labs project wears
 * (termcn, framecn, emailcn …), lifted from termcn's `labs-nav.tsx`: the mark
 * goes to shadcn-labs.com, the name opens a full-width panel of the sibling
 * projects. Our mark stays as the home link between the two.
 *
 * Hand-rolled rather than a NavigationMenu (we have none): one open flag, a
 * backdrop that closes it, Escape. The panel is portalled to <body> because the
 * sticky header's `backdrop-blur` makes it the containing block for `fixed`,
 * which would pin the panel inside the 56px bar. It opens under the trigger's
 * own bottom edge, so the same component works in the header and the docs rail.
 */
const utm = (href: string) => `${href}?utm_source=snapcn.dev`;

export function LabsLogo() {
  return (
    <svg
      viewBox="0 0 505 455"
      fill="currentColor"
      className="size-5"
      aria-hidden="true"
    >
      <path d="M155 45c0 5.523-4.477 10-10 10h-30c-5.523 0-10 4.477-10 10v30c0 5.523-4.477 10-10 10H65c-5.523 0-10 4.477-10 10v225c0 5.523 4.477 10 10 10h30c5.523 0 10 4.477 10 10v30c0 5.523 4.477 10 10 10h30c5.523 0 10 4.477 10 10v35c0 5.523-4.477 10-10 10h-35c-5.523 0-10-4.477-10-10v-30c0-5.523-4.477-10-10-10H60c-5.523 0-10-4.477-10-10v-30c0-5.523-4.477-10-10-10H10c-5.523 0-10-4.477-10-10V110c0-5.523 4.477-10 10-10h30c5.523 0 10-4.477 10-10V60c0-5.523 4.477-10 10-10h30c5.523 0 10-4.477 10-10V10c0-5.523 4.477-10 10-10h35c5.523 0 10 4.477 10 10zm250-5c0 5.523 4.477 10 10 10h30c5.523 0 10 4.477 10 10v30c0 5.523 4.477 10 10 10h30c5.523 0 10 4.477 10 10v235c0 5.523-4.477 10-10 10h-30c-5.523 0-10 4.477-10 10v30c0 5.523-4.477 10-10 10h-30c-5.523 0-10 4.477-10 10v30c0 5.523-4.477 10-10 10h-35c-5.523 0-10-4.477-10-10v-35c0-5.523 4.477-10 10-10h30c5.523 0 10-4.477 10-10v-30c0-5.523 4.477-10 10-10h30c5.523 0 10-4.477 10-10V115c0-5.523-4.477-10-10-10h-30c-5.523 0-10-4.477-10-10V65c0-5.523-4.477-10-10-10h-30c-5.523 0-10-4.477-10-10V10c0-5.523 4.477-10 10-10h35c5.523 0 10 4.477 10 10z" />
      <path d="M305 90c0 5.523 4.477 10 10 10h30c5.523 0 10 4.477 10 10v35c0 5.523-4.477 10-10 10h-35c-5.523 0-10-4.477-10-10v-30c0-5.523-4.477-10-10-10h-75c-5.523 0-10 4.477-10 10v75c0 5.523 4.477 10 10 10h80c5.523 0 10 4.477 10 10v30c0 5.523 4.477 10 10 10h30c5.523 0 10 4.477 10 10v85c0 5.523-4.477 10-10 10h-30c-5.523 0-10 4.477-10 10v30c0 5.523-4.477 10-10 10h-85c-5.523 0-10-4.477-10-10v-30c0-5.523-4.477-10-10-10h-30c-5.523 0-10-4.477-10-10v-35c0-5.523 4.477-10 10-10h35c5.523 0 10 4.477 10 10v30c0 5.523 4.477 10 10 10h75c5.523 0 10-4.477 10-10v-75c0-5.523-4.477-10-10-10h-80c-5.523 0-10-4.477-10-10v-30c0-5.523-4.477-10-10-10h-30c-5.523 0-10-4.477-10-10v-85c0-5.523 4.477-10 10-10h30c5.523 0 10-4.477 10-10V60c0-5.523 4.477-10 10-10h85c5.523 0 10 4.477 10 10z" />
    </svg>
  );
}

const TITLE = "text-sm font-medium text-muted-foreground";

function ExternalLink({ item }: { item: LabsLink }) {
  return (
    <a
      href={utm(item.href)}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 whitespace-nowrap text-base decoration-muted-foreground/50 underline-offset-4 hover:underline"
    >
      {item.name}
      <ArrowUpRight className="size-4 shrink-0" aria-hidden="true" />
    </a>
  );
}

function Panel({
  top,
  onClose,
  onHold,
}: {
  top: number;
  onClose: () => void;
  onHold: (held: boolean) => void;
}) {
  return (
    <>
      <button
        type="button"
        aria-label="Close menu"
        className="fixed inset-x-0 bottom-0 z-40 cursor-default bg-background/60"
        style={{ top }}
        onClick={onClose}
      />
      <nav
        aria-label="Shadcn Labs projects"
        className="fixed inset-x-0 z-50 max-h-[calc(100dvh-4rem)] overflow-y-auto border-b border-border bg-background dark:bg-black"
        style={{ top }}
        onMouseEnter={() => onHold(true)}
        onMouseLeave={() => onHold(false)}
      >
        <div className="section flex flex-col gap-8 py-5 md:flex-row md:flex-wrap">
          {LABS_SECTIONS.map((section) => (
            <div key={section.title} className="flex flex-col gap-3">
              <p className={TITLE}>{section.title}</p>
              <ul
                className={cn(
                  "space-y-1",
                  section.items.length > 4 && "columns-2 gap-x-6",
                )}
              >
                {section.items.map((item) => (
                  <li key={item.href} className="break-inside-avoid">
                    <ExternalLink item={item} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </nav>
    </>
  );
}

export function ShadcnLabsNav({ className }: { className?: string }) {
  const [top, setTop] = useState<number | null>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const close = () => setTop(null);
  const open = () =>
    setTop((trigger.current?.getBoundingClientRect().bottom ?? 56) + 12);
  // Opens on hover like termcn's NavigationMenu. Leaving starts a short close
  // so the pointer can cross the 12px gap into the panel; entering it cancels.
  const hold = (held: boolean) => {
    clearTimeout(timer.current);
    if (!held) timer.current = setTimeout(close, 150);
  };

  useEffect(() => {
    if (top === null) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setTop(null);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [top]);

  return (
    <span className={cn("flex items-center gap-2", className)}>
      <a
        href={SHADCN_LABS_URL}
        target="_blank"
        rel="noopener noreferrer"
        title="Shadcn Labs"
        className="text-foreground transition-opacity hover:opacity-70"
      >
        <LabsLogo />
        <span className="sr-only">Go to Shadcn Labs</span>
      </a>
      <span className="select-none text-muted-foreground/60" aria-hidden="true">
        /
      </span>
      <Link href="/" aria-label="snapcn home" className="flex items-center">
        <SnapCnLogo />
      </Link>
      <button
        ref={trigger}
        type="button"
        aria-expanded={top !== null}
        aria-label="Shadcn Labs projects"
        className="flex items-center gap-1 rounded-md px-1 py-1 text-base font-medium"
        onMouseEnter={() => {
          hold(true);
          open();
        }}
        onMouseLeave={() => hold(false)}
        // Touch and keyboard have no hover: a click opens, backdrop/Escape close.
        onClick={open}
      >
        snapcn
        <ChevronDown
          className={cn(
            "size-3 transition-transform duration-200",
            top !== null && "rotate-180",
          )}
          strokeWidth={2.5}
          aria-hidden="true"
        />
      </button>
      {top !== null
        ? createPortal(
            <Panel top={top} onClose={close} onHold={hold} />,
            document.body,
          )
        : null}
    </span>
  );
}
