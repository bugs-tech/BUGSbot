// lib/autoviewstatus.js

let autoViewEnabled = false;

export function isAutoViewStatusEnabled() {
  return autoViewEnabled;
}

export function toggleAutoViewStatus(state) {
  autoViewEnabled = state;
  return autoViewEnabled;
}
