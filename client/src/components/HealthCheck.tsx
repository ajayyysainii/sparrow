import React, { useState, useEffect } from "react";
import { ArrowRight } from "lucide-react";
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
  const { user, token } = useAuth();
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [report, setReport] = useState<Report | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [pastReports, setPastReports] = useState<Report[]>([]);
  const [loadingReports, setLoadingReports] = useState(true);

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

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      const fileURL = URL.createObjectURL(selectedFile);
      const audio = new Audio(fileURL);
      audio.onloadedmetadata = () => {
        if (selectedFile.type === "audio/wav" && audio.duration <= 5) {
          setFile(selectedFile);
        } else {
          alert("Please upload a valid WAV file with a maximum length of 5 seconds.");
          setFile(null);
        }
      };
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
          // Don't set Content-Type for FormData - browser will set it automatically with boundary
        },
        body: formData,
        credentials: "include",
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setReport(data.report);
      fetchReports();
    } catch (error) {
      console.error("Error uploading audio:", error);
      alert("Error processing your audio file. Please try again.");
    } finally {
      setIsDiagnosing(false);
    }
  };

  const handleDownloadPDF = (url: string) => {
    try {
      // For Cloudinary URLs, use direct link download which bypasses CORS
      // Create an anchor element with download attribute
      const link = document.createElement("a");
      
      // For Cloudinary, add fl_attachment to force download
      let downloadUrl = url;
      if (url.includes('cloudinary.com')) {
        // Check if URL already has query parameters
        const separator = url.includes('?') ? '&' : '?';
        downloadUrl = `${url}${separator}fl_attachment`;
      }
      
      link.href = downloadUrl;
      link.download = `voice_pathology_report_${new Date().toISOString().split("T")[0]}.pdf`;
      link.target = '_blank'; // Open in new tab as fallback
      link.rel = 'noopener noreferrer'; // Security best practice
      
      // Append to body, click, then remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // If download doesn't work (some browsers), the link will open in new tab
      // Set a timeout to handle cases where download attribute isn't supported
      setTimeout(() => {
        // If the user is still on the same page after a short delay,
        // the download likely didn't work, so we could open in new tab
        // But we'll let the browser handle it naturally
      }, 100);
    } catch (error) {
      console.error("Error downloading PDF:", error);
      // Fallback: open in new tab
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

  return (
    <div className="font-inter bg-[#1C1C1E] min-h-screen relative">
      <div className="relative z-10">
        <main className="pt-24 pb-16 min-h-screen">
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {report && (
              <div className="mb-8 flex gap-4">
                <button onClick={openCloudinaryReport} className="px-4 py-2 bg-white text-gray-900 rounded-lg">
                  View Full Report
                </button>
                <button onClick={() => handleDownloadPDF(report.pdfUrl)} className="px-4 py-2 bg-white text-gray-900 rounded-lg">
                  Download PDF
                </button>
              </div>
            )}
            <div className="text-center space-y-6">
              <h1 className="text-5xl sm:text-6xl font-bold text-white">Voice Health Check</h1>
              <p className="text-lg text-[#AAAAAA] max-w-2xl mx-auto">
                Upload your audio file in WAV format for diagnosis. Maximum length: 5 seconds.
              </p>
              
              {/* Hero Icon */}
              <div className="mt-12 flex justify-center">
                <div className="relative w-32 h-32 flex items-center justify-center">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-white/5 rounded-[2rem] backdrop-blur-xl"></div>
                  <div className="relative w-full h-full flex items-center justify-center">
                    <svg className="w-16 h-16 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Upload Button */}
              <div className="mt-8 flex flex-col items-center gap-4">
                <label htmlFor="file-upload" className="cursor-pointer">
                  <button className="bg-white text-gray-900 border-0 rounded-lg px-8 py-3 text-base font-semibold cursor-pointer inline-flex items-center gap-2 transition-all duration-200 shadow-lg shadow-white/30 hover:shadow-xl hover:shadow-white/40 hover:bg-white/90">
                    Upload .WAV File
                  </button>
                </label>
                <input id="file-upload" type="file" accept=".wav" onChange={handleFileChange} className="sr-only" />
                <span className="text-[#AAAAAA] text-center text-sm">{file ? file.name : "No file chosen"}</span>
              </div>

              {/* Start Diagnosis Button */}
              <button 
                onClick={handleDiagnose} 
                disabled={!file || isDiagnosing}
                className="mt-8 !bg-white !text-gray-900 border-0 rounded-lg px-8 py-4 text-lg font-semibold cursor-pointer inline-flex items-center gap-3 transition-all duration-200 shadow-lg shadow-white/30 hover:shadow-xl hover:shadow-white/40 hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed disabled:!bg-white disabled:!text-gray-900"
              >
                {isDiagnosing ? "Diagnosing..." : "Start Diagnosis"}
                {!isDiagnosing && <ArrowRight className="w-5 h-5" />}
              </button>
            </div>
            {loadingReports ? (
              <p className="text-center text-[#AAAAAA] mt-8">Loading past reports...</p>
            ) : (
              <div className="space-y-8 mt-8">
                {report && (
                  <div className="bg-[#27272A] p-8 rounded-lg border border-[#27272A]">
                    <h2 className="text-2xl font-semibold text-white mb-4">Diagnosis Result</h2>
                    <div className="text-xl font-medium text-[#E0E0E0] mb-4">
                      Predicted Condition: <span className="text-white">{report.prediction}</span>
                    </div>
                    <div className="text-[#AAAAAA] mb-4">Analysis Date: {formatDateTime(report.analysisDate)}</div>
                  </div>
                )}
                {/* Past Reports Card */}
                <div className="bg-[#27272A] rounded-lg border border-[#27272A] p-6">
                  <h2 className="text-xl font-semibold text-white mb-4">Past Reports</h2>
                  <div className="space-y-4">
                    {pastReports.length === 0 ? (
                      <p className="text-[#AAAAAA] text-sm">No past reports found.</p>
                    ) : (
                      <div className="space-y-3">
                        {pastReports.map((rep: any) => (
                          <div key={rep._id} className="border-b border-[#27272A] pb-3 last:border-0">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className="text-sm font-medium text-[#E0E0E0] mb-1">
                                  {formatDateTime(rep.analysisDate)}
                                </p>
                                <p className="text-sm text-[#AAAAAA]">{rep.prediction}</p>
                              </div>
                              <button 
                                onClick={() => handleDownloadPDF(rep.pdfUrl)} 
                                className="text-sm text-white hover:underline ml-4"
                              >
                                Download
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
};

export default HealthCheck;

