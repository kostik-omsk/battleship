export function safeParseJSON<T>(msg: string): T | null {
  try {
    return JSON.parse(msg);
  } catch (error) {
    console.error("Invalid JSON: ", error);
    return null;
  }
}
