import { apiFetch } from "./client";

/** Fetch all general bug/feature submissions. Any logged-in user can read. */
export async function getGeneralFeedback() {
  return apiFetch("/feedback/general");
}

/** Fetch all explanation-mismatch reports. Any logged-in user can read. */
export async function getExplanationMismatches() {
  return apiFetch("/feedback/mismatches");
}
