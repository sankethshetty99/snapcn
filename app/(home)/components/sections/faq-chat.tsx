"use client";

import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

/**
 * The FAQ as a chat thread: questions are your bubbles on the right, answers
 * the reply on the left. Opening one shows typing dots first, then the answer.
 *
 * Every height change is a `grid-template-rows` 0fr ↔ 1fr transition, so it is
 * real layout and the bubbles below follow without a jump. Motion only does the
 * press and the reply's spring in. The answers stay in the server HTML (only
 * collapsed), so the FAQPage structured data still matches the visible text.
 *
 * Radii are explicit px: this site's `--radius` makes `rounded-2xl` 8px.
 */

const EXPO = "cubic-bezier(0.16, 1, 0.3, 1)";
const EXPO_STRONG = "cubic-bezier(0.22, 1, 0.36, 1)";
/** How long the typing dots show before the answer. */
const TYPING_MS = 400;

export function FaqChat({ items }: { items: { q: string; a: string }[] }) {
  const [active, setActive] = useState<number | null>(null);
  const [answered, setAnswered] = useState<number | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const toggle = (i: number) => {
    clearTimeout(timer.current);
    // Closing keeps the answer, so the bubble leaves as it is — no reverse morph.
    if (active === i) return setActive(null);
    setAnswered(null);
    setActive(i);
    timer.current = setTimeout(() => setAnswered(i), TYPING_MS);
  };

  useEffect(() => () => clearTimeout(timer.current), []);

  return (
    <div>
      <div className="flex flex-col gap-3">
        {items.map(({ q, a }, i) => {
          const open = active === i;
          const ready = answered === i;
          return (
            <div key={q}>
              <div className="flex justify-end">
                <motion.button
                  type="button"
                  className="max-w-[85%] rounded-[18px] rounded-br-[6px] bg-foreground px-4 py-2.5 text-left font-medium text-[14px] text-background"
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  onClick={() => toggle(i)}
                  aria-expanded={open}
                >
                  {q}
                </motion.button>
              </div>

              <div
                className="grid"
                style={{
                  gridTemplateRows: open ? "1fr" : "0fr",
                  transition: open
                    ? `grid-template-rows 0.4s ${EXPO_STRONG}`
                    : `grid-template-rows 0.25s ${EXPO}`,
                }}
              >
                <div className="overflow-hidden">
                  <motion.div
                    initial={false}
                    animate={{ y: open ? 0 : 4, opacity: open ? 1 : 0 }}
                    transition={{
                      y: open
                        ? { type: "spring", stiffness: 380, damping: 26 }
                        : { duration: 0.15 },
                      opacity: { duration: open ? 0.25 : 0.12 },
                    }}
                  >
                    <div className="flex justify-start pt-2">
                      <div className="max-w-[85%] overflow-hidden rounded-[18px] rounded-bl-[6px] bg-muted">
                        <div
                          className="grid"
                          style={{
                            gridTemplateRows: ready ? "0fr" : "1fr",
                            transition: `grid-template-rows 0.3s ${EXPO}`,
                          }}
                        >
                          <div className="overflow-hidden">
                            <div className="flex items-center gap-[5px] px-4 py-3">
                              {[0, 0.15, 0.3].map((delay) => (
                                <span
                                  key={delay}
                                  className="inline-block size-[5px] rounded-full bg-muted-foreground/50"
                                  style={{
                                    animation: `faqChatDot 1.2s ease-in-out ${delay}s infinite`,
                                  }}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                        <div
                          className="grid"
                          style={{
                            gridTemplateRows: ready ? "1fr" : "0fr",
                            transition: `grid-template-rows 0.3s ${EXPO}`,
                          }}
                        >
                          <div className="overflow-hidden">
                            <p
                              className="px-4 py-2.5 text-[14px] text-foreground leading-relaxed"
                              style={{
                                opacity: ready ? 1 : 0,
                                transition: ready
                                  ? "opacity 0.2s ease 0.08s"
                                  : "opacity 0.1s ease",
                              }}
                            >
                              {a}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <style>{`@keyframes faqChatDot{0%,60%,100%{opacity:.3;transform:translateY(0)}30%{opacity:1;transform:translateY(-3px)}}`}</style>
    </div>
  );
}
