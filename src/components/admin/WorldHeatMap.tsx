"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type HeatPoint = { lat: number; lon: number; intensity: number; label: string };

const TILE_SIZE = 256;
const MIN_ZOOM = 1;
const MAX_ZOOM = 6;
const OSM_ATTR = "© OpenStreetMap contributors";

function lonToX(lon: number, z: number): number {
  return ((lon + 180) / 360) * (1 << z) * TILE_SIZE;
}

function latToY(lat: number, z: number): number {
  const rad = (lat * Math.PI) / 180;
  const s = Math.log(Math.tan(Math.PI / 4 + rad / 2));
  return ((1 - s / Math.PI) / 2) * (1 << z) * TILE_SIZE;
}

function tileUrl(z: number, x: number, y: number): string {
  return `https://tile.openstreetmap.org/${z}/${x}/${y}.png`;
}

type Props = {
  points: HeatPoint[];
  accent?: "cyan" | "emerald";
  className?: string;
  heightClass?: string;
};

/**
 * Mapa mundial (Web Mercator) con teselas OSM y capa de calor radial.
 */
export function WorldHeatMap({ points, accent = "cyan", className, heightClass = "h-[380px]" }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ w: 800, h: 380 });
  const [zoom, setZoom] = useState(2);
  const [center, setCenter] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragRef = useRef({ mx: 0, my: 0, cx: 0, cy: 0 });

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      if (w > 0 && h > 0) setDims({ w, h });
    });
    ro.observe(el);
    const w = el.clientWidth;
    const h = el.clientHeight;
    if (w > 0 && h > 0) setDims({ w, h });
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const worldW = (1 << zoom) * TILE_SIZE;
    const worldH = (1 << zoom) * TILE_SIZE;
    setCenter({ x: dims.w / 2 - worldW / 2, y: dims.h / 2 - worldH / 2 });
  }, [zoom, dims.w, dims.h]);

  const maxIntensity = useMemo(() => Math.max(1, ...points.map((p) => p.intensity)), [points]);

  const project = useCallback(
    (lat: number, lon: number) => {
      const wx = lonToX(lon, zoom);
      const wy = latToY(lat, zoom);
      return { x: wx + center.x, y: wy + center.y };
    },
    [zoom, center.x, center.y],
  );

  const tiles = useMemo(() => {
    const { w, h } = dims;
    const maxIndex = (1 << zoom) - 1;
    const minTileX = Math.max(0, Math.floor((-center.x) / TILE_SIZE));
    const maxTileX = Math.min(maxIndex, Math.ceil((w - center.x) / TILE_SIZE));
    const minTileY = Math.max(0, Math.floor((-center.y) / TILE_SIZE));
    const maxTileY = Math.min(maxIndex, Math.ceil((h - center.y) / TILE_SIZE));
    const list: { z: number; x: number; y: number; left: number; top: number }[] = [];
    for (let tx = minTileX; tx <= maxTileX; tx++) {
      for (let ty = minTileY; ty <= maxTileY; ty++) {
        list.push({
          z: zoom,
          x: tx,
          y: ty,
          left: center.x + tx * TILE_SIZE,
          top: center.y + ty * TILE_SIZE,
        });
      }
    }
    return list;
  }, [dims.w, dims.h, zoom, center.x, center.y]);

  const onPointerDown = (e: React.PointerEvent) => {
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    setDragging(true);
    dragRef.current = { mx: e.clientX, my: e.clientY, cx: center.x, cy: center.y };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging) return;
    const d = dragRef.current;
    setCenter({
      x: d.cx + (e.clientX - d.mx),
      y: d.cy + (e.clientY - d.my),
    });
  };

  const onPointerUp = () => setDragging(false);

  const fillMain = accent === "cyan" ? "rgba(34,211,238,0.5)" : "rgba(52,211,153,0.45)";
  const fillOuter = accent === "cyan" ? "rgba(34,211,238,0.1)" : "rgba(16,185,129,0.1)";

  if (points.length === 0) return null;

  return (
    <div className={cn("relative overflow-hidden rounded-3xl border border-white/10 bg-[#0a1628]", heightClass, className)}>
      <div
        ref={containerRef}
        className="relative h-full w-full cursor-grab active:cursor-grabbing"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
      >
        <div className="absolute inset-0 z-0">
          {tiles.map((t) => {
            const key = `${t.z}-${t.x}-${t.y}`;
            return (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={key}
                src={tileUrl(t.z, t.x, t.y)}
                alt=""
                className="pointer-events-none absolute select-none"
                style={{ left: t.left, top: t.top, width: TILE_SIZE, height: TILE_SIZE }}
                draggable={false}
                referrerPolicy="no-referrer-when-downgrade"
              />
            );
          })}
        </div>

        <svg
          className="pointer-events-none absolute inset-0 z-10"
          width={dims.w}
          height={dims.h}
          aria-hidden
        >
          <defs>
            <filter id={`whm-glow-${accent}`} x="-80%" y="-80%" width="260%" height="260%">
              <feGaussianBlur stdDeviation="5" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          {points.map((p, i) => {
            const { x, y } = project(p.lat, p.lon);
            const r = 12 + (p.intensity / maxIntensity) * 40;
            return (
              <g key={`${p.label}-${i}`} filter={`url(#whm-glow-${accent})`}>
                <circle cx={x} cy={y} r={r * 2.2} fill={fillOuter} />
                <circle cx={x} cy={y} r={r} fill={fillMain} />
                <title>{`${p.label}: ${p.intensity}`}</title>
              </g>
            );
          })}
        </svg>

        <div className="absolute bottom-2 left-2 z-20 max-w-[78%] rounded-lg bg-black/75 px-2 py-1 text-[8px] leading-tight text-slate-400">
          {OSM_ATTR} · arrastra para mover
        </div>
        <div className="absolute right-2 top-2 z-20 flex flex-col gap-1">
          <Button
            type="button"
            size="icon"
            variant="secondary"
            className="h-8 w-8 border border-white/10 bg-black/60 text-white hover:bg-black/80"
            onClick={(e) => {
              e.stopPropagation();
              setZoom((z) => Math.min(MAX_ZOOM, z + 1));
            }}
          >
            <Plus className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="secondary"
            className="h-8 w-8 border border-white/10 bg-black/60 text-white hover:bg-black/80"
            onClick={(e) => {
              e.stopPropagation();
              setZoom((z) => Math.max(MIN_ZOOM, z - 1));
            }}
          >
            <Minus className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
