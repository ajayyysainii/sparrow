"use client";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState, useCallback } from "react";
import { createNoise3D } from "simplex-noise";

export const WavyBackground = ({
  children,
  className,
  containerClassName,
  colors,
  waveWidth,
  backgroundFill,
  blur = 10,
  speed = "fast",
  waveOpacity = 0.5,
  ...props
}: {
  children?: any;
  className?: string;
  containerClassName?: string;
  colors?: string[];
  waveWidth?: number;
  backgroundFill?: string;
  blur?: number;
  speed?: "slow" | "fast";
  waveOpacity?: number;
  [key: string]: any;
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationIdRef = useRef<number>(0);
  const noiseRef = useRef(createNoise3D());
  const timeRef = useRef(0);

  const getSpeed = useCallback(() => {
    switch (speed) {
      case "slow":
        return 0.001;
      case "fast":
        return 0.002;
      default:
        return 0.001;
    }
  }, [speed]);

  const waveColors = colors ?? [
    "#38bdf8",
    "#818cf8",
    "#c084fc",
    "#e879f9",
    "#22d3ee",
  ];

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    
    ctx.scale(dpr, dpr);
    
    // Apply blur once, not on every frame
    if (blur > 0) {
      ctx.filter = `blur(${blur}px)`;
    }
  }, [blur]);

  const drawWave = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, n: number, nt: number) => {
    for (let i = 0; i < n; i++) {
      ctx.beginPath();
      ctx.lineWidth = waveWidth || 50;
      ctx.strokeStyle = waveColors[i % waveColors.length];
      
      // Increase step size from 5 to 8 for better performance
      for (let x = 0; x < w; x += 8) {
        const y = noiseRef.current(x / 800, 0.3 * i, nt) * 100;
        ctx.lineTo(x, y + h * 0.5);
      }
      ctx.stroke();
      ctx.closePath();
    }
  }, [waveWidth, waveColors]);

  useEffect(() => {
    resizeCanvas();
    
    const handleResize = () => {
      resizeCanvas();
    };

    // Debounce resize
    let resizeTimeout: ReturnType<typeof setTimeout>;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(handleResize, 100);
    });

    // Animation loop
    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const w = canvas.width / (window.devicePixelRatio || 1);
      const h = canvas.height / (window.devicePixelRatio || 1);

      // Clear the canvas properly
      ctx.clearRect(0, 0, w, h);

      // Set fill style once
      if (backgroundFill && backgroundFill !== "transparent") {
        ctx.fillStyle = backgroundFill;
        ctx.globalAlpha = 1;
        ctx.fillRect(0, 0, w, h);
      }

      // Draw waves with opacity
      ctx.globalAlpha = waveOpacity || 0.5;
      timeRef.current += getSpeed();
      drawWave(ctx, w, h, 5, timeRef.current);

      animationIdRef.current = requestAnimationFrame(render);
    };

    // Start animation
    render();

    return () => {
      cancelAnimationFrame(animationIdRef.current);
      window.removeEventListener("resize", handleResize);
      clearTimeout(resizeTimeout);
    };
  }, [resizeCanvas, backgroundFill, waveOpacity, getSpeed, drawWave]);

  const [isSafari, setIsSafari] = useState(false);
  useEffect(() => {
    // I'm sorry but i have got to support it on safari.
    setIsSafari(
      typeof window !== "undefined" &&
        navigator.userAgent.includes("Safari") &&
        !navigator.userAgent.includes("Chrome")
    );
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative w-full flex flex-col items-center justify-center",
        containerClassName
      )}
    >
      <canvas
        className="absolute inset-0 z-0"
        ref={canvasRef}
        id="canvas"
        style={{
          ...(isSafari ? { filter: `blur(${blur}px)` } : {}),
        }}
      ></canvas>
      <div className={cn("relative z-10", className)} {...props}>
        {children}
      </div>
    </div>
  );
};
