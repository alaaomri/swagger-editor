import * as jsyaml from 'js-yaml';
import type { OpenApiSpec, ModificationConfig, ValidationResult, OpenApiSpecWithMessages } from '../types';

export async function validateSwaggerSchema(spec?: OpenApiSpec, yamlContent?: string, isYaml= false): Promise<ValidationResult> {
  try {
    const response = await fetch('https://validator.swagger.io/validator/debug', {
      method: 'POST',
      headers: {
        'Content-Type': isYaml ? 'application/yaml' : 'application/json',
      },
      body: isYaml ? yamlContent : JSON.stringify(spec),
    });

    if (!response.ok) {
      throw new Error(`Validation API request failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Swagger Validation Error:', error);
    throw error;
  }
}

/**
 * Validates if the given content is a valid JSON and looks like a basic OpenAPI/Swagger spec.
 * @param content The string content of the file.
 * @returns The parsed OpenAPI spec object if valid, otherwise throws an error.
 */
export async function validateAndParseSwaggerJson(content: string, isYaml = false): Promise<OpenApiSpecWithMessages> {

  let openapiSpec: OpenApiSpec;
  let result: OpenApiSpecWithMessages;
  try {
    openapiSpec = isYaml ? jsyaml.load(content) as OpenApiSpec : JSON.parse(content);
    const validationResult: ValidationResult = await validateSwaggerSchema(openapiSpec, content, isYaml);
    result = { spec: openapiSpec, validationResult };
  } catch (error) {
    return { spec: openapiSpec, validationResult: { schemaValidationMessages: [], messages: ['Failed to parse JSON: ' + (error as Error).message] } };
  }

  // Basic validation for OpenAPI/Swagger structure
  if (!openapiSpec || (!openapiSpec.openapi && !openapiSpec.swagger)) {
    throw new Error('The uploaded JSON does not appear to be a valid OpenAPI (Swagger) specification. Missing "openapi" or "swagger" property.');
  }
  if (!openapiSpec.info || !openapiSpec.info.title || !openapiSpec.info.version) {
    throw new Error('Invalid OpenAPI (Swagger) specification: Missing or incomplete "info" object (title and version are required).');
  }
  if (!openapiSpec.paths) {
    throw new Error('Invalid OpenAPI (Swagger) specification: Missing "paths" object.');
  }

  return { spec: openapiSpec, validationResult: result.validationResult };
}

/**
 * Applies modifications to the OpenAPI specification.
 * @param originalSpec The original OpenAPI specification object.
 * @param config The modification configuration.
 * @returns The modified OpenAPI specification object.
 */
export function applyModifications(originalSpec: OpenApiSpec, config: ModificationConfig): OpenApiSpec {
  // Deep clone the original spec to avoid mutations
  let modifiedSpec: OpenApiSpec = JSON.parse(JSON.stringify(originalSpec));

  console.log('Applying modifications with config:', config);

  // Apply version update if provided
  if (config.version && modifiedSpec.info) {
    modifiedSpec.info.version = config.version;
  }

  // Apply Time Object Fix if requested
  if (config.applyTimeObjectFix) {
    modifiedSpec = applyTimeObjectFix(modifiedSpec);
  }

  return modifiedSpec;
}

/**
 * Fixes time object formatting issues in the OpenAPI specification.
 * Changes Time.hour and Time.minute properties from string to integer types.
 * @param spec The OpenAPI specification object.
 * @returns The modified specification with Time schema fixed.
 */
function applyTimeObjectFix(spec: OpenApiSpec): OpenApiSpec {
  const timeSchema = spec.components?.schemas?.Time;
  
  if (!timeSchema) {
    console.warn("Warning: 'Time' schema not found in components/schemas.");
    return spec;
  }

  if (!timeSchema.properties) {
    console.warn("Warning: 'Time' schema has no properties defined.");
    return spec;
  }

  if (timeSchema.properties.hour) {
    timeSchema.properties.hour = {
      ...timeSchema.properties.hour,
      type: 'integer',
      format: 'int32'
    };
    console.log("Modified Time.hour to type: 'integer', format: 'int32'");
  } else {
    console.warn("Warning: Time.hour property not found in 'Time' schema.");
  }

  if (timeSchema.properties.minute) {
    timeSchema.properties.minute = {
      ...timeSchema.properties.minute,
      type: 'integer',
      format: 'int32'
    };
    console.log("Modified Time.minute to type: 'integer', format: 'int32'");
  } else {
    console.warn("Warning: Time.minute property not found in 'Time' schema.");
  }

  return spec;
}

/**
 * Converts an OpenAPI specification object to a YAML string.
 * @param spec The OpenAPI specification object.
 * @returns The YAML string.
 */
export function convertJsonToYaml(spec: OpenApiSpec): string {
  try {
    return jsyaml.dump(spec, { 
      indent: 2, 
      lineWidth: -1, // Disable line wrapping
      noRefs: true // Don't convert references to YAML anchors
    });
  } catch (error) {
    console.error('Error converting JSON to YAML:', error);
    throw new Error('Failed to convert OpenAPI specification to YAML format.');
  }
}

/**
 * Creates a modified file name for download.
 * @param originalFileName The original file name.
 * @returns Modified file name with timestamp.
 */
export function generateModifiedFileName(originalFileName: string): string {
  const baseName = originalFileName.replace(/\.[^/.]+$/, "");
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
  return `${baseName || 'openapi'}-modified-${timestamp}.yaml`;
}

/**
 * Validates if a given YAML content is a valid OpenAPI specification.
 * @param yamlContent The YAML content as string.
 * @returns True if valid, false otherwise.
 */
export function validateYamlOpenApi(yamlContent: string): boolean {
  try {
    const spec = jsyaml.load(yamlContent) as OpenApiSpec;
    return !!(spec && (spec.openapi || spec.swagger));
  } catch (error) {
    return false;
  }
}

/**
 * Example modification functions for specific fixes.
 * These can be expanded based on requirements.
 */

/**
 

if (config.removeExplodeFalseProductCodes) {
    const path = '/{baseSiteId}/offers/multi-product';
    const method = 'get';
    const operation = modifiedSpec.paths?.[path]?.[method];

    if (operation && operation.parameters) {
      const productCodesParam = operation.parameters.find(
        (p: any) => p.name === 'productCodes' && p.in === 'query',
      );
      if (productCodesParam && productCodesParam.explode === false) {
        delete productCodesParam.explode;
        console.log(`Removed 'explode: false' from 'productCodes' param on ${method.toUpperCase()} ${path}`);
      } else if (productCodesParam) {
        console.warn(`Warning: 'productCodes' param on ${method.toUpperCase()} ${path} found, but 'explode: false' was not present.`);
      } else {
        console.warn(`Warning: 'productCodes' param not found on ${method.toUpperCase()} ${path}.`);
      }
    } else {
      console.warn(`Warning: Operation ${method.toUpperCase()} ${path} not found or has no parameters.`);
    }
  }

  if (config.applyFloaCallbackFix) {
    const path = '/{baseSiteId}/floa/glFloaPaymentCallback';
    const method = 'post';
    const operation = modifiedSpec.paths?.[path]?.[method];

    if (operation) {
      // Remove 'dto' parameter
      if (operation.parameters) {
        const initialParamCount = operation.parameters.length;
        operation.parameters = operation.parameters.filter(
          (p: any) => p.name !== 'dto',
        );
        if (operation.parameters.length < initialParamCount) {
          console.log(`Removed 'dto' parameter from ${method.toUpperCase()} ${path}`);
        } else {
          console.warn(`Warning: 'dto' parameter not found on ${method.toUpperCase()} ${path}.`);
        }
      }

      // Add requestBody
      if (!operation.requestBody) {
        operation.requestBody = floaRequestBodyContent;
        console.log(`Added requestBody to ${method.toUpperCase()} ${path}`);
      } else {
        console.warn(`Warning: requestBody already exists on ${method.toUpperCase()} ${path}. Not adding.`);
      }
    } else {
      console.warn(`Warning: Operation ${method.toUpperCase()} ${path} not found.`);
    }
  }

  if (config.addExplodeFalseCreateThreadMessageDto) {
    const endpoints = [
      '/{baseSiteId}/users/{userId}/consignment/{consignmentCode}/consignmententry/{consignmentEntryCode}/incident/close',
      '/{baseSiteId}/users/{userId}/consignment/{consignmentCode}/consignmententry/{consignmentEntryCode}/incident/open',
      '/{baseSiteId}/users/{userId}/messages/consignment/{consignmentCode}',
      '/{baseSiteId}/users/{userId}/messages/threads/{threadId}',
    ];
    const paramName = 'createThreadMessageWsDTO';
    const method = 'post'; // All these are POST requests

    endpoints.forEach((path) => {
      const operation = modifiedSpec.paths?.[path]?.[method];
      if (operation && operation.parameters) {
        const dtoParam = operation.parameters.find(
          (p: any) => p.name === paramName && p.in === 'body', // Assuming 'body' for DTO
        );
        if (dtoParam && dtoParam.explode !== false) {
          // Add explode: false if not already present or if it's true
          dtoParam.explode = false;
          console.log(`Added 'explode: false' to '${paramName}' param on ${method.toUpperCase()} ${path}`);
        } else if (dtoParam && dtoParam.explode === false) {
          console.log(`'explode: false' already present for '${paramName}' param on ${method.toUpperCase()} ${path}.`);
        } else {
          console.warn(`Warning: '${paramName}' param not found or is not a body parameter on ${method.toUpperCase()} ${path}.`);
        }
      } else if (operation && operation.requestBody && operation.requestBody.content?.['application/json']?.schema) {
        // If it uses requestBody with schema, then explode:false is not applied to a parameter
        // This case is unlikely for the prompt, but good to note.
        console.warn(`Warning: Operation ${method.toUpperCase()} ${path} uses requestBody, '${paramName}' is not a direct parameter to add 'explode: false' to. This modification is only for parameters.`);
      }
      else {
        console.warn(`Warning: Operation ${method.toUpperCase()} ${path} not found or has no parameters/requestBody.`);
      }
    });
  }
 */