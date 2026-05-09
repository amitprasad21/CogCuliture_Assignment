import UploadSection from "@/components/UploadSection";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, User } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex-1 flex flex-col relative overflow-hidden bg-black selection:bg-white/30 min-h-screen">
      {/* Background Effects */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 -left-4 w-64 md:w-96 h-64 md:h-96 bg-primary/10 rounded-full mix-blend-screen filter blur-[128px] opacity-30" />
        <div className="absolute top-1/2 -right-4 w-64 md:w-96 h-64 md:h-96 bg-blue-500/10 rounded-full mix-blend-screen filter blur-[128px] opacity-30" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      </div>

      {/* Navbar */}
      <header className="relative z-10 w-full border-b border-white/5 bg-black/60 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/30">
              <ShieldCheck className="w-5 h-5 text-primary" />
            </div>
            <span className="text-white font-medium tracking-tight text-lg">VerifyDoc</span>
          </Link>
          <nav className="flex items-center gap-4 sm:gap-6">
            <Link href="/" className="text-sm font-medium text-white/90 hover:text-white transition-colors">Dashboard</Link>
            <Link href="/dashboard/report/1" className="text-sm font-medium text-white/60 hover:text-white transition-colors">Recent History</Link>
            <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-xs ml-2 cursor-pointer hover:bg-white/20 transition-colors">
              <User className="w-4 h-4 text-white/80" />
            </div>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-12 md:py-24">
        <div className="space-y-4 md:space-y-6 text-center max-w-2xl mb-10 md:mb-16">
          <Badge variant="outline" className="border-white/10 bg-white/5 text-white/70 backdrop-blur-sm px-4 py-1.5 font-medium">
            Document Verification Platform
          </Badge>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white leading-tight">
            Verify claims <br className="hidden sm:block" /> with confidence.
          </h1>
          <p className="text-base md:text-lg text-white/50 leading-relaxed max-w-xl mx-auto px-4 sm:px-0">
            Upload any document. Our system automatically extracts statements, cross-references sources, and delivers a comprehensive factual analysis.
          </p>
        </div>

        <div className="w-full px-2 sm:px-0">
          <UploadSection />
        </div>
      </div>
    </main>
  );
}
