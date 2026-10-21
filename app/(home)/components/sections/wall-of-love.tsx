"use client";

import { motion } from "motion/react";
import { Fragment } from "react";
import { VerifiedIcon } from "./featured-quote";
import { WALL_POSTS, type WallPost } from "./wall-of-love-posts";

/**
 * Testimonials as four columns of real X posts scrolling upward at different
 * speeds, faded top and bottom. Each column is its list twice, translated by
 * -50% and looped, so it never runs out; the copy is aria-hidden.
 *
 * Every card is a real post and links to it — `WALL_POSTS`, not sample copy.
 * Radii are explicit px: this site's `--radius` makes `rounded-3xl` ~10px.
 */

const COLUMNS = [0, 1, 2, 3].map((c) =>
  WALL_POSTS.filter((_, i) => i % 4 === c),
);
/** Seconds per loop. Seven cards a column, ~5s a card, staggered. */
const DURATIONS = [36, 46, 41, 43];
const HOVER = {
  scale: 1.03,
  y: -8,
  boxShadow:
    "0 25px 50px -12px rgba(0, 0, 0, 0.12), 0 10px 10px -5px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(0, 0, 0, 0.05)",
  transition: { type: "spring" as const, stiffness: 400, damping: 17 },
};

function Column({
  posts,
  duration,
  className,
}: {
  posts: WallPost[];
  duration: number;
  className?: string;
}) {
  return (
    <div className={className}>
      <motion.ul
        animate={{ translateY: "-50%" }}
        transition={{
          duration,
          repeat: Number.POSITIVE_INFINITY,
          ease: "linear",
          repeatType: "loop",
        }}
        className="m-0 flex list-none flex-col gap-3 p-0 pb-3"
      >
        {[0, 1].map((copy) => (
          <Fragment key={copy}>
            {posts.map((post) => (
              <motion.li
                key={`${copy}-${post.handle}`}
                aria-hidden={copy === 1 || undefined}
                whileHover={HOVER}
                className="group w-full rounded-[24px] border border-border bg-card shadow-black/5 shadow-lg"
              >
                <a
                  href={post.url}
                  target="_blank"
                  rel="noreferrer"
                  tabIndex={copy === 1 ? -1 : undefined}
                  className="block rounded-[24px] p-6 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                >
                  <blockquote className="m-0 p-0">
                    <p
                      lang={post.lang}
                      className="m-0 line-clamp-6 whitespace-pre-line text-current/70 leading-relaxed"
                    >
                      {post.quote}
                    </p>
                    <footer className="mt-4 flex items-center gap-3">
                      {/* biome-ignore lint/performance/noImgElement: local, fixed-size avatar. */}
                      <img
                        width={40}
                        height={40}
                        loading="lazy"
                        src={`/wall-of-love/${post.handle}.jpg`}
                        alt=""
                        className="size-10 rounded-full object-cover ring-2 ring-border transition-all duration-300 group-hover:ring-primary/30"
                      />
                      <div className="flex min-w-0 flex-col">
                        {/* A row, so the badge sits on the name's baseline and
                            the name — not the badge — is what truncates. */}
                        <span className="flex min-w-0 items-center gap-1">
                          <cite className="truncate font-semibold text-foreground not-italic leading-5 tracking-tight">
                            {post.name}
                          </cite>
                          {post.verified ? <VerifiedIcon /> : null}
                        </span>
                        <span className="mt-0.5 truncate text-current/50 text-sm leading-5 tracking-tight">
                          {post.role ?? `@${post.handle}`}
                        </span>
                      </div>
                    </footer>
                  </blockquote>
                </a>
              </motion.li>
            ))}
          </Fragment>
        ))}
      </motion.ul>
    </div>
  );
}

export function WallOfLove() {
  return (
    <section
      id="wall-of-love"
      aria-labelledby="testimonials-heading"
      className="relative overflow-hidden py-24"
    >
      <motion.div
        initial={{ opacity: 0, y: 50, rotate: -2 }}
        whileInView={{ opacity: 1, y: 0, rotate: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{
          duration: 1.2,
          ease: [0.16, 1, 0.3, 1],
          opacity: { duration: 0.8 },
        }}
        className="section z-10"
      >
        <h2
          id="testimonials-heading"
          className="text-pretty font-normal font-sans text-[clamp(2rem,3.6vw,2.75rem)] text-foreground leading-[1.1] tracking-[-0.03em]"
        >
          What they&rsquo;re saying
        </h2>
        <p className="mt-4 max-w-xl text-pretty text-body-lg text-current/70">
          Real posts from X and Threads. Every card links to the original.
        </p>

        <section
          className="mt-10 grid max-h-[740px] grid-cols-1 gap-3 overflow-hidden md:grid-cols-2 lg:grid-cols-4 [mask-image:linear-gradient(to_bottom,transparent,black_10%,black_90%,transparent)]"
          aria-label="Scrolling testimonials"
        >
          {COLUMNS.map((posts, i) => (
            <Column
              // biome-ignore lint/suspicious/noArrayIndexKey: four fixed columns.
              key={i}
              posts={posts}
              duration={DURATIONS[i]}
              className={
                ["", "hidden md:block", "hidden lg:block", "hidden lg:block"][i]
              }
            />
          ))}
        </section>
      </motion.div>
    </section>
  );
}
