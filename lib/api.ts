// lib/api.ts

const API_URL = "https://script.google.com/macros/s/AKfycbw0NY2b2c-w_3wPXV0kjPG5IDvoDezvaOhnHYSyTZu1CBfm6kFXpDoQ0DPSzHYCU-gk/exec";

async function fetchWithHandling(bodyObj: any) {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify(bodyObj),
    });
    
    // Log diagnóstico temporário exigido pela missão
    console.log('[API] HTTP Status:', response.status);
    
    if (!response.ok) {
      throw new Error("Não foi possível conectar ao servidor. HTTP Status: " + response.status + ". Verifique se o Apps Script foi implantado como Web App público.");
    }
    
    const text = await response.text();
    console.log('[API] Raw Body:', text.substring(0, 200) + (text.length > 200 ? '...' : ''));
    
    try {
      return JSON.parse(text);
    } catch (e) {
      throw new Error("Falha ao parsear JSON do servidor: " + text.substring(0, 100));
    }
  } catch (err: any) {
    throw new Error(err.message || "Falha de rede desconhecida.");
  }
}

export async function createMatch(matchId: string, initialState: any) {
  return fetchWithHandling({
    action: "CREATE_MATCH",
    payload: { matchId, state: initialState },
  });
}

export async function joinMatch(matchId: string, updatedState: any) {
  return fetchWithHandling({
    action: "JOIN_MATCH",
    payload: { matchId, state: updatedState },
  });
}

export async function submitAction(matchId: string, newState: any) {
  return fetchWithHandling({
    action: "SUBMIT_ACTION",
    payload: { matchId, newState },
  });
}

export async function pollState(matchId: string) {
  return fetchWithHandling({
    action: "POLL_STATE",
    payload: { matchId },
  });
}
