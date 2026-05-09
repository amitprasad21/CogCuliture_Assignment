"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { ShieldCheck, ShieldAlert, AlertTriangle, ExternalLink, RefreshCw, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Claim {
  id: string;
  original_text: string;
  category: string;
  status: "verified" | "inaccurate" | "false" | "misleading" | "unverified";
  confidence_score?: number;
  corrected_fact?: string;
  explanation?: string;
  sources?: { title: string; url: string; snippet: string }[];
}

export default function ReportPage() {
  const { id } = useParams();
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, we would fetch from Supabase.
    // For demo purposes, we will mock the claims if the backend isn't connected.
    const mockClaims: Claim[] = [
      {
        id: "1",
        original_text: "Our revenue grew by 150% in the last fiscal year.",
        category: "financial",
        status: "verified",
        confidence_score: 95,
        explanation: "Multiple reliable financial reports confirm this growth.",
        sources: [
          { title: "Annual Financial Report", url: "#", snippet: "The company reported a 150% year-over-year growth..." }
        ]
      },
      {
        id: "2",
        original_text: "The new AI model uses 90% less energy than predecessors.",
        category: "technical",
        status: "misleading",
        confidence_score: 80,
        corrected_fact: "The new model uses 40% less energy, but up to 90% less in idle states only.",
        explanation: "The 90% figure only applies to idle states, not active processing.",
        sources: [
          { title: "Tech Architecture Review", url: "#", snippet: "Energy consumption drops by 90% during idle, 40% active." }
        ]
      },
      {
        id: "3",
        original_text: "We acquired 10 million new users in January.",
        category: "statistics",
        status: "false",
        confidence_score: 98,
        corrected_fact: "User acquisition in January was 1.2 million.",
        explanation: "The 10 million figure represents total users, not new acquisitions for January.",
        sources: [
          { title: "Q1 Growth metrics", url: "#", snippet: "Total users reached 10M, adding 1.2M in Jan." }
        ]
      }
    ];

    setTimeout(() => {
      setClaims(mockClaims);
      setLoading(false);
    }, 1500);
  }, [id]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "verified": return <ShieldCheck className="w-5 h-5 text-emerald-500" />;
      case "inaccurate": return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case "false": return <ShieldAlert className="w-5 h-5 text-red-500" />;
      case "misleading": return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      default: return <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "verified": return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      case "inaccurate": return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "false": return "bg-red-500/10 text-red-500 border-red-500/20";
      case "misleading": return "bg-orange-500/10 text-orange-500 border-orange-500/20";
      default: return "bg-blue-500/10 text-blue-500 border-blue-500/20";
    }
  };

  const handleExport = () => {
    toast.success("Exporting report as PDF...");
    // Future PDF export logic
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center space-y-4">
        <RefreshCw className="w-8 h-8 text-primary animate-spin" />
        <p className="text-white/60">Analyzing factual claims...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-black/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="font-semibold text-lg">Verification Report</h1>
            <Badge variant="outline" className="border-white/10 text-white/50">ID: {id}</Badge>
          </div>
          <Button variant="outline" size="sm" onClick={handleExport} className="border-white/10 hover:bg-white/5 text-white">
            <Download className="w-4 h-4 mr-2" /> Export PDF
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-6 mt-12 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="col-span-1 md:col-span-4 bg-white/5 border-white/10 p-6">
            <h2 className="text-xl font-medium mb-4 text-white">Analysis Summary</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-black/50 border border-white/5">
                <div className="text-sm text-white/50 mb-1">Total Claims</div>
                <div className="text-2xl font-semibold text-white">{claims.length}</div>
              </div>
              <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                <div className="text-sm text-emerald-500/70 mb-1">Verified</div>
                <div className="text-2xl font-semibold text-emerald-500">
                  {claims.filter(c => c.status === "verified").length}
                </div>
              </div>
              <div className="p-4 rounded-xl bg-orange-500/5 border border-orange-500/10">
                <div className="text-sm text-orange-500/70 mb-1">Misleading</div>
                <div className="text-2xl font-semibold text-orange-500">
                  {claims.filter(c => c.status === "misleading").length}
                </div>
              </div>
              <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/10">
                <div className="text-sm text-red-500/70 mb-1">False</div>
                <div className="text-2xl font-semibold text-red-500">
                  {claims.filter(c => c.status === "false").length}
                </div>
              </div>
            </div>
          </Card>

          <div className="col-span-1 md:col-span-4 space-y-6">
            <h3 className="text-lg font-medium text-white/90">Detailed Findings</h3>
            {claims.map((claim, index) => (
              <motion.div
                key={claim.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-white/5 border-white/10 p-6 overflow-hidden relative">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-white/20 to-transparent" />
                  
                  <div className="flex items-start justify-between gap-4 mb-6">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="border-white/10 uppercase text-[10px] tracking-wider text-white/60">
                          {claim.category}
                        </Badge>
                        <Badge className={`${getStatusColor(claim.status)} capitalize`}>
                          {getStatusIcon(claim.status)}
                          <span className="ml-2">{claim.status}</span>
                        </Badge>
                      </div>
                      <h4 className="text-xl font-medium text-white mt-3">"{claim.original_text}"</h4>
                    </div>
                    {claim.confidence_score && (
                      <div className="text-right">
                        <div className="text-sm text-white/50 mb-1">Confidence</div>
                        <div className="text-2xl font-semibold text-white">{claim.confidence_score}%</div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    {claim.corrected_fact && (
                      <div className="p-4 rounded-lg bg-black/40 border border-white/5 text-sm">
                        <span className="text-white/50 font-medium block mb-1">Corrected Fact:</span>
                        <span className="text-white/90">{claim.corrected_fact}</span>
                      </div>
                    )}
                    
                    {claim.explanation && (
                      <div className="text-sm text-white/70 leading-relaxed">
                        {claim.explanation}
                      </div>
                    )}

                    {claim.sources && claim.sources.length > 0 && (
                      <div className="pt-4 border-t border-white/5">
                        <div className="text-xs font-medium text-white/40 uppercase tracking-wider mb-3">Sources</div>
                        <div className="flex flex-wrap gap-2">
                          {claim.sources.map((source, i) => (
                            <a
                              key={i}
                              href={source.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center text-xs px-3 py-1.5 rounded-md bg-white/5 hover:bg-white/10 border border-white/5 text-white/70 hover:text-white transition-colors"
                            >
                              <ExternalLink className="w-3 h-3 mr-2" />
                              {source.title}
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
