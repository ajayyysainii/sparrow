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
    <div className="font-inter bg-white min-h-screen relative">
      <div className="relative z-10">
        <main className="pt-24 pb-16 min-h-screen">
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {report && (
              <div className="mb-8 flex gap-4">
                <button onClick={openCloudinaryReport} className="px-4 py-2 bg-pink-500 text-white rounded-full">
                  View Full Report
                </button>
                <button onClick={() => handleDownloadPDF(report.pdfUrl)} className="px-4 py-2 bg-pink-500 text-white rounded-full">
                  Download PDF
                </button>
              </div>
            )}
            <div className="text-center space-y-4">
              <h1 className="text-5xl sm:text-6xl font-bold text-pink-500">Voice Health Check</h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Upload your audio file in WAV format for diagnosis. Maximum length: 5 seconds.
              </p>
              <div className="mt-8 bg-pink-100/50 p-8 rounded-lg border-2 border-dashed border-pink-500 flex flex-col items-center">
                <label htmlFor="file-upload" className="cursor-pointer bg-pink-500 text-white py-4 px-8 rounded-lg">
                  Choose File
                </label>
                <input id="file-upload" type="file" accept=".wav" onChange={handleFileChange} className="sr-only" />
                <span className="mt-4 text-gray-600 text-center">{file ? file.name : "No file chosen"}</span>
              </div>
              <button onClick={handleDiagnose} className="mt-8 rounded-full px-8 py-3 text-lg bg-pink-500 text-white">
                {isDiagnosing ? "Diagnosing..." : "Start Diagnosis"}
                <ArrowRight className="ml-2 inline" size={18} />
              </button>
            </div>
            {loadingReports ? (
              <p className="text-center text-gray-500 mt-8">Loading past reports...</p>
            ) : (
              <div className="space-y-8 mt-8">
                {report && (
                  <div className="bg-white p-8 rounded-xl border shadow-lg">
                    <h2 className="text-2xl font-semibold text-pink-500 mb-4">Diagnosis Result</h2>
                    <div className="text-xl font-medium text-gray-800 mb-4">
                      Predicted Condition: <span className="text-pink-500">{report.prediction}</span>
                    </div>
                    <div className="text-gray-600 mb-4">Analysis Date: {formatDateTime(report.analysisDate)}</div>
                  </div>
                )}
                <div className="bg-white p-8 rounded-xl border shadow-lg">
                  <h2 className="text-2xl font-semibold text-pink-500 mb-4">Past Reports</h2>
                  <ul>
                    {pastReports.length === 0 ? (
                      <p className="text-gray-600">No past reports found.</p>
                    ) : (
                      pastReports.map((rep: any) => (
                        <li key={rep._id} className="text-gray-700 mb-2">
                          <strong>{formatDateTime(rep.analysisDate)}:</strong> {rep.prediction}{" "}
                          <button onClick={() => handleDownloadPDF(rep.pdfUrl)} className="text-blue-600 ml-2 underline">
                            Download
                          </button>
                        </li>
                      ))
                    )}
                  </ul>
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

