import { ValidationResult } from '@/types';
import React from 'react';
import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';

interface SwaggerPreviewProps {
  spec: object | null;
  validationResult?: ValidationResult;
}

const SwaggerPreview: React.FC<SwaggerPreviewProps> = ({ spec, validationResult }) => {
  const { messages, schemaValidationMessages } = validationResult;
  if (!spec) {
    return (
      <div className="p-4 text-center text-gray-400">
        Upload a JSON file and apply modifications to see the visual preview.
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto bg-white rounded-md">
      {messages && messages.length > 0 && (
        <div className="p-2 mx-4 mt-4 mb-4 text-red-500 bg-red-100 border border-red-400 rounded">
          <strong>Validation Messages:</strong>
          <ul>
            {messages.map((msg, index) => (
              <li key={index}>{msg}</li>
            ))}
          </ul>
        </div>
      )}
      {schemaValidationMessages && schemaValidationMessages.length > 0 && (
        <div className="p-2 mx-4 mt-4 mb-4 text-red-500 bg-red-100 border border-red-400 rounded">
          <strong>Schema Validation Messages:</strong>
          <ul>
            {schemaValidationMessages.map((msg, index) => (
              <li key={index}>{msg}</li>
            ))}
          </ul>
        </div>
      )}
      <SwaggerUI spec={spec} />
    </div>
  );
};

export default SwaggerPreview;