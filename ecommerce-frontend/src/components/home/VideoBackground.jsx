import React, { useEffect, useRef, useState } from 'react';

function VideoBackground({ sources = [], poster, className = '' }) {
  const videoRef = useRef(null);
  const [canPlay, setCanPlay] = useState(false);

  const prefersReduced =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    if (prefersReduced) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setCanPlay(true);
          observer.disconnect();
        }
      });
    });
    if (videoRef.current) observer.observe(videoRef.current);
    return () => observer.disconnect();
  }, [prefersReduced]);

  if (prefersReduced) {
    return poster ? <img src={poster} alt="" className={className} /> : null;
  }

  return (
    <video
      ref={videoRef}
      className={className}
      autoPlay={canPlay}
      muted
      loop
      playsInline
      preload="metadata"
      poster={poster}
      aria-hidden="true"
    >
      {sources.map((s) => (
        <source key={s.src} src={s.src} type={s.type} />
      ))}
    </video>
  );
}

export default VideoBackground;
