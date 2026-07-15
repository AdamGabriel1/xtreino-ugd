import { useMemo } from "react";

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  showDots?: boolean;
  showArea?: boolean;
}

export function Sparkline({
  data,
  width = 70,
  height = 24,
  color = "#4ade80",
  showDots = true,
  showArea = true,
}: SparklineProps) {
  const points = useMemo(() => {
    if (data.length < 2) return [];
    const max = Math.max(...data, 1);
    const min = Math.min(...data);
    const range = max - min || 1;
    return data.map((v, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((v - min) / range) * height;
      return { x, y, value: v };
    });
  }, [data, width, height]);

  if (data.length < 2) {
    return <span className="text-xs text-[#5a5a6e]">—</span>;
  }

  const pointsStr = points.map((p) => `${p.x},${p.y}`).join(" ");
  const gradientId = `sparkline-grad-${Math.random().toString(36).slice(2, 9)}`;

  return (
    <svg width={width} height={height} className="overflow-visible">
      {showArea && (
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
      )}
      {showArea && (
        <polygon
          points={`0,${height} ${pointsStr} ${width},${height}`}
          fill={`url(#${gradientId})`}
        />
      )}
      <polyline
        points={pointsStr}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {showDots &&
        points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="2" fill={color} />
        ))}
    </svg>
  );
}

export default Sparkline;