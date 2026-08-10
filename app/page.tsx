"use client";

import { useEffect, useRef, useState } from "react";

export default function Home() {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [graphicsAvailable, setGraphicsAvailable] = useState<boolean | null>(
    null,
  );

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const probe = document.createElement("canvas");
      const hasWebGpu = "gpu" in navigator;
      const hasWebGl2 = Boolean(probe.getContext("webgl2"));
      const hasWebGl = Boolean(probe.getContext("webgl"));

      setGraphicsAvailable(hasWebGpu || hasWebGl2 || hasWebGl);
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  return (
    <main className="site-shell">
      <div className={`entry-loader${loaded ? " is-hidden" : ""}`} aria-hidden={loaded}>
        <span className="entry-loader__mark">文</span>
        <span className="entry-loader__label">正在进入文山木公的世界</span>
        <span className="entry-loader__line" />
      </div>

      <iframe
        ref={frameRef}
        className="game-frame"
        src="/game/index.html"
        title="文山木公的交互式 3D 个人空间"
        allow="autoplay; fullscreen; gamepad"
        onLoad={(event) => {
          setLoaded(true);
          event.currentTarget.focus();
        }}
      />

      {graphicsAvailable === false ? (
        <section className="graphics-fallback" role="status">
          {/* The source image is a local static game asset; optimization is intentionally bypassed. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/game/social/share-image.png"
            alt="3D 个人空间中的低多边形红色越野车"
          />
          <div className="graphics-fallback__copy">
            <span>当前浏览器无法显示 3D 场景</span>
            <p>
              请使用已启用 WebGL 或 WebGPU 的现代浏览器打开。
            </p>
          </div>
        </section>
      ) : null}

      <noscript>
        <p className="noscript-message">
          这个交互式 3D 个人空间需要启用 JavaScript。
        </p>
      </noscript>
    </main>
  );
}
