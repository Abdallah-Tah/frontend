"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, FileImage, Download, Loader2 } from "lucide-react";

export default function Home() {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const fileArray = Array.from(files);
      console.log(`🔍 Raw file selection: ${fileArray.length} files`);

      // Accept ALL files - no filtering, let backend handle validation
      console.log(`✅ Accepting all ${fileArray.length} files for processing`);
      console.log(
        `📁 Files:`,
        fileArray.map((f) => ({ name: f.name, size: f.size, type: f.type }))
      );

      if (fileArray.length > 0) {
        alert(
          `🎉 Successfully selected ${fileArray.length} files ready for processing! Backend will attempt to process all files as images.`
        );
      }

      setSelectedFiles(fileArray);
      setPdfUrl(null); // Reset previous PDF
    }
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      alert("Please select at least one image file.");
      return;
    }

    console.log(`🚀 Starting upload of ${selectedFiles.length} files...`);
    setIsLoading(true);
    const formData = new FormData();

    // Add each file to FormData with detailed logging
    selectedFiles.forEach((file, index) => {
      console.log(
        `📎 Adding file ${index + 1}/${selectedFiles.length}: ${file.name} (${(
          file.size /
          1024 /
          1024
        ).toFixed(2)} MB)`
      );
      formData.append("files", file);
    });

    console.log(
      `📤 FormData created with ${selectedFiles.length} files. Starting upload...`
    );

    try {
      const response = await fetch("http://localhost:8000/convert", {
        method: "POST",
        body: formData,
      });

      console.log(`📥 Response received. Status: ${response.status}`);

      if (response.ok) {
        // Check response headers for processing info
        const processedImages = response.headers.get("X-Processed-Images");
        const totalFiles = response.headers.get("X-Total-Files");
        const skippedFiles = response.headers.get("X-Skipped-Files");

        console.log(
          `✅ Success! Processed: ${processedImages}, Total: ${totalFiles}, Skipped: ${skippedFiles}`
        );

        if (processedImages && totalFiles) {
          alert(
            `🎉 PDF created successfully!\n\nProcessed: ${processedImages} images\nTotal files sent: ${totalFiles}\nSkipped: ${
              skippedFiles || 0
            } files`
          );
        }

        const blob = await response.blob();
        console.log(
          `📄 PDF blob size: ${(blob.size / 1024 / 1024).toFixed(2)} MB`
        );
        const url = URL.createObjectURL(blob);
        setPdfUrl(url);
      } else {
        const errorData = await response.json();
        console.error("❌ Error:", errorData);
        alert(
          `Failed to convert images: ${
            errorData.error || "Unknown error"
          }\n\nCheck console for details.`
        );
      }
    } catch (error) {
      console.error("💥 Upload error:", error);
      alert(
        "Failed to connect to server. Make sure the backend is running on port 8000.\n\nError: " +
          error
      );
    } finally {
      setIsLoading(false);
      console.log(`⏹️ Upload process completed.`);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    if (newFiles.length === 0 && fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              SnapMerge
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Professional document converter for immigration visa applications -
            adds labeled filenames to each document
          </p>
        </div>

        {/* Main Card */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            {/* Upload Section */}
            <div className="p-8 border-b border-gray-100">
              <div className="text-center">
                <div
                  onClick={triggerFileSelect}
                  className="border-2 border-dashed border-gray-300 rounded-xl p-12 hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 cursor-pointer group"
                >
                  <Upload className="mx-auto h-16 w-16 text-gray-400 group-hover:text-blue-500 transition-colors duration-200" />
                  <h3 className="mt-4 text-xl font-semibold text-gray-700 group-hover:text-blue-600">
                    Select Files
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">
                    Click here to select multiple files or drag and drop them
                  </p>
                  <p className="mt-1 text-xs text-gray-400">
                    All files will be processed and converted to images with
                    professional labels
                  </p>
                  <p className="mt-1 text-xs text-blue-600">
                    ✅ Each document will be labeled with filename for official
                    presentation.
                  </p>
                </div>

                <Input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="*/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                <div className="mt-6 flex justify-center space-x-4">
                  <Button
                    onClick={triggerFileSelect}
                    variant="outline"
                    size="lg"
                    className="px-8"
                  >
                    <FileImage className="mr-2 h-5 w-5" />
                    Choose Files
                  </Button>

                  {selectedFiles.length > 0 && (
                    <Button
                      onClick={handleUpload}
                      disabled={isLoading}
                      size="lg"
                      className="px-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Converting...
                        </>
                      ) : (
                        <>
                          <Upload className="mr-2 h-5 w-5" />
                          Convert to PDF
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Selected Files Section */}
            {selectedFiles.length > 0 && (
              <div className="p-8 bg-gray-50">
                <h4 className="text-lg font-semibold text-gray-700 mb-4">
                  Selected Files ({selectedFiles.length})
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-64 overflow-y-auto">
                  {selectedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 shadow-sm"
                    >
                      <div className="flex items-center space-x-3">
                        <FileImage className="h-8 w-8 text-blue-500 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {file.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatFileSize(file.size)}
                          </p>
                        </div>
                      </div>
                      <Button
                        onClick={() => removeFile(index)}
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Success Section */}
            {pdfUrl && !isLoading && (
              <div className="p-8 bg-green-50 border-t border-green-200">
                <div className="text-center">
                  <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                    <Download className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-green-800 mb-2">
                    PDF Created Successfully!
                  </h3>
                  <p className="text-green-600 mb-6">
                    Your images have been converted and merged into a single PDF
                    file.
                  </p>
                  <Button
                    asChild
                    size="lg"
                    className="px-8 bg-green-600 hover:bg-green-700"
                  >
                    <a href={pdfUrl} download="snapmerge-converted.pdf">
                      <Download className="mr-2 h-5 w-5" />
                      Download PDF
                    </a>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12">
          <p className="text-sm text-gray-500">
            Backend running on{" "}
            <code className="bg-gray-200 px-2 py-1 rounded text-xs">
              http://localhost:8000
            </code>
          </p>
        </div>
      </div>
    </div>
  );
}
