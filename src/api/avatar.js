import { apiFetch } from "./client.js";

export const getAvatarMe = () => apiFetch("/avatar/me");

export const purchaseItem = (itemId) =>
  apiFetch("/avatar/purchase", {
    method: "POST",
    body: JSON.stringify({ itemId }),
  });

export const equipItem = (category, itemId) =>
  apiFetch("/avatar/equip", {
    method: "POST",
    body: JSON.stringify({ category, itemId }),
  });
