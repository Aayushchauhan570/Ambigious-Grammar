/**
 * Header.jsx
 * 
 * App header with title, description, and subtle decorative elements.
 */

export default function Header() {
  return (
    <header className="relative pt-12 pb-8 text-center">
      {/* Decorative glow orbs */}
      <div
        className="glow-orb w-[500px] h-[500px] -top-40 -left-20"
        style={{ background: 'radial-gradient(circle, #8b5cf6, transparent)' }}
      />
      <div
        className="glow-orb w-[400px] h-[400px] -top-20 right-0"
        style={{ background: 'radial-gradient(circle, #06b6d4, transparent)' }}
      />

      <div className="relative z-10">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent-purple/10 border border-accent-purple/20 text-accent-purple text-xs font-semibold tracking-wider uppercase mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-accent-purple animate-pulse-soft" />
          CFG Analysis Tool
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 tracking-tight">
          <span className="gradient-text">Grammar Ambiguity</span>
          <br />
          <span className="text-white">Checker</span>
        </h1>

        {/* Subtitle */}
        <p className="text-gray-400 text-base md:text-lg max-w-xl mx-auto leading-relaxed">
          Enter a Context-Free Grammar and a test string to detect ambiguity.
          <br className="hidden md:block" />
          Visualize all possible parse trees with interactive diagrams.
        </p>
      </div>
    </header>
  );
}
