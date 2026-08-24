# FAREL VIRTUAL — ASSETS PROVISÓRIOS (MVP)

Objetivo: o mínimo de arte necessário para a Board UI (Chunk 6) não ficar
com divs cinzas, sem gastar tempo com identidade visual final — isso é
polish pós-playtest (PDR seção 8/M13). Estilo simples, plano, alto
contraste, fácil de gerar em qualquer ferramenta (Midjourney, DALL-E,
Firefly, Ideogram, ou até SVG feito à mão).

## DIRETRIZ DE ESTILO (usar em TODOS os prompts abaixo)

```text
flat vector illustration, minimalist fantasy card game icon,
bold simple shapes, limited color palette (deep navy, ember orange,
bone white), thick clean outlines, no text, no watermark,
centered composition, plain dark background, game asset style
```

Mantenha essa base fixa e só troque o sujeito — assim os 20-30 assets
provisórios têm uma coerência visual mínima entre si.

---

## 1. VERSO DE CARTA (genérico, 1 arquivo)
```text
Card back design for a fantasy TCG, flat vector illustration,
minimalist emblem of a lighthouse/beacon ("Farel") radiating a single
beam, deep navy background, ember orange beam, thin bone-white border,
no text, symmetrical, centered, game card back template, 2.5:3.5 aspect ratio
```

## 2. MOLDURA DE CARTA — CREATURE
```text
Empty fantasy TCG card frame template, flat vector, ember orange border,
top area for art, bottom banner area for text, deep navy background
texture, minimalist, no text, no icons inside, 2.5:3.5 aspect ratio
```

## 3. MOLDURA DE CARTA — STRUCTURE
```text
Empty fantasy TCG card frame template, flat vector, stone-grey border
with subtle geometric pattern, top area for art, bottom banner for text,
deep navy background, minimalist, no text, 2.5:3.5 aspect ratio
```

## 4. MOLDURA DE CARTA — SPELL
```text
Empty fantasy TCG card frame template, flat vector, ethereal light-blue
border with faint rune pattern, top area for art, bottom banner for
text, deep navy background, minimalist, no text, 2.5:3.5 aspect ratio
```

## 5. ÍCONE — HERÓI (placeholder genérico, reaproveitar para todos heróis no MVP)
```text
Flat vector icon of a heroic silhouette figure holding a beacon staff,
[DIRETRIZ DE ESTILO], simple humanoid shape, no face detail, square
composition, game token style
```

## 6. ÍCONE — CRIATURA (placeholder genérico)
```text
Flat vector icon of a stylized fantasy creature silhouette (generic
beast shape), [DIRETRIZ DE ESTILO], square composition, game token style
```

## 7. ÍCONE — ESTRUTURA (placeholder genérico)
```text
Flat vector icon of a small fantasy tower or shrine structure,
[DIRETRIZ DE ESTILO], square composition, game token style
```

## 8. ÍCONE — SPELL/CANALIZAÇÃO (placeholder genérico)
```text
Flat vector icon of a glowing magic rune circle, [DIRETRIZ DE ESTILO],
square composition, game token style
```

## 9. ÍCONE — ENERGIA
```text
Flat vector icon of a single glowing ember/flame droplet,
[DIRETRIZ DE ESTILO], simple, square composition, resource icon style
```

## 10. ÍCONE — DANO / D6
```text
Flat vector icon of a six-sided die mid-roll with a small impact spark,
[DIRETRIZ DE ESTILO], square composition, simple, game UI icon
```

## 11. ÍCONE — VIDA/HP
```text
Flat vector icon of a small shield with a heart or drop shape inside,
[DIRETRIZ DE ESTILO], square composition, simple, game UI icon
```

## 12. BACKGROUND DO TABULEIRO
```text
Minimalist fantasy battlefield background, top-down symmetrical layout,
flat vector, deep navy base with faint ember-orange lane divisions,
two mirrored zones separated by a horizontal line, no characters,
no text, wide aspect ratio (16:9), game board background
```

## 13. SLOT VAZIO (lane de criatura, estrutura, canalização)
```text
Empty flat vector game board slot, rounded square outline, thin
ember-orange border, semi-transparent dark navy fill, no text,
game UI element, isolated on transparent background
```

## 14. LOGO/WORDMARK PROVISÓRIO "FAREL"
```text
Minimalist logotype icon for a fantasy game called "Farel", flat vector
emblem of a lighthouse beam forming an abstract letter F, deep navy and
ember orange, no readable text, symmetrical, icon only
```

---

## PLANO DE USO (mínimo necessário para o Chunk 6 não travar)

Ordem de prioridade se o tempo for curto — gere só os itens 1 a 3 do MVP:

```text
P0 (bloqueia UI):  itens 1, 2, 3, 4, 12, 13   → verso, 3 molduras, board, slot vazio
P1 (ajuda muito):  itens 5, 6, 7, 8, 9, 10, 11 → ícones de entidade e HUD
P2 (cosmético):    item 14                      → logo, não bloqueia nada
```

Todos os assets aqui são placeholders funcionais. Nenhum deve ser tratado
como arte final — a identidade visual definitiva do FAREL só entra depois
do primeiro ciclo de playtest (ver PIPELINE_COMPLETO.md, seção 6).
