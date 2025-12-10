import React, { useState, useEffect, useCallback } from 'react';
import { OpenApiSpec, ModificationConfig } from '../types';
import { applyModifications, convertJsonToYaml } from '../services/swaggerService';

interface SwaggerEditorProps {
  originalSpec: OpenApiSpec | null;
  onSpecModified: (yaml: string) => void;
  version: string;
  setVersion: (version: string) => void;
}

const SwaggerEditor: React.FC<SwaggerEditorProps> = ({ originalSpec, onSpecModified, version, setVersion}) => {
  const [modificationConfig, setModificationConfig] = useState<ModificationConfig>({
    version: '',
    applyTimeObjectFix: false
  });

  // Initialiser la version depuis le spec original
  useEffect(() => {
    if (originalSpec && originalSpec.info && originalSpec.info.version) {
      setModificationConfig(prev => ({
        ...prev,
        version: originalSpec.info.version
      }));
      setVersion(originalSpec.info.version);
    }
  }, [originalSpec]);

  const applyAndEmitModifications = useCallback(() => {
    if (originalSpec) {
      try {
        const modifiedSpec = applyModifications(originalSpec, modificationConfig);
        const modifiedYaml = convertJsonToYaml(modifiedSpec);
        onSpecModified(modifiedYaml);
      } catch (error) {
        console.error('Error applying modifications:', error);
        onSpecModified('');
      }
    } else {
      onSpecModified('');
    }
  }, [originalSpec, modificationConfig, onSpecModified]);

  useEffect(() => {
    applyAndEmitModifications();
  }, [modificationConfig, originalSpec, applyAndEmitModifications]);

  const handleVersionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setModificationConfig(prev => ({
      ...prev,
      version: e.target.value
    }));
    setVersion(e.target.value);
  };

  const handleToggle = () => {
    setModificationConfig(prev => ({
      ...prev,
      applyTimeObjectFix: !prev.applyTimeObjectFix
    }));
  };

  if (!originalSpec) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Virtualization Modifications
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              API Version
            </label>
            <input
              type="text"
              value={modificationConfig.version || ''}
              onChange={handleVersionChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="e.g., 1.0.0"
            />
            <p className="mt-1 text-xs text-gray-500">
              Update the version number in your OpenAPI specification
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Quick Fixes
        </h3>
        
        <div className="space-y-3">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="applyTimeObjectFix"
              checked={modificationConfig.applyTimeObjectFix || false}
              onChange={handleToggle}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="applyTimeObjectFix" className="ml-3 block text-sm text-gray-700">
              <span className="font-medium">Apply Time Object Fix</span>
              <p className="text-xs text-gray-500 mt-1">
                Fixes time object formatting issues in the OpenAPI specification
              </p>
            </label>
          </div>
        </div>
      </div>

      <div className="text-sm text-gray-500 bg-gray-50 p-4 rounded-lg">
        <div className="flex items-start">
          <svg className="w-5 h-5 mr-2 mt-0.5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <div>
            <p className="font-medium text-gray-700">Modifications applied in real-time</p>
            <p className="mt-1">Changes will automatically update the YAML output and preview on the right.</p>
          </div>
        </div>
      </div>

      {/* Status summary */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h4 className="text-sm font-semibold text-gray-900 mb-2">Current Modifications</h4>
        <div className="space-y-2">
          <div className="flex items-center text-sm">
            <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
            <span className="text-gray-600">Version:</span>
            <span className="ml-2 font-mono text-gray-900 bg-gray-100 px-2 py-0.5 rounded">
              {modificationConfig.version || 'Not set'}
            </span>
          </div>
          <div className="flex items-center text-sm">
            <div className={`w-2 h-2 rounded-full mr-2 ${modificationConfig.applyTimeObjectFix ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            <span className="text-gray-600">Time Object Fix:</span>
            <span className={`ml-2 font-medium ${modificationConfig.applyTimeObjectFix ? 'text-green-600' : 'text-gray-400'}`}>
              {modificationConfig.applyTimeObjectFix ? 'Enabled' : 'Disabled'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SwaggerEditor;