
import React from 'react';


export const SimpleValidationMessages: React.FC<{ title: string; messages: string[] }> = ({ title, messages }) => {
  if (!messages || messages.length === 0) {
    return null;
  }

  return (
    <div className="p-2 mx-4 mt-4 mb-4 text-red-500 bg-red-100 border border-red-400 rounded">
      <strong>{title}:</strong>
      <ul>
        {messages.map((msg, index) => (
          <li key={index}>
            {msg}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SimpleValidationMessages;