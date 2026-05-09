"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function UploadSection() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const router = useRouter();

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      handleFileSelection(droppedFile);
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelection(e.target.files[0]);
    }
  };

  const handleFileSelection = (selectedFile: File) => {
    if (selectedFile.type !== "application/pdf") {
      toast.error("Invalid file type. Please upload a PDF file.");
      return;
    }
    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setProgress(0);

    // Simulate progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 10;
      });
    }, 300);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Failed to upload file");
      }

      const data = await res.json();
      
      setProgress(100);
      clearInterval(interval);
      toast.success("File uploaded successfully! Starting analysis...");
      
      setTimeout(() => {
        router.push(`/dashboard/report/${data.reportId}`);
      }, 1000);

    } catch (error) {
      clearInterval(interval);
      setProgress(0);
      setIsUploading(false);
      toast.error("Error uploading file. Please try again.");
      console.error(error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-3xl mx-auto"
    >
      <div
        className={`relative overflow-hidden rounded-2xl border ${
          isDragging
            ? "border-primary/50 bg-primary/5"
            : "border-white/10 bg-black/40 backdrop-blur-xl"
        } p-12 transition-all duration-300 group`}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col items-center justify-center text-center space-y-6">
          <div className="p-4 rounded-full bg-white/5 border border-white/10">
            <Upload className="w-8 h-8 text-white/70" />
          </div>
          
          <div className="space-y-2">
            <h3 className="text-2xl font-medium tracking-tight text-white">
              Upload Document for Verification
            </h3>
            <p className="text-sm text-white/50 max-w-sm mx-auto">
              Drag and drop your PDF file here, or click to browse. We'll extract and verify factual claims automatically.
            </p>
          </div>

          <AnimatePresence mode="wait">
            {!file ? (
              <motion.div
                key="upload-btn"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="pt-4"
              >
                <label htmlFor="file-upload" className="cursor-pointer">
                  <span className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-10 px-8 py-2">
                    Browse Files
                  </span>
                  <input
                    id="file-upload"
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    onChange={onFileChange}
                  />
                </label>
              </motion.div>
            ) : (
              <motion.div
                key="file-info"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-md pt-6 space-y-4"
              >
                <div className="flex items-center p-4 bg-white/5 border border-white/10 rounded-xl">
                  <FileText className="w-6 h-6 text-primary mr-4 flex-shrink-0" />
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-sm font-medium text-white truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-white/50">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  {!isUploading && (
                    <button
                      onClick={() => setFile(null)}
                      className="p-2 text-white/50 hover:text-white transition-colors"
                    >
                      <AlertCircle className="w-5 h-5" />
                    </button>
                  )}
                </div>

                {isUploading ? (
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-white/50">
                      <span>Uploading & Processing</span>
                      <span>{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-1" />
                  </div>
                ) : (
                  <Button
                    onClick={handleUpload}
                    className="w-full bg-white text-black hover:bg-white/90"
                    disabled={isUploading}
                  >
                    Start Verification
                  </Button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
