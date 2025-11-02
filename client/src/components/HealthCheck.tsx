import React, { useState, useEffect, useRef } from "react";
import { ArrowRight, Upload, FileAudio, Download, ExternalLink, CheckCircle2, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import moment from "moment-timezone";

interface Report {
  _id: string;
  prediction: string;
  analysisDate: string;
  pdfUrl: string;
  acousticFeatures?: any;
  confidenceScores?: any;
  findings?: string;
}

const HealthCheck = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [report, setReport] = useState<Report | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [pastReports, setPastReports] = useState<Report[]>([]);
  const [loadingReports, setLoadingReports] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);

  useEffect(() => {
    if (user && token) fetchReports();
  }, [user, token]);

  const fetchReports = async () => {
    if (!token) return;
    setLoadingReports(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/aimodel/reports`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch reports");
      const data = await response.json();
      setPastReports(data.reports);
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setLoadingReports(false);
    }
  };

  const validateFile = (selectedFile: File) => {
    return new Promise<boolean>((resolve) => {
      const fileURL = URL.createObjectURL(selectedFile);
      const audio = new Audio(fileURL);
      audio.onloadedmetadata = () => {
        if (selectedFile.type === "audio/wav" && audio.duration <= 5) {
          URL.revokeObjectURL(fileURL);
          resolve(true);
        } else {
          URL.revokeObjectURL(fileURL);
          resolve(false);
        }
      };
      audio.onerror = () => {
        URL.revokeObjectURL(fileURL);
        resolve(false);
      };
    });
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      const isValid = await validateFile(selectedFile);
      if (isValid) {
        setFile(selectedFile);
      } else {
        alert("Please upload a valid WAV file with a maximum length of 5 seconds.");
        setFile(null);
      }
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragIn = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  };

  const handleDragOut = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounter.current = 0;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const selectedFile = e.dataTransfer.files[0];
      const isValid = await validateFile(selectedFile);
      if (isValid) {
        setFile(selectedFile);
      } else {
        alert("Please upload a valid WAV file with a maximum length of 5 seconds.");
        setFile(null);
      }
      e.dataTransfer.clearData();
    }
  };

  const handleDiagnose = async () => {
    if (!file) {
      alert("Please upload a valid WAV file before diagnosing.");
      return;
    }
    if (!token) {
      alert("Please log in to use this feature.");
      return;
    }
    setIsDiagnosing(true);
    setReport(null);
    const formData = new FormData();
    formData.append("audio", file);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/aimodel/process_audio`, {
        method: "POST",
        headers: { 
          Authorization: `Bearer ${token}`
        },
        body: formData,
        credentials: "include",
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (errorData.needsUpgrade || response.status === 403) {
          const shouldUpgrade = window.confirm(
            errorData.message || "No credits remaining. Would you like to upgrade to Premium?"
          );
          if (shouldUpgrade) {
            navigate("/dashboard/upgrade");
          }
          setIsDiagnosing(false);
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setReport(data.report);
      fetchReports();
      // Refresh user data to update credits
      window.location.reload();
    } catch (error) {
      console.error("Error uploading audio:", error);
      alert("Error processing your audio file. Please try again.");
    } finally {
      setIsDiagnosing(false);
    }
  };

  const handleDownloadPDF = (url: string) => {
    try {
      const link = document.createElement("a");
      let downloadUrl = url;
      if (url.includes('cloudinary.com')) {
        const separator = url.includes('?') ? '&' : '?';
        downloadUrl = `${url}${separator}fl_attachment`;
      }
      link.href = downloadUrl;
      link.download = `voice_pathology_report_${new Date().toISOString().split("T")[0]}.pdf`;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading PDF:", error);
      window.open(url, '_blank');
    }
  };

  const openCloudinaryReport = () => {
    if (report?.pdfUrl) {
      window.open(report.pdfUrl, "_blank");
    } else {
      alert("Report is not available yet. Please diagnose first.");
    }
  };

  const formatDateTime = (dateString: string) => {
    return moment(dateString).tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss");
  };

  const formatShortDate = (dateString: string) => {
    return moment(dateString).tz("Asia/Kolkata").format("MMM DD, YYYY");
  };

  return (
    <div className="font-inter min-h-screen relative bg-[#1C1C1E] text-white">
      <div className="relative z-10">
        <main className="pt-20 pb-24 min-h-screen">
          <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header Section */}
            <div className="text-center mb-16 animate-element" style={{ filter: 'blur(0px)' }}>
              
              <h1 className="text-5xl sm:text-6xl font-semibold text-white mb-4 tracking-tight">
                Voice Health Check
              </h1>
              <p className="text-lg text-[#A1A1AA] max-w-xl mx-auto leading-relaxed">
                Upload your audio file in WAV format for AI-powered diagnosis. Maximum length: 5 seconds.
              </p>
            </div>

            {/* Report Actions - Animated */}
            {report && (
              <div className="mb-8 flex flex-wrap gap-3 justify-center animate-element animate-delay-200" style={{ filter: 'blur(0px)' }}>
                <button
                  onClick={openCloudinaryReport}
                  className="group relative px-6 py-3 bg-[#2C2C2E] text-white rounded-2xl border border-[#3F3F46] hover:border-white/50 hover:bg-white/5 transition-all duration-300 hover:scale-[1.02] hover:-translate-y-0.5 font-medium text-sm"
                >
                  <div className="flex items-center gap-2">
                    <ExternalLink className="w-4 h-4" />
                    View Full Report
                  </div>
                </button>
                <button
                  onClick={() => handleDownloadPDF(report.pdfUrl)}
                  className="group relative px-6 py-3 bg-white text-gray-900 rounded-2xl hover:bg-white/90 transition-all duration-300 hover:scale-[1.02] hover:-translate-y-0.5 font-medium text-sm shadow-lg"
                >
                  <div className="flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Download PDF
                  </div>
                </button>
              </div>
            )}

            {/* Upload Section */}
            <div className="max-w-2xl mx-auto mb-16 animate-element animate-delay-100" style={{ filter: 'blur(0px)' }}>
              <div
                onDragEnter={handleDragIn}
                onDragLeave={handleDragOut}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`
                  relative group bg-[#2C2C2E] rounded-3xl border-2 border-dashed transition-all duration-500
                  ${isDragging ? 'border-white/50 bg-white/5 scale-[1.02] shadow-2xl shadow-white/10' : 'border-[#3F3F46] hover:border-white/30 hover:bg-white/5'}
                  ${file ? 'border-white/50 bg-white/5' : ''}
                  p-12 sm:p-16 shadow-lg
                `}
              >
                <div className="flex flex-col items-center text-center space-y-6">
                  <div className={`
                    w-20 h-20 rounded-2xl flex items-center justify-center transition-all duration-500
                    ${file ? 'bg-white scale-110 shadow-lg' : 'bg-[#3F3F46] group-hover:bg-white/10'}
                  `}>
                    {file ? (
                      <CheckCircle2 className="w-10 h-10 text-gray-900" />
                    ) : (
                      <Upload className={`w-10 h-10 transition-colors duration-300 ${isDragging ? 'text-white' : 'text-[#A1A1AA] group-hover:text-white'}`} />
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <label
                      htmlFor="file-upload"
                      className="cursor-pointer inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-900 rounded-xl font-medium text-sm shadow-lg hover:bg-white/90 transition-all duration-300 hover:scale-105 active:scale-95"
                    >
                      <FileAudio className="w-4 h-4" />
                      Choose Audio File
                    </label>
                    <input
                      id="file-upload"
                      ref={fileInputRef}
                      type="file"
                      accept=".wav"
                      onChange={handleFileChange}
                      className="sr-only"
                    />
                    <p className="text-sm text-[#A1A1AA] mt-3">
                      or drag and drop your file here
                    </p>
                  </div>

                  {file && (
                    <div className="mt-4 px-4 py-3 bg-[#3F3F46] rounded-xl border border-[#3F3F46] shadow-sm animate-element" style={{ filter: 'blur(0px)' }}>
                      <div className="flex items-center gap-3">
                        <FileAudio className="w-5 h-5 text-white shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">{file.name}</p>
                          <p className="text-xs text-[#A1A1AA]">{(file.size / 1024).toFixed(2)} KB</p>
                        </div>
                        <button
                          onClick={() => {
                            setFile(null);
                            if (fileInputRef.current) fileInputRef.current.value = '';
                          }}
                          className="text-[#A1A1AA] hover:text-white transition-colors"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Diagnose Button */}
              <div className="mt-8 text-center animate-element animate-delay-300" style={{ filter: 'blur(0px)' }}>
                <button
                  onClick={handleDiagnose}
                  disabled={!file || isDiagnosing}
                  className={`
                    group relative px-10 py-4 rounded-2xl font-semibold text-base
                    transition-all duration-500 transform
                    ${file && !isDiagnosing
                      ? 'bg-white text-gray-900 shadow-xl hover:bg-white/90 hover:scale-105 active:scale-95'
                      : 'bg-[#3F3F46] text-[#A1A1AA] cursor-not-allowed'
                    }
                  `}
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {isDiagnosing ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Analyzing...
                      </>
                    ) : (
                      <>
                        Start Diagnosis
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                      </>
                    )}
                  </span>
                </button>
              </div>
            </div>

            {/* Results Section */}
            {loadingReports ? (
              <div className="max-w-2xl mx-auto animate-element" style={{ filter: 'blur(0px)' }}>
                <div className="bg-[#2C2C2E] rounded-3xl p-12 border border-[#3F3F46] shadow-lg">
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <svg className="animate-spin h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="text-[#A1A1AA] font-medium">Loading reports...</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6 max-w-4xl mx-auto">
                {/* Current Report */}
                {report && (
                  <div className="bg-[#2C2C2E] rounded-3xl p-8 border border-[#3F3F46] shadow-xl animate-element animate-delay-200" style={{ filter: 'blur(0px)' }}>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-lg">
                        <CheckCircle2 className="w-6 h-6 text-gray-900" />
                      </div>
                      <h2 className="text-2xl font-semibold text-white">Diagnosis Result</h2>
                    </div>
                    
                    <div className="space-y-4 pl-2">
                      <div className="flex items-start gap-4">
                        <div className="flex-1">
                          <p className="text-sm text-[#A1A1AA] mb-1">Predicted Condition</p>
                          <p className="text-2xl font-semibold text-white">
                            {report.prediction}
                          </p>
                        </div>
                      </div>
                      
                      <div className="pt-4 border-t border-[#3F3F46]">
                        <p className="text-sm text-[#A1A1AA] mb-1">Analysis Date</p>
                        <p className="text-base text-white font-medium">{formatDateTime(report.analysisDate)}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Past Reports */}
                <div className="bg-[#2C2C2E] rounded-3xl p-8 border border-[#3F3F46] shadow-xl animate-element animate-delay-300" style={{ filter: 'blur(0px)' }}>
                  <h2 className="text-2xl font-semibold text-white mb-6">Past Reports</h2>
                  
                  {pastReports.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 rounded-2xl bg-[#3F3F46] flex items-center justify-center mx-auto mb-4">
                        <FileAudio className="w-8 h-8 text-[#A1A1AA]" />
                      </div>
                      <p className="text-[#A1A1AA] font-medium">No past reports found.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {pastReports.map((rep: any, index: number) => (
                        <div
                          key={rep._id}
                          className="group bg-[#3F3F46] rounded-2xl p-5 border border-[#3F3F46] hover:border-white/20 hover:bg-white/5 transition-all duration-300 hover:-translate-y-0.5"
                          style={{ animationDelay: `${(index + 1) * 0.1}s` }}
                        >
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-white mb-1">{rep.prediction}</p>
                              <p className="text-xs text-[#A1A1AA]">{formatShortDate(rep.analysisDate)}</p>
                            </div>
                            <button
                              onClick={() => handleDownloadPDF(rep.pdfUrl)}
                              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#2C2C2E] hover:bg-white hover:text-gray-900 text-white transition-all duration-300 text-sm font-medium group-hover:scale-105"
                            >
                              <Download className="w-4 h-4" />
                              Download
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </section>
        </main>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-element {
          animation: fadeInUp 0.6s ease-out forwards;
          opacity: 0;
          filter: blur(0px) !important;
        }
        
        .animate-delay-100 { animation-delay: 0.1s; }
        .animate-delay-200 { animation-delay: 0.2s; }
        .animate-delay-300 { animation-delay: 0.3s; }
        .animate-delay-400 { animation-delay: 0.4s; }
      `}</style>
    </div>
  );
};

export default HealthCheck;

