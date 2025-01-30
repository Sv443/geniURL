import "dotenv/config";
import type { Stringifiable } from "svcorelib";

export type EnvVarConvType = "string" | "number" | "boolean" | "stringArray" | "numberArray";

/** Resolves the env var with the given {@linkcode name} as a string */
export function getEnvVar(name: string, type?: "string", defaultVal?: string): string
/** Resolves the env var with the given {@linkcode name} as a number */
export function getEnvVar(name: string, type: "number", defaultVal?: number): number
/** Resolves the env var with the given {@linkcode name} as a boolean */
export function getEnvVar(name: string, type: "boolean", defaultVal?: boolean): boolean
/** Resolves the env var with the given {@linkcode name} as a string array by splitting the string at commas and semicolons */
export function getEnvVar(name: string, type: "stringArray", defaultVal?: string[]): string[]
/** Resolves the env var with the given {@linkcode name} as a number array by splitting the string at commas and semicolons and converting each element to a number */
export function getEnvVar(name: string, type: "numberArray", defaultVal?: number[]): number[]
/** Resolves the env var with the given {@linkcode name} as a string, number, boolean, string array or number array - string by default */
export function getEnvVar(name: string, type: EnvVarConvType = "string", defaultVal?: string | number | boolean | string[] | number[]): string | number | boolean | string[] | number[] {
  const envVal = process.env[name];
  if(envVal === undefined && typeof defaultVal === "undefined")
    throw new Error(`Environment variable "${name}" is not set`);
  const val = String(envVal ?? defaultVal).trim();

  switch(type) {
  default:
    return val;
  case "number":
    return Number(val);
  case "boolean":
    return val.toLowerCase() === "true";
  case "stringArray":
    return val.split(/[,;]/g).map((v) => v.trim());
  case "numberArray":
    return val.split(/[,;]/g).map((v) => Number(v.trim()));
  }
}

/** Checks if the env var with the given {@linkcode name} equals the given {@linkcode value}, converted to a string - falls back to {@linkcode defaultVal} if the env var is not set */
export function envVarEquals(name: string, value: Stringifiable, defaultVal = true): boolean {
  const val = getEnvVar(name, "string", String(defaultVal));
  return (typeof value === "boolean" ? val.toLowerCase() : val) === String(value);
}
