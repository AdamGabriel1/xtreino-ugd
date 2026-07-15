export default function FloatingParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[
        { top: "15%", left: "10%", size: 3, delay: 0, duration: 4 },
        { top: "25%", right: "15%", size: 2, delay: 0.8, duration: 5 },
        { top: "60%", left: "20%", size: 2.5, delay: 1.5, duration: 4.5 },
        { top: "40%", right: "25%", size: 1.5, delay: 2, duration: 6 },
        { top: "75%", left: "40%", size: 2, delay: 0.5, duration: 3.5 },
        { top: "20%", left: "60%", size: 1.5, delay: 1.2, duration: 5.5 },
        { top: "55%", right: "10%", size: 3, delay: 2.5, duration: 4 },
        { top: "80%", right: "35%", size: 2, delay: 0.3, duration: 5 },
      ].map((p, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-emerald-400/20"
          style={{
            top: p.top,
            left: p.left,
            right: p.right,
            width: p.size,
            height: p.size,
            animation: `float ${p.duration}s ease-in-out ${p.delay}s infinite`,
          }}
        />
      ))}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) scale(1); opacity: 0.3; }
          50% { transform: translateY(-15px) scale(1.3); opacity: 0.7; }
        }
      `}</style>
    </div>
  );
}