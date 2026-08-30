import { getConsoleFunction, setConsoleFunction } from "three";

// Temporary bridge for R3F 9.x + Three r183+. Remove after moving to stable R3F 10.
const clockDeprecation =
  "THREE.Clock: This module has been deprecated. Please use THREE.Timer instead.";
const precisionWarning =
  /warning X4122: sum of .+ cannot be represented accurately in double precision/;

const previousConsoleFunction = getConsoleFunction();

function containsOnlyPrecisionWarnings(params: unknown[]): boolean {
  const details = params
    .filter((value): value is string => typeof value === "string")
    .flatMap((value) => value.split(/\r?\n/))
    .map((line) => line.trim())
    .filter(Boolean);

  return details.length > 0 && details.every((line) => precisionWarning.test(line));
}

setConsoleFunction((type, message, ...params) => {
  const isClockCompatibilityWarning = message === clockDeprecation;
  const isWindowsShaderPrecisionWarning =
    message === "THREE.WebGLProgram: Program Info Log:" &&
    containsOnlyPrecisionWarnings(params);

  if (isClockCompatibilityWarning || isWindowsShaderPrecisionWarning) return;

  if (previousConsoleFunction) {
    previousConsoleFunction(type, message, ...params);
    return;
  }

  const method = type === "log" ? console.log : type === "warn" ? console.warn : console.error;
  method(message, ...params);
});
