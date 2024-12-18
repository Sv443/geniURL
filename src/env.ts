import "dotenv/config";
import type { Stringifiable } from "svcorelib";

export type EnvVarConvType = "string" | "number" | "boolean" | "stringArray" | "numberArray";

/** Resolves the env var with the given {@linkcode name} as a string */
export function getEnvVar(name: string, type?: "string"): string
/** Resolves the env var with the given {@linkcode name} as a number */
export function getEnvVar(name: string, type: "number"): number
/** Resolves the env var with the given {@linkcode name} as a boolean */
export function getEnvVar(name: string, type: "boolean"): boolean
/** Resolves the env var with the given {@linkcode name} as a string array by splitting the string at commas and semicolons */
export function getEnvVar(name: string, type: "stringArray"): string[]
/** Resolves the env var with the given {@linkcode name} as a number array by splitting the string at commas and semicolons and converting each element to a number */
export function getEnvVar(name: string, type: "numberArray"): number[]
/** Resolves the env var with the given {@linkcode name} as a string, number, boolean, string array or number array - string by default */
export function getEnvVar(name: string, type: EnvVarConvType = "string"): string | number | boolean | string[] | number[] {
  const val = process.env[name];
  if(val === undefined)
    throw new Error(`Environment variable "${name}" not set`);

  switch(type) {
  case "string":
    return String(val).trim();
  case "number": {
    const num = Number(val);
    if(isNaN(num))
      throw new Error(`Environment variable "${name}" is not a number`);
    return num;
  }
  case "boolean":
    if(String(val).trim().toLowerCase() === "true")
      return true;
    if(String(val).trim().toLowerCase() === "false")
      return false;
    throw new Error(`Environment variable "${name}" is not a boolean`);
  case "stringArray":
    return String(val).split(/[,;]/g);
  case "numberArray":
    return String(val).split(/[,;]/g).map(Number);
  }
}

/** Checks if the env var with the given {@linkcode name} equals the given {@linkcode value}, converted to a string */
export function envVarEquals(name: string, value: Stringifiable): boolean {
  return (typeof value === "boolean"
    ? getEnvVar(name).toLowerCase()
    : getEnvVar(name)
  ) === String(value);
}
