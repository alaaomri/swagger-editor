import React from 'react';

interface FileUploadProps {
  onFileLoaded: (content: string, fileName: string) => void;
  isLoading: boolean;
  error: string | null;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileLoaded, isLoading, error }) => {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        onFileLoaded(content, file.name);
      };
      reader.onerror = () => {
        onFileLoaded('', file.name);
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="relative">
      <input
        type="file"
        id="file-upload"
        accept=".json,.yaml,.yml"
        onChange={handleFileChange}
        disabled={isLoading}
        className="hidden"
      />
      <label
        htmlFor="file-upload"
        className={`flex items-center justify-center px-6 py-3 rounded-lg font-medium cursor-pointer transition-colors text-sm ${
          isLoading 
            ? 'bg-gray-300 cursor-not-allowed text-gray-500' 
            : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md'
        }`}
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Loading...
          </>
        ) : (
          <>
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
            </svg>
            Upload JSON
          </>
        )}
      </label>
      
      {error && (
        <div className="absolute mt-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm max-w-xs">
          <div className="flex items-start">
            <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span>{error}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;