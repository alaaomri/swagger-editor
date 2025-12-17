/**
 * Represents a simplified OpenAPI/Swagger Specification object.
 * This is not exhaustive but covers common top-level properties.
 */
export interface OpenApiSpec {
  openapi?: string;
  swagger?: string;
  info: {
    title: string;
    version: string;
    description?: string;
  };
  servers?: Array<{ url: string; description?: string }>;
  basePath?: string;
  paths: {
    [path: string]: {
      [method: string]: {
        summary?: string;
        operationId?: string;
        parameters?: any[];
        responses: {
          [statusCode: string]: {
            description: string;
            content?: { [mediaType: string]: { schema: any; examples?: any } };
          };
        };
        security?: any[];
        'x-cloudflare-rate-limit'?: any;
        requestBody?: any; // Added to support new requestBody
        [key: string]: any; // Allow other properties and extensions
      };
    };
  };
  components?: {
    schemas?: { [name: string]: any };
    responses?: { [name: string]: any };
    parameters?: { [name: string]: any };
    examples?: { [name: string]: any };
    requestBodies?: { [name: string]: any };
    headers?: { [name: string]: any };
    securitySchemes?: { [name: string]: any };
    links?: { [name: string]: any };
    callbacks?: { [name: string]: any };
  };
  security?: Array<{ [scheme: string]: string[] }>;
  tags?: Array<{ name: string; description?: string }>;
  externalDocs?: { url: string; description?: string };
  [key: string]: any; // Allow for OpenAPI extensions like 'x-...'
}

export interface OpenApiSpecWithMessages {
  spec: OpenApiSpec;
  validationResult?: ValidationResult;
}

export interface ModificationConfig {
  version?: string;
  applyTimeObjectFix?: boolean;
  // Les autres champs existants peuvent rester, mais seront optionnels
}
export interface ValidationMessage {
  level: 'ERROR' | 'WARNING' | 'INFO';
  message: string[];
}

export interface ValidationResult {
  schemaValidationMessages: ValidationMessage[];
  messages: string[];
}

export type FileState = 'empty' | 'loading' | 'loaded' | 'error';