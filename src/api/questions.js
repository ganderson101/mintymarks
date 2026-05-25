import { apiFetch } from "./client.js";

/**
 * Fetch questions for a specific level and subject from the backend.
 * Returns only the slice of the bank the session needs (~50-200 questions)
 * rather than shipping the full 4MB bank in the client bundle.
 *
 * @param {string} level   - "ks2" | "ks3" | "gcse" | "alevel"
 * @param {string} subject - "maths" | "physics"
 */
export const fetchQuestions = (level, subject) =>
  apiFetch(`/questions?level=${encodeURIComponent(level)}&subject=${encodeURIComponent(subject)}`);
