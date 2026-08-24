# FIX 08 REPORT: MULTIPLAYER CONNECTIVITY REMEDIATION

**Status:** ✅ RESOLVIDO

## 1. Problema de CORS e Tratamento de Erros
A função \etchWithHandling\ centralizada no \lib/api.ts\ foi criada para forçar requisições limpas ao Google Apps Script. 
O cabeçalho foi mantido como \	ext/plain\ para bypassar o Preflight (OPTIONS), e adicionamos \console.log\ exigidos para o debug de corpo (Raw Body) e status HTTP.
Se o Apps Script rejeitar ou se o \JSON.parse()\ falhar (sintoma de deploy mal configurado), a promise é rejeitada imediatamente e renderizada de forma amigável no React.

## 2. Jogador 2 nunca registrava a entrada
O \handleJoinMatch\ no \pp/page.tsx\ foi reescrito. Agora ele não só destranca a tela de lobby, mas primeiro chama \pollState\ validando que a partida existe. Em caso positivo, o estado da partida atualiza o status do P2 (Name modificado para sinalizar "Joined") via \joinMatch\.
Partidas fantasmas jogarão erro de rede na tela e bloquearão a UI de ficar "Waiting for state" para sempre.

## 3. Dívida Técnica (Engine Client-Side)
Como determinado, a migração integral da \game/engine\ para dentro do \Code.gs\ fica adiada para pólo-playtest, porém mapeada formalmente no \FINAL_AUDIT_REPORT.md\ gerado no passo anterior. O cliente deve enviar intenções e não o JSON montado no futuro.
