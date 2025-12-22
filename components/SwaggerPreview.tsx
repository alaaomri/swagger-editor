import { ValidationResult } from '@/types';
import React, { useCallback } from 'react';
import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';
import SchemaValidationError from './SchemaValidationError';

interface SwaggerPreviewProps {
  spec: object | null;
  validationResult?: ValidationResult;
  previewLoading: boolean;
}

const SwaggerPreview: React.FC<SwaggerPreviewProps> = ({ spec, validationResult, previewLoading }) => {
  const { messages, schemaValidationMessages } = validationResult || { messages: [], schemaValidationMessages: [] };

  const getFlatMessages = useCallback(() => {
    return schemaValidationMessages.map(msg => `${msg.keyword}: ${msg.message} (at ${msg.instance.pointer})`);
  }, [schemaValidationMessages]);

  if (!spec && !previewLoading) {
    return (
      <div className="p-4 text-center text-gray-400">
        Upload a JSON file and apply modifications to see the visual preview.
      </div>
    );
  }

  return (
    <div className="relative h-full overflow-auto bg-white rounded-md">
      <div className={` absolute top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out ${previewLoading ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full pointer-events-none'} `}>
        <div className="flex items-center justify-center w-full py-3 bg-linear-to-r from-blue-50/95 to-white/95 backdrop-blur-sm border-b border-blue-100/80 shadow-md">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-6 h-6 border-2 border-blue-100 rounded-full"></div>
              <div className="absolute top-0 left-0 w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-gray-800">Loading ... </span>
              <span className="text-xs text-gray-500">Preparing Swagger documentation</span>
            </div>
          </div>
        </div>
      </div>

      <div className={`transition-opacity duration-300 ${previewLoading ? 'pt-16 opacity-60' : 'opacity-100'}`}>
        {messages && messages.length > 0 && (
          <SchemaValidationError
            messages={messages}
            title="Validation Messages"
            className="mx-4 mb-4 mt-4"
          />
        )}

        {schemaValidationMessages && schemaValidationMessages.length > 0 && (
          <SchemaValidationError
            messages={getFlatMessages()}
            title="Schema Validation Messages"
            className="mx-4 mb-4"
          />
        )}

        <SwaggerUI spec={spec} />
      </div>
    </div>
  );
};

export default SwaggerPreview;