import React, { useState, useCallback } from 'react';
import FileUpload from './components/FileUpload';
import SwaggerEditor from './components/SwaggerEditor';
import SwaggerPreview from './components/SwaggerPreview';
import { validateAndParseSwaggerJson } from './services/swaggerService';
import * as jsyaml from 'js-yaml';
import { OpenApiSpec, FileState } from './types';

const App: React.FC = () => {
  const [fileState, setFileState] = useState<FileState>('empty');
  const [fileName, setFileName] = useState<string>('');
  const [originalSpec, setOriginalSpec] = useState<OpenApiSpec | null>(null);
  const [modifiedYaml, setModifiedYaml] = useState<string>('');
  const [modifiedSpecJson, setModifiedSpecJson] = useState<object | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'yaml' | 'preview'>('yaml');
  const [version, setVersion] = useState<string>('');

  const handleFileLoaded = useCallback((content: string, name: string) => {
    setFileState('loading');
    setFileName(name);
    setError(null);
    setOriginalSpec(null);
    setModifiedYaml('');
    setModifiedSpecJson(null);

    if (!content) {
      setError('Failed to read file or file was empty.');
      setFileState('error');
      return;
    }

    try {
      console.debug('File content loaded:', content);
      const parsedSpec = validateAndParseSwaggerJson(content);
      setOriginalSpec(parsedSpec);
      setFileState('loaded');
      setError(null);
    } catch (e: any) {
      console.error('Error validating/parsing Swagger JSON:', e);
      setError(e.message);
      setFileState('error');
      setOriginalSpec(null);
    }
  }, []);

  const handleSpecModified = useCallback((yaml: string) => {
    setModifiedYaml(yaml);
    try {
      const json = jsyaml.load(yaml);
      setModifiedSpecJson(json as object);
    } catch (e) {
      console.error('Error parsing modified YAML to JSON for preview:', e);
      setModifiedSpecJson(null);
    }
  }, []);

  const downloadYaml = () => {
    if (!modifiedYaml) {
      alert('No YAML content to download.');
      return;
    }
    const blob = new Blob([modifiedYaml], { type: 'text/yaml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    // extract version from modifiedYaml or use a default
    a.download = `sapcc-api-occ.${version}.yaml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const clearAll = () => {
    setFileState('empty');
    setFileName('');
    setOriginalSpec(null);
    setModifiedYaml('');
    setModifiedSpecJson(null);
    setError(null);
    setActiveTab('yaml');
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header avec uploader */}
      <header className="bg-white shadow-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Swagger Editor & Virtualization Configurator
              </h1>
              <p className="text-gray-600 mt-1 text-sm">
                Upload, edit, and preview OpenAPI specifications
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <FileUpload
                onFileLoaded={handleFileLoaded}
                isLoading={fileState === 'loading'}
                error={error}
              />
              
              {(fileName || modifiedYaml) && (
                <div className="flex gap-2">
                  <button
                    onClick={clearAll}
                    className="px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors text-sm"
                  >
                    Clear All
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {fileName && fileState === 'loaded' && (
            <div className="mt-4 flex items-center text-sm text-gray-600 bg-green-50 px-4 py-2 rounded-lg">
              <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <span className="font-medium">Loaded:</span>
              <span className="ml-2 font-mono bg-white px-2 py-1 rounded border">{fileName}</span>
              <span className="ml-8">Size: {modifiedYaml ? `${(modifiedYaml.length / 1024).toFixed(2)} KB` : '0 KB'}</span>
            </div>
          )}
        </div>
      </header>

      {/* Main content area */}
      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Editor - Prend 1/3 */}
          <div className="lg:col-span-1 bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-800">
                Configuration Editor
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Apply modifications to your OpenAPI specification
              </p>
            </div>
            
            <div className="p-6 overflow-auto custom-scrollbar" style={{ maxHeight: 'calc(100vh - 300px)' }}>
              {fileState === 'loaded' && originalSpec && (
                <SwaggerEditor
                  originalSpec={originalSpec}
                  onSpecModified={handleSpecModified}
                  version={version}
                  setVersion={setVersion}
                />
              )}
              {!originalSpec && (
                <div className="text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                  <h3 className="mt-4 text-lg font-medium text-gray-900">Upload a file to begin</h3>
                  <p className="mt-2 text-gray-500">
                    Upload a Swagger/OpenAPI JSON file to start editing and previewing.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Output with tabs */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200 flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-800">
                  Generated Output
                </h2>
                {modifiedYaml && (
                  <button
                    onClick={downloadYaml}
                    className="flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                    </svg>
                    Download YAML
                  </button>
                )}
              </div>
              
              {/* Tabs */}
              <div className="mt-4 border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                  <button
                    onClick={() => setActiveTab('yaml')}
                    className={`py-3 px-1 text-sm font-medium whitespace-nowrap flex items-center ${
                      activeTab === 'yaml' ? 'tab-active' : 'tab-inactive'
                    }`}
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path>
                    </svg>
                    YAML Output
                  </button>
                  <button
                    onClick={() => setActiveTab('preview')}
                    className={`py-3 px-1 text-sm font-medium whitespace-nowrap flex items-center ${
                      activeTab === 'preview' ? 'tab-active' : 'tab-inactive'
                    }`}
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                    </svg>
                    Visual Preview
                  </button>
                </nav>
              </div>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-hidden">
              {activeTab === 'yaml' && (
                <div className="h-full">
                  {modifiedYaml ? (
                    <div className="relative h-full">
                      <div className="absolute inset-0 bg-gray-900 overflow-auto custom-scrollbar">
                        <pre className="p-4 text-sm text-green-300 font-mono whitespace-pre-wrap">
                          {modifiedYaml}
                        </pre>
                      </div>
                    </div>
                  ) : (
                    <div className="p-8 text-center">
                      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                      </svg>
                      <h3 className="mt-4 text-lg font-medium text-gray-900">No YAML generated</h3>
                      <p className="mt-2 text-gray-500">
                        Apply modifications to see the generated YAML output.
                      </p>
                    </div>
                  )}
                </div>
              )}
              
              {activeTab === 'preview' && (
                <div className="h-full overflow-auto bg-white">
                  <SwaggerPreview spec={modifiedSpecJson} />
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between text-sm text-gray-500">
            <div>
              <p>Gl Swagger Editor & Virtualization Configurator v1.0 - © 2025 all rights reserved</p>
            </div>
            <div className="mt-2 md:mt-0">
              <div className="flex items-center space-x-4">
                {fileName && (
                  <>
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                      </svg>
                      {fileName}
                    </span>
                    <span>Size: {modifiedYaml ? `${(modifiedYaml.length / 1024).toFixed(2)} KB` : '0 KB'}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;