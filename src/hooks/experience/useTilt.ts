import { useEffect, useState } from "react";

export function useTilt(factor = 15): { x: number; y: number } {
  const [style, setStyle] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setStyle({
        x: ((e.clientX / window.innerWidth) - 0.5) * factor * 2,
        y: ((e.clientY / window.innerHeight) - 0.5) * factor * 2,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [factor]);

  return style;
}