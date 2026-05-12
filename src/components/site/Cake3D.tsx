import { useEffect, useRef, useState } from "react";

interface Props {
  size: "s" | "m" | "l";
  layers: number;
  flavor: string; // id
  toppings: string[]; // ids
}

const FLAVOR_COLORS: Record<string, [string, string]> = {
  saf: ["#F4D58D", "#E8B14A"],   // saffron vanilla
  pist: ["#C7E8C2", "#7FB47B"],  // pistachio
  date: ["#8B5A2B", "#4B2A14"],  // date chocolate
  rose: ["#F4C2D7", "#D9608E"],  // rose
};

const SIZE_PX: Record<Props["size"], number> = { s: 180, m: 230, l: 280 };

export function Cake3D({ size, layers, flavor, toppings }: Props) {
  const [rotY, setRotY] = useState(-22);
  const [rotX, setRotX] = useState(14);
  const [auto, setAuto] = useState(true);
  const dragRef = useRef<{ x: number; y: number; rx: number; ry: number } | null>(null);

  useEffect(() => {
    if (!auto) return;
    let raf = 0;
    let last = performance.now();
    const tick = (t: number) => {
      const dt = (t - last) / 1000;
      last = t;
      setRotY((y) => y + dt * 12);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [auto]);

  const onDown = (e: React.PointerEvent) => {
    setAuto(false);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    dragRef.current = { x: e.clientX, y: e.clientY, rx: rotX, ry: rotY };
  };
  const onMove = (e: React.PointerEvent) => {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.x;
    const dy = e.clientY - dragRef.current.y;
    setRotY(dragRef.current.ry + dx * 0.5);
    setRotX(Math.max(-10, Math.min(45, dragRef.current.rx - dy * 0.3)));
  };
  const onUp = () => { dragRef.current = null; };

  const baseDiameter = SIZE_PX[size];
  const [topColor, bottomColor] = FLAVOR_COLORS[flavor] ?? FLAVOR_COLORS.saf;
  const hasGold = toppings.includes("gold");
  const hasSadu = toppings.includes("sadu");
  const hasNajdi = toppings.includes("naj");
  const hasCalig = toppings.includes("calig");
  const hasDates = toppings.includes("dates");

  // Build layer stack (bottom largest -> top smallest)
  const layerArr = Array.from({ length: layers }, (_, i) => i);
  const layerHeight = 44;
  const totalHeight = layers * layerHeight;

  return (
    <div
      className="relative h-full w-full select-none touch-none"
      style={{ perspective: "1200px" }}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
    >
      {/* Floor / shadow */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{
          width: baseDiameter * 1.5,
          height: baseDiameter * 1.5,
          transformStyle: "preserve-3d",
          transform: `rotateX(${rotX}deg) rotateY(${rotY}deg)`,
          transition: dragRef.current ? "none" : "transform 0.15s linear",
        }}
      >
        {/* Pedestal */}
        <div
          className="absolute left-1/2 top-1/2 rounded-full"
          style={{
            width: baseDiameter * 1.25,
            height: 24,
            background: "radial-gradient(ellipse at center, rgba(255,255,255,0.2), rgba(0,0,0,0.05) 70%)",
            transform: `translate(-50%, ${totalHeight / 2 + 24}px) rotateX(90deg)`,
            filter: "blur(2px)",
          }}
        />

        {layerArr.map((i) => {
          const shrink = i * 18;
          const d = baseDiameter - shrink;
          const yOffset = totalHeight / 2 - i * layerHeight - layerHeight / 2;
          const isTop = i === layers - 1;
          return (
            <div
              key={i}
              className="absolute left-1/2 top-1/2"
              style={{
                width: d,
                height: layerHeight,
                transformStyle: "preserve-3d",
                transform: `translate(-50%, -50%) translateY(${-yOffset}px)`,
              }}
            >
              {/* Side cylinder approx with gradient + sadu pattern */}
              <div
                className="absolute inset-0 overflow-hidden"
                style={{
                  borderRadius: `${d / 2}px / ${layerHeight}px`,
                  background: `linear-gradient(180deg, ${topColor} 0%, ${bottomColor} 100%)`,
                  boxShadow: "inset 0 -10px 20px rgba(0,0,0,0.18), inset 0 10px 14px rgba(255,255,255,0.25)",
                }}
              >
                {hasSadu && (
                  <div
                    className="absolute inset-0 opacity-60 mix-blend-overlay"
                    style={{
                      backgroundImage:
                        "repeating-linear-gradient(90deg, rgba(0,0,0,0.0) 0 6px, rgba(212,175,55,0.55) 6px 8px, rgba(0,0,0,0) 8px 14px, rgba(0,0,0,0.4) 14px 16px)",
                    }}
                  />
                )}
                {hasNajdi && (
                  <div
                    className="absolute inset-0 opacity-70 mix-blend-overlay"
                    style={{
                      backgroundImage:
                        "repeating-linear-gradient(45deg, rgba(255,255,255,0.0) 0 8px, rgba(255,255,255,0.35) 8px 9px), repeating-linear-gradient(-45deg, rgba(0,0,0,0.0) 0 8px, rgba(0,0,0,0.25) 8px 9px)",
                    }}
                  />
                )}
                {hasGold && (
                  <div
                    className="absolute -top-1 left-0 right-0 h-3"
                    style={{
                      background:
                        "linear-gradient(180deg, #FFE38A 0%, #D4AF37 60%, #8B6B14 100%)",
                      boxShadow: "0 2px 6px rgba(212,175,55,0.55)",
                    }}
                  />
                )}
              </div>
              {/* Top disc */}
              <div
                className="absolute left-1/2 top-0 -translate-x-1/2 rounded-full"
                style={{
                  width: d,
                  height: d * 0.32,
                  background: `radial-gradient(ellipse at 50% 35%, ${topColor} 0%, ${bottomColor} 90%)`,
                  transform: `translate(-50%, -50%) rotateX(90deg)`,
                  boxShadow: "inset 0 0 30px rgba(0,0,0,0.2)",
                }}
              >
                {isTop && hasCalig && (
                  <div
                    className="absolute inset-0 grid place-items-center font-bold"
                    style={{ color: "#5b3a0e", fontSize: Math.max(14, d * 0.12) }}
                  >
                    مبروك ✨
                  </div>
                )}
                {isTop && hasDates && (
                  <div className="absolute inset-0 grid place-items-center">
                    {[0, 60, 120, 180, 240, 300].map((deg) => (
                      <span
                        key={deg}
                        className="absolute h-3 w-2 rounded-full bg-amber-900"
                        style={{ transform: `rotate(${deg}deg) translate(${d * 0.28}px) rotate(-${deg}deg)` }}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Controls overlay */}
      <div className="absolute inset-x-0 bottom-3 flex items-center justify-center gap-2 text-[10px]">
        <button
          onClick={() => setAuto((a) => !a)}
          className="rounded-full bg-white/15 px-3 py-1 font-bold uppercase tracking-widest text-white backdrop-blur hover:bg-white/25"
        >
          {auto ? "Pause" : "Auto rotate"}
        </button>
        <span className="rounded-full bg-white/10 px-3 py-1 text-white/70 backdrop-blur">
          {Math.round(baseDiameter / 25)}″ · {layers}L · {Math.round(rotY % 360)}°
        </span>
        <span className="rounded-full bg-white/10 px-3 py-1 text-white/70 backdrop-blur">
          drag to rotate
        </span>
      </div>
    </div>
  );
}
