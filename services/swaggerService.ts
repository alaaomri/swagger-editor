import * as jsyaml from 'js-yaml';
import { OpenApiSpec, ModificationConfig } from '../types';

/**
 * Validates if the given content is a valid JSON and looks like a basic OpenAPI/Swagger spec.
 * @param content The string content of the file.
 * @returns The parsed OpenAPI spec object if valid, otherwise throws an error.
 */
export function validateAndParseSwaggerJson(content: string): OpenApiSpec {
  let spec: OpenApiSpec;
  try {
    spec = JSON.parse(content);
  } catch (error) {
    throw new Error('Invalid JSON file. Please upload a valid JSON OpenAPI/Swagger file.');
  }

  // Basic validation for OpenAPI/Swagger structure
  if (!spec || (!spec.openapi && !spec.swagger)) {
    throw new Error('The uploaded JSON does not appear to be a valid OpenAPI (Swagger) specification. Missing "openapi" or "swagger" property.');
  }
  if (!spec.info || !spec.info.title || !spec.info.version) {
    throw new Error('Invalid OpenAPI (Swagger) specification: Missing or incomplete "info" object (title and version are required).');
  }
  if (!spec.paths) {
    throw new Error('Invalid OpenAPI (Swagger) specification: Missing "paths" object.');
  }

  return spec;
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