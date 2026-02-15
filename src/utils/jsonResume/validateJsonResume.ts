import Ajv, { type ErrorObject } from "ajv";
import addFormats from "ajv-formats";
import jsonResumeSchemaRaw from "@/utils/jsonResume/jsonresume.schema.json?raw";
import type { JsonResume } from "@/utils/jsonResume/mapCvDataToJsonResume";

export type ValidationResult = { ok: true } | { ok: false; errors: string[] };

const ajv = new Ajv({
  allErrors: true,
  strict: false,
});

addFormats(ajv);

const jsonResumeSchema = JSON.parse(jsonResumeSchemaRaw) as Record<string, unknown>;
const validate = ajv.compile<JsonResume>(jsonResumeSchema);

const formatError = (error: ErrorObject): string => {
  const path = error.instancePath || "/";
  return `${path} ${error.message ?? "is invalid"}`;
};

export function validateJsonResume(resume: JsonResume): { ok: true } | { ok: false; errors: string[] } {
  const valid = validate(resume);

  if (valid) {
    return { ok: true };
  }

  return {
    ok: false,
    errors: (validate.errors ?? []).map(formatError),
  };
}
