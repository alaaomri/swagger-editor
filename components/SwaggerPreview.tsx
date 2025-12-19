import { ValidationResult } from '@/types';
import React, {useCallback} from 'react';
import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';
import SchemaValidationError from './SchemaValidationError';

interface SwaggerPreviewProps {
  spec: object | null;
  validationResult?: ValidationResult;
}

const SwaggerPreview: React.FC<SwaggerPreviewProps> = ({ spec, validationResult }) => {
  const { messages, schemaValidationMessages } = validationResult || { messages: [], schemaValidationMessages: [] };
  
  const getFlatMessages = useCallback(() => {
    return schemaValidationMessages.map(msg => `${msg.keyword}: ${msg.message} (at ${msg.instance.pointer})`);  
  }, [schemaValidationMessages]);

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
        <SchemaValidationError messages={messages} title="Validation Messages" className="mx-4 mb-4" />
      )}
      { schemaValidationMessages && schemaValidationMessages.length > 0 && <SchemaValidationError messages={getFlatMessages()} title="Schema Validation Messages" className="mx-4 mb-4" /> }
      <SwaggerUI spec={spec} />
    </div>
  );
};

export default SwaggerPreview;