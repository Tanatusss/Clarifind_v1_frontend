export function GradientOrbs() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 1 }}>
      {/* Large blue gradient orb */}
      <div
        className="absolute w-[800px] h-[800px] rounded-full opacity-30 blur-3xl animate-float"
        style={{
          background: "radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, transparent 70%)",
          top: "10%",
          left: "20%",
          animationDelay: "0s",
        }}
      />

      {/* Cyan gradient orb */}
      <div
        className="absolute w-[600px] h-[600px] rounded-full opacity-25 blur-3xl animate-float"
        style={{
          background: "radial-gradient(circle, rgba(34, 211, 238, 0.3) 0%, transparent 70%)",
          top: "40%",
          right: "15%",
          animationDelay: "2s",
          animationDuration: "8s",
        }}
      />

      {/* Deep blue gradient orb */}
      <div
        className="absolute w-[700px] h-[700px] rounded-full opacity-20 blur-3xl animate-float"
        style={{
          background: "radial-gradient(circle, rgba(29, 78, 216, 0.35) 0%, transparent 70%)",
          bottom: "10%",
          left: "30%",
          animationDelay: "4s",
          animationDuration: "10s",
        }}
      />

      {/* Small accent orb */}
      <div
        className="absolute w-[400px] h-[400px] rounded-full opacity-20 blur-2xl animate-pulse-glow"
        style={{
          background: "radial-gradient(circle, rgba(96, 165, 250, 0.4) 0%, transparent 70%)",
          top: "60%",
          right: "40%",
          animationDuration: "4s",
        }}
      />
    </div>
  )
}
