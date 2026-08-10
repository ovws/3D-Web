"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [loaded, setLoaded] = useState(false);
  const [graphicsAvailable, setGraphicsAvailable] = useState<boolean | null>(
    null,
  );
  const [startupFailed, setStartupFailed] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const probe = document.createElement("canvas");
      const hasWebGpu = "gpu" in navigator;
      const hasWebGl2 = Boolean(probe.getContext("webgl2"));

      setGraphicsAvailable(hasWebGpu || hasWebGl2);
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const handleGameStartupError = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;

      if (event.data?.type === "ovws-game-startup-error") {
        setStartupFailed(true);
      }
    };

    window.addEventListener("message", handleGameStartupError);

    return () => window.removeEventListener("message", handleGameStartupError);
  }, []);

  return (
    <main className="site-shell">
      <div className={`entry-loader${loaded ? " is-hidden" : ""}`} aria-hidden={loaded}>
        <span className="entry-loader__mark">文</span>
        <span className="entry-loader__label">正在进入文山木公的世界</span>
        <span className="entry-loader__line" />
      </div>

      {graphicsAvailable === true ? (
        <iframe
          className="game-frame"
          src="/game/index.html"
          title="文山木公的交互式 3D 个人空间"
          allow="autoplay; fullscreen; gamepad"
          onLoad={(event) => {
            setLoaded(true);
            event.currentTarget.focus();
          }}
        />
      ) : null}

      {graphicsAvailable === false || startupFailed ? (
        <section className="graphics-fallback" role="status">
          {/* The source image is a local static game asset; optimization is intentionally bypassed. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/game/social/share-image.png"
            alt="3D 个人空间中的低多边形红色越野车"
          />
          <div className="graphics-fallback__copy">
            <span>当前设备无法启动 3D 场景</span>
            <p>
              此体验需要 WebGL2 或 WebGPU。请更新浏览器或开启硬件加速后重试。
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
