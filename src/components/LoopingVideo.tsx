// A muted, looping, audio-free video that behaves like an image in a layout. Used
// wherever a still would go but Annie has motion — the About hero, the Bouquets header.
// The source files carry no audio track at all (see scripts/prepare-media.mjs), which is
// also what lets them autoplay: browsers block autoplay when there's sound.
export default function LoopingVideo({
  src,
  poster,
  alt,
  className = '',
}: {
  src: string
  poster: string
  alt: string
  className?: string
}) {
  return (
    <video
      src={src}
      poster={poster}
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      aria-label={alt}
      className={className}
    />
  )
}
