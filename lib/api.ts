// lib/api.ts

const API_URL = "https://script.google.com/macros/s/AKfycbw0NY2b2c-w_3wPXV0kjPG5IDvoDezvaOhnHYSyTZu1CBfm6kFXpDoQ0DPSzHYCU-gk/exec"; // Replace with your Google Apps Script web app URL

export async function createMatch(matchId: string, initialState: any) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain;charset=utf-8",
    },
    body: JSON.stringify({
      action: "CREATE_MATCH",
      payload: { matchId, state: initialState },
    }),
  });
  return response.json();
}

export async function joinMatch(matchId: string, updatedState: any) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain;charset=utf-8",
    },
    body: JSON.stringify({
      action: "JOIN_MATCH",
      payload: { matchId, state: updatedState },
    }),
  });
  return response.json();
}

export async function submitAction(matchId: string, newState: any) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain;charset=utf-8",
    },
    body: JSON.stringify({
      action: "SUBMIT_ACTION",
      payload: { matchId, newState },
    }),
  });
  return response.json();
}

export async function pollState(matchId: string) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain;charset=utf-8",
    },
    body: JSON.stringify({
      action: "POLL_STATE",
      payload: { matchId },
    }),
  });
  return response.json();
}

