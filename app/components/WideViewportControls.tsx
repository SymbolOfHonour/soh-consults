"use client";

import { useEffect } from "react";

// Keep the existing navigation and assistant at finger-friendly sizes while
// every page uses the browser's native wide viewport and pinch zoom.
export default function WideViewportControls() {
  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport || !window.matchMedia("(pointer: coarse)").matches) return;
    const root = document.documentElement;
    const names = ["--soh-zoom-inverse", "--soh-visual-left", "--soh-visual-top", "--soh-visual-width", "--soh-visual-height", "--soh-screen-width"];
    let frame = 0;
    const update = () => {
      root.dataset.sohWideTouch = "true";
      root.style.setProperty(names[0], String(1 / viewport.scale));
      root.style.setProperty(names[1], `${viewport.offsetLeft}px`);
      root.style.setProperty(names[2], `${viewport.offsetTop}px`);
      root.style.setProperty(names[3], `${viewport.width}px`);
      root.style.setProperty(names[4], `${viewport.height}px`);
      root.style.setProperty(names[5], `${viewport.width * viewport.scale}px`);
    };
    const schedule = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(update); };
    update();
    viewport.addEventListener("resize", schedule);
    viewport.addEventListener("scroll", schedule);
    return () => {
      cancelAnimationFrame(frame);
      viewport.removeEventListener("resize", schedule);
      viewport.removeEventListener("scroll", schedule);
      delete root.dataset.sohWideTouch;
      names.forEach(name => root.style.removeProperty(name));
    };
  }, []);
  return null;
}
