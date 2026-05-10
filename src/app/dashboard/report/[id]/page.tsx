"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  ExternalLink,
  RefreshCw,
  Download,
  User,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Link from "next/link";

interface Claim {
  id: string;
  original_text: string;
  category: string;
  status:
    | "verified"
    | "inaccurate"
    | "false"
    | "misleading"
    | "unverified"
    | "verifying";
  confidence_score?: number;
  corrected_fact?: string;
  explanation?: string;
  sources?: { title: string; url: string; snippet: string }[];
}

export default function ReportPage() {
  const { id } = useParams();
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem(`report-${id}`);
    if (!stored) {
      setError(
        "No report data found. Please upload a document from the dashboard."
      );
      setLoading(false);
      return;
    }

    try {
      const { claims: rawClaims } = JSON.parse(stored);
      if (!rawClaims || rawClaims.length === 0) {
        setError("No claims were extracted from the document.");
        setLoading(false);
        return;
      }

      const initialClaims: Claim[] = rawClaims.map(
        (c: { original_text: string; category: string }, i: number) => ({
          id: String(i + 1),
          original_text: c.original_text,
          category: c.category,
          status: "verifying" as const,
        })
      );

      setClaims(initialClaims);
      setLoading(false);

      verifyClaims(initialClaims);
    } catch {
      setError("Failed to load report data.");
      setLoading(false);
    }
  }, [id]);

  const verifyClaims = async (claimsToVerify: Claim[]) => {
    for (const claim of claimsToVerify) {
      try {
        const res = await fetch("/api/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            claimText: claim.original_text,
            category: claim.category,
          }),
        });

        if (!res.ok) throw new Error("Verification failed");

        const result = await res.json();

        setClaims((prev) =>
          prev.map((c) =>
            c.id === claim.id
              ? {
                  ...c,
                  status: result.status || "unverified",
                  confidence_score: result.confidence_score,
                  corrected_fact: result.corrected_fact,
                  explanation: result.explanation,
                  sources: result.sources,
                }
              : c
          )
        );
      } catch {
        setClaims((prev) =>
          prev.map((c) =>
            c.id === claim.id
              ? {
                  ...c,
                  status: "unverified",
                  explanation: "Verification request failed.",
                }
              : c
          )
        );
      }
    }

    toast.success("All claims have been verified.");
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "verified":
        return <ShieldCheck className="w-5 h-5 text-emerald-500" />;
      case "inaccurate":
        return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case "false":
        return <ShieldAlert className="w-5 h-5 text-red-500" />;
      case "misleading":
        return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      case "verifying":
        return <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-white/50" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "verified":
        return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      case "inaccurate":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "false":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      case "misleading":
        return "bg-orange-500/10 text-orange-500 border-orange-500/20";
      case "verifying":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      default:
        return "bg-white/5 text-white/50 border-white/10";
    }
  };

  const handleExport = () => {
    toast.success("Preparing PDF Document...", { id: "pdf-toast" });
    setTimeout(() => {
      window.print();
    }, 500);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center space-y-4">
        <RefreshCw className="w-8 h-8 text-primary animate-spin" />
        <p className="text-white/60">Loading report...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center space-y-4">
        <ShieldAlert className="w-8 h-8 text-red-500" />
        <p className="text-white/60">{error}</p>
        <Link href="/">
          <Button
            variant="outline"
            className="border-white/10 text-white bg-black hover:bg-white/5"
          >
            Go to Dashboard
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pb-20 font-sans">
      <header className="relative z-10 w-full border-b border-white/5 bg-black/60 backdrop-blur-xl print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 transition-opacity hover:opacity-80"
          >
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/30">
              <ShieldCheck className="w-5 h-5 text-primary" />
            </div>
            <span className="text-white font-medium tracking-tight text-lg">
              VerifyDoc
            </span>
          </Link>
          <nav className="flex items-center gap-4 sm:gap-6">
            <Link
              href="/"
              className="text-sm font-medium text-white/60 hover:text-white transition-colors"
            >
              Dashboard
            </Link>
            <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-xs ml-2">
              <User className="w-4 h-4 text-white/80" />
            </div>
          </nav>
        </div>
      </header>

      <div className="sticky top-0 z-40 border-b border-white/5 bg-black/90 backdrop-blur-md print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="font-semibold text-base sm:text-lg">
              Verification Report
            </h1>
            <Badge
              variant="outline"
              className="border-white/10 text-white/50 hidden sm:inline-flex"
            >
              {claims.filter((c) => c.status !== "verifying").length}/
              {claims.length} verified
            </Badge>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            className="border-white/10 hover:bg-white/5 text-white bg-black"
          >
            <Download className="w-4 h-4 sm:mr-2" />{" "}
            <span className="hidden sm:inline">Export PDF</span>
          </Button>
        </div>
      </div>

      <main
        ref={reportRef}
        className="max-w-5xl mx-auto px-4 sm:px-6 mt-8 sm:mt-12 space-y-8 bg-black"
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="col-span-1 md:col-span-4 bg-white/5 border-white/10 p-6">
            <h2 className="text-xl font-medium mb-4 text-white">
              Analysis Summary
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-black/50 border border-white/5">
                <div className="text-sm text-white/50 mb-1">Total Claims</div>
                <div className="text-2xl font-semibold text-white">
                  {claims.length}
                </div>
              </div>
              <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                <div className="text-sm text-emerald-500/70 mb-1">
                  Verified
                </div>
                <div className="text-2xl font-semibold text-emerald-500">
                  {claims.filter((c) => c.status === "verified").length}
                </div>
              </div>
              <div className="p-4 rounded-xl bg-orange-500/5 border border-orange-500/10">
                <div className="text-sm text-orange-500/70 mb-1">
                  Misleading
                </div>
                <div className="text-2xl font-semibold text-orange-500">
                  {claims.filter((c) => c.status === "misleading").length}
                </div>
              </div>
              <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/10">
                <div className="text-sm text-red-500/70 mb-1">False</div>
                <div className="text-2xl font-semibold text-red-500">
                  {claims.filter((c) => c.status === "false").length}
                </div>
              </div>
            </div>
          </Card>

          <div className="col-span-1 md:col-span-4 space-y-6">
            <h3 className="text-lg font-medium text-white/90">
              Detailed Findings
            </h3>
            {claims.map((claim, index) => (
              <motion.div
                key={claim.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-white/5 border-white/10 p-4 sm:p-6 overflow-hidden relative">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-white/20 to-transparent" />

                  <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-6">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                        <Badge
                          variant="outline"
                          className="border-white/10 uppercase text-[10px] tracking-wider text-white/60"
                        >
                          {claim.category}
                        </Badge>
                        <Badge
                          className={`${getStatusColor(claim.status)} capitalize`}
                        >
                          {getStatusIcon(claim.status)}
                          <span className="ml-2">
                            {claim.status === "verifying"
                              ? "Verifying..."
                              : claim.status}
                          </span>
                        </Badge>
                      </div>
                      <h4 className="text-lg sm:text-xl font-medium text-white mt-3">
                        &ldquo;{claim.original_text}&rdquo;
                      </h4>
                    </div>
                    {claim.confidence_score != null && (
                      <div className="text-left sm:text-right w-full sm:w-auto mt-2 sm:mt-0">
                        <div className="text-sm text-white/50 mb-1">
                          Confidence
                        </div>
                        <div className="text-2xl font-semibold text-white">
                          {claim.confidence_score}%
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    {claim.corrected_fact && (
                      <div className="p-4 rounded-lg bg-black/40 border border-white/5 text-sm">
                        <span className="text-white/50 font-medium block mb-1">
                          Corrected Fact:
                        </span>
                        <span className="text-white/90">
                          {claim.corrected_fact}
                        </span>
                      </div>
                    )}

                    {claim.explanation && (
                      <div className="text-sm text-white/70 leading-relaxed">
                        {claim.explanation}
                      </div>
                    )}

                    {claim.sources && claim.sources.length > 0 && (
                      <div className="pt-4 border-t border-white/5">
                        <div className="text-xs font-medium text-white/40 uppercase tracking-wider mb-3">
                          Sources
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {claim.sources.map((source, i) => (
                            <a
                              key={i}
                              href={source.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center text-xs px-3 py-1.5 rounded-md bg-white/5 hover:bg-white/10 border border-white/5 text-white/70 hover:text-white transition-colors"
                            >
                              <ExternalLink className="w-3 h-3 mr-2 flex-shrink-0" />
                              <span className="truncate max-w-[200px] sm:max-w-xs">
                                {source.title}
                              </span>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
