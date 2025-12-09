import React from 'react';
import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';
// Note: The swagger-ui-react library itself includes its CSS.
// No explicit CSS import is generally needed for basic usage.

interface SwaggerPreviewProps {
  spec: object | null;
}

const SwaggerPreview: React.FC<SwaggerPreviewProps> = ({ spec }) => {
  if (!spec) {
    return (
      <div className="p-4 text-center text-gray-400">
        Upload a JSON file and apply modifications to see the visual preview.
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto bg-white rounded-md">
      <SwaggerUI spec={spec} />
    </div>
  );
};

export default SwaggerPreview;