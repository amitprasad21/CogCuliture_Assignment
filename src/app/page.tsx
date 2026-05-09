import UploadSection from "@/components/UploadSection";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  return (
    <main className="flex-1 flex flex-col relative overflow-hidden bg-black selection:bg-white/30">
      {/* Background Effects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-primary/20 rounded-full mix-blend-screen filter blur-[128px] opacity-50 animate-pulse" />
        <div className="absolute top-1/2 -right-4 w-96 h-96 bg-blue-500/20 rounded-full mix-blend-screen filter blur-[128px] opacity-50" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      </div>

      {/* Navbar */}
      <header className="relative z-10 w-full border-b border-white/5 bg-black/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
              <span className="text-black font-bold text-xl">V</span>
            </div>
            <span className="text-white font-medium tracking-tight">Veritas AI</span>
          </div>
          <nav className="flex items-center gap-6">
            <a href="#" className="text-sm text-white/60 hover:text-white transition-colors">Dashboard</a>
            <a href="#" className="text-sm text-white/60 hover:text-white transition-colors">History</a>
            <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-xs">
              U
            </div>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-24">
        <div className="space-y-6 text-center max-w-2xl mb-16">
          <Badge variant="outline" className="border-white/10 bg-white/5 text-white/70 backdrop-blur-sm px-4 py-1.5">
            Gemini 1.5 Powered
          </Badge>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40">
            Truth, verified at scale.
          </h1>
          <p className="text-lg text-white/50 leading-relaxed max-w-xl mx-auto">
            Upload any document. Our AI extracts claims, cross-references trusted sources, and delivers a comprehensive factual analysis in seconds.
          </p>
        </div>

        <UploadSection />
      </div>
    </main>
  );
}
