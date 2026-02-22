"use client";

import { useRef, useEffect, useState } from "react";
import type { MotionValue } from "framer-motion";
import { useScroll, useMotionValueEvent, useTransform, motion, AnimatePresence } from "framer-motion";

const TOTAL_FRAMES = 242;
const FRAME_PREFIX = "/pic_tiger/ezgif-frame-";
const FRAME_EXT = ".jpg";

function padFrameNum(n: number): string {
  return String(n).padStart(3, "0");
}

function getFramePath(index: number): string {
  return `${FRAME_PREFIX}${padFrameNum(index + 1)}${FRAME_EXT}`;
}

export default function StingScroll() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const progressRef = useRef(0);
  const frameImagesRef = useRef<HTMLImageElement[]>([]);
  const rafRef = useRef<number>(0);
  const [loaded, setLoaded] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);
  const [preloaderVisible, setPreloaderVisible] = useState(true);
  const [canvasVisible, setCanvasVisible] = useState(false);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    progressRef.current = v;
  });

  // Preload all frames
  useEffect(() => {
    let mounted = true;
    const images: HTMLImageElement[] = [];
    let loadedCount = 0;

    const onLoad = () => {
      if (!mounted) return;
      loadedCount++;
      setLoadProgress(loadedCount / TOTAL_FRAMES);
      if (loadedCount === TOTAL_FRAMES) {
        frameImagesRef.current = images;
        setLoaded(true);
      }
    };

    for (let i = 0; i < TOTAL_FRAMES; i++) {
      const img = new Image();
      img.onload = onLoad;
      img.onerror = onLoad;
      img.src = getFramePath(i);
      images.push(img);
    }

    return () => {
      mounted = false;
      images.forEach((img) => (img.onload = null));
    };
  }, []);

  // Preloader exit: fade out loader, fade in canvas with blur-to-sharp
  useEffect(() => {
    if (!loaded) return;
    const t1 = setTimeout(() => {
      setPreloaderVisible(false);
    }, 300);
    const t2 = setTimeout(() => {
      setCanvasVisible(true);
      if (typeof document !== "undefined") {
        document.body.classList.remove("preloading");
        document.body.classList.add("preloading-off");
      }
    }, 600);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [loaded]);

  // Body preloading class to prevent layout shift
  useEffect(() => {
    if (typeof document !== "undefined") document.body.classList.add("preloading");
    return () => {
      document.body.classList.remove("preloading", "preloading-off");
    };
  }, []);

  // Single RAF loop + canvas resize when images loaded
  useEffect(() => {
    if (!loaded || frameImagesRef.current.length === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    const images = frameImagesRef.current;

    const resize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
    };
    resize();

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;
    ctx.imageSmoothingEnabled = true;
    (ctx as CanvasRenderingContext2D & { imageSmoothingQuality?: string }).imageSmoothingQuality = "high";

    const draw = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const progress = progressRef.current;
      const frameIndex = Math.min(
        Math.floor(progress * (TOTAL_FRAMES - 1)),
        TOTAL_FRAMES - 1
      );
      const clampedIndex = Math.max(0, frameIndex);
      const img = images[clampedIndex];

      if (img && img.complete && img.naturalWidth) {
        const imgW = img.naturalWidth;
        const imgH = img.naturalHeight;
        const scale = Math.max(w / imgW, h / imgH);
        const drawW = imgW * scale;
        const drawH = imgH * scale;
        const x = (w - drawW) / 2;
        const y = (h - drawH) / 2;

        ctx.save();
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.fillStyle = "#0A0F0E";
        ctx.fillRect(0, 0, w, h);
        ctx.drawImage(img, x, y, drawW, drawH);
        ctx.restore();
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);
    window.addEventListener("resize", resize);
    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(rafRef.current);
    };
  }, [loaded]);

  return (
    <>
      {/* Preloader */}
      <AnimatePresence mode="wait">
        {preloaderVisible && (
          <motion.div
            key="preloader"
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0A0F0E]"
            initial={false}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
          <div className="w-full max-w-md px-8">
            <div className="h-1 w-full overflow-hidden rounded-full bg-white/20">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-[#E63946] to-[#C41E3A]"
                initial={{ width: "0%" }}
                animate={{ width: `${loadProgress * 100}%` }}
                transition={{ type: "tween", duration: 0.2 }}
              />
            </div>
            <p className="mt-4 text-center font-inter text-sm text-white/90">
              Loading experience...
            </p>
          </div>
        </motion.div>
        )}
      </AnimatePresence>

      {/* Scroll container */}
      <div
        ref={containerRef}
        className="relative h-[700vh] bg-[#0A0F0E]"
        style={{ visibility: preloaderVisible ? "hidden" : "visible" }}
      >
        {/* Sticky viewport: full-screen canvas + overlays */}
        <div className="sticky top-0 left-0 h-screen w-full min-h-screen min-w-full" style={{ height: "100vh", width: "100vw" }}>
          <div className="absolute inset-0 h-full w-full">
            <canvas
              ref={canvasRef}
              className="block h-full w-full"
              style={{
                width: "100%",
                height: "100%",
                opacity: canvasVisible ? 1 : 0,
                filter: canvasVisible ? "blur(0px)" : "blur(12px)",
                transition: "opacity 0.5s ease-out, filter 0.6s ease-out",
              }}
            />
          </div>
          {/* Story overlays – fixed over canvas, opacity by scroll */}
          <StoryOverlays scrollYProgress={scrollYProgress} />
        </div>
      </div>
    </>
  );
}

function StoryOverlays({ scrollYProgress }: { scrollYProgress: MotionValue<number> }) {
  const vignetteOpacity = useTransform(scrollYProgress, [0.2, 0.35, 0.75, 0.9], [0, 0.4, 0.4, 0.3]);

  return (
    <div className="pointer-events-none absolute inset-0 top-0 h-screen w-full">
      <motion.div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_50%,transparent_40%,rgba(0,0,0,0.6)_100%)]"
        style={{ opacity: vignetteOpacity }}
      />
    </div>
  );
}
