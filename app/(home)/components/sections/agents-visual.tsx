/**
 * Step three: the agents and models a snapcn video gets made with, Tenor's
 * logo cloud — big and dark in the middle, smaller and fainter to the edges,
 * fading out at the foot.
 *
 * One static SVG (`public/home/agent-cloud.svg`, 28KB): 22 marks from
 * @lobehub/icons (MIT) and `MCP_CLIENT_ICONS`, flattened to one ink. As markup
 * it was a client component shipping every path as JavaScript; as an image it
 * costs one request and no hydration. `dark:invert` turns the ink white.
 */
export function AgentsVisual() {
  return (
    // biome-ignore lint/performance/noImgElement: a static local SVG; next/image would only add a wrapper.
    <img
      src="/home/agent-cloud.svg"
      alt=""
      loading="lazy"
      className="-mx-8 h-full w-[calc(100%+4rem)] max-w-none object-cover dark:invert"
    />
  );
}
