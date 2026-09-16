import {
  ATTEMPT_LOG_SCHEMA_PATH,
  ATTEMPT_LOG_SHA256,
  CANONICALIZATION,
  HASH_ALGORITHM,
  MASTER_SCHEMA_PATH,
  MASTER_SCHEMA_SHA256,
  METHOD_VERSION,
  SCHEMA_VERSION,
  canonical,
  sha256Hex,
  sortByInputPath,
  type HashInputDescriptor,
  type SchemaInputDescriptor,
} from "../identity";

export type ContinuityHashInputs = {
  canonicalization: typeof CANONICALIZATION;
  hash_algorithm: typeof HASH_ALGORITHM;
  lineage_id: string;
  inputs: HashInputDescriptor[];
  overrides: HashInputDescriptor[];
  adapter_version: string;
  method_version: string;
  schema_version: typeof SCHEMA_VERSION;
  schema_inputs: SchemaInputDescriptor[];
};

export function buildContinuityHashInputs(args: {
  lineageId: string;
  adapterVersion: string;
  inputs: HashInputDescriptor[];
  overrides?: HashInputDescriptor[];
}): ContinuityHashInputs {
  return {
    canonicalization: CANONICALIZATION,
    hash_algorithm: HASH_ALGORITHM,
    lineage_id: args.lineageId,
    inputs: sortByInputPath(args.inputs),
    overrides: sortByInputPath(args.overrides ?? []),
    adapter_version: args.adapterVersion,
    method_version: METHOD_VERSION,
    schema_version: SCHEMA_VERSION,
    schema_inputs: sortByInputPath([
      { input_path: ATTEMPT_LOG_SCHEMA_PATH, sha256: ATTEMPT_LOG_SHA256 },
      { input_path: MASTER_SCHEMA_PATH, sha256: MASTER_SCHEMA_SHA256 },
    ]),
  };
}

export function continuityFingerprint(hashInputs: ContinuityHashInputs): string {
  return sha256Hex(canonical(hashInputs));
}

export function continuityReleaseId(lineageId: string, fingerprint: string): string {
  return `${lineageId}--sha256-${fingerprint}`;
}
