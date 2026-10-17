# MISSÃO AGY CLI — Fatiar, organizar e integrar os assets de cartas de FAREL

## Objetivo

Transformar a prancha visual de templates de FAREL em assets independentes, limpos, otimizados e prontos para uso no protótipo HTML/CSS. A prancha é apenas uma fonte visual: nenhum texto, custo, vida, efeito ou outro dado de carta deve ficar rasterizado na imagem final. Esses dados continuam no HTML/JSON.

## Contexto e arquivos de entrada

1. Localize no projeto a imagem `asset-sheet-grid.png`. No pacote de referência ela mede 1500 × 1110 px e contém seis peças: verso, template de herói, criatura, estrutura geradora, magia instantânea e magia canalizada. Caminho esperado no pacote anterior: `farel-card-prototype/asset-sheet-grid.png`.
2. Há também uma imagem de referência mais complexa, `asset-sheet-original-reference.png`, com exemplos de cartas preenchidas, legendas, ícones e blocos de código. **Não use essa prancha complexa como fonte principal de recorte dos seis templates**, porque ela contém elementos que não devem virar assets de template.
3. Antes de criar arquivos, audite os assets já existentes no projeto, especialmente `assets/card-back.*`, `assets/template-hero.*`, `assets/template-creature.*`, `assets/template-structure.*`, `assets/template-spell-instant.*` e `assets/template-spell-channel.*`. Compare-os visualmente com a prancha e reaproveite os que forem melhores; evite duplicar arquivos ou substituir versões boas sem necessidade.
4. Não suponha que o caminho `/mnt/data` exista no ambiente de execução. Procure pelos arquivos no workspace real e registre o caminho encontrado.

## Regras inegociáveis

- Preserve a imagem-fonte original; faça cópias de trabalho e nunca a sobrescreva.
- Recorte cada peça pela silhueta externa da carta. Não inclua títulos, etiquetas, subtítulos, linhas divisórias da prancha, paleta, ícones soltos, códigos ou rodapé.
- Confira os limites visualmente; as coordenadas iniciais abaixo são apenas aproximações para a prancha de 1500 × 1110 px, não devem ser aplicadas cegamente.
- Não redimensione de forma não proporcional. Preserve a proporção original e a maior resolução de origem disponível.
- Não invente detalhes nem desenhe uma nova moldura por cima da referência sem autorização. Se a qualidade do recorte for insuficiente, documente a limitação e mantenha a origem.
- Não remova o fundo interno texturizado da carta automaticamente se isso destruir ornamentos, linhas ou detalhes. Separe o que é recorte seguro do que exigiria mascaramento manual.
- O asset visual fornece apenas acabamento. Os dados variáveis continuam como DOM/HTML e JSON acessíveis, editáveis e pesquisáveis.
- Não instalar bibliotecas ou ferramentas novas antes de verificar se as ferramentas locais existentes resolvem a tarefa.

## Fase 1 — Inventário e inspeção visual

1. Identifique o diretório raiz do projeto, a imagem-fonte e os assets atuais.
2. Registre dimensão, formato e tamanho de cada arquivo.
3. Abra/inspecione a prancha antes dos recortes.
4. Identifique visualmente os seis limites externos, deixando de fora as legendas abaixo das cartas.
5. Gere um plano de recorte (coordenadas x, y, largura, altura) e confira se cada caixa contém exatamente uma peça.

### Coordenadas de partida para `asset-sheet-grid.png` (1500 × 1110)

Use como estimativas e ajuste conforme a inspeção real:

- Verso: região aproximada `x=135, y=132, w=250, h=352`.
- Herói: região aproximada `x=585, y=132, w=250, h=352`.
- Criatura: região aproximada `x=1038, y=132, w=250, h=352`.
- Estrutura: região aproximada `x=135, y=582, w=250, h=352`.
- Magia instantânea: região aproximada `x=585, y=582, w=250, h=352`.
- Magia canalizada: região aproximada `x=1038, y=582, w=250, h=352`.

Essas caixas são intencionalmente aproximadas para facilitar a detecção. Faça o crop final tight o suficiente para remover os rótulos sem amputar cantos, sombras úteis ou bordas ornamentais.

## Fase 2 — Recorte e exportação

Crie ou atualize os seguintes arquivos, respeitando a convenção existente no projeto. Se não houver uma convenção, utilize:

```text
public/assets/farel/cards/
  card-back.png
  card-back.webp
  template-hero.png
  template-hero.webp
  template-creature.png
  template-creature.webp
  template-structure.png
  template-structure.webp
  template-spell-instant.png
  template-spell-instant.webp
  template-spell-channel.png
  template-spell-channel.webp
```

Orientações:

- PNG: manter versão de qualidade para edição, conferência e transparência quando houver alpha real.
- WebP: versão de produção comprimida, com qualidade visual alta; usar alpha se existir transparência real.
- Não converter PNG em falsa transparência. Se a arte de origem tiver fundo opaco, mantenha-o opaco e descreva isso no manifesto.
- Se algum crop permitir transparência externa verdadeira sem danificar a moldura, preserve-a; não tente remover o fundo interno texturizado só para obter transparência.
- Não ampliar a resolução usando interpolação para fingir detalhe que não existe.

## Fase 3 — Preparação para cartas com ilustração dinâmica

As molduras da prancha podem conter textura/arte de placeholder dentro da janela principal. O projeto deve permitir que a arte real da carta seja inserida pelo código sem ser incorporada na imagem de fundo.

1. Determine, para cada template, a área útil da ilustração — a janela interna superior, sem cobrir os ornamentos externos nem a divisória para o texto.
2. Defina a geometria por proporção, não só por pixels fixos, para que funcione em diferentes tamanhos de carta. Exemplo de estrutura:

```html
<article class="card card--hero">
  <img class="card__art" src="assets/art/hero-example.webp" alt="" />
  <img class="card__frame" src="assets/farel/cards/template-hero.webp" alt="" />
  <header class="card__header">
    <span class="card__cost">4</span>
    <span class="card__type">Herói</span>
  </header>
  <div class="card__content">
    <h3 class="card__name">Nome da carta</h3>
    <p class="card__effect">Texto da habilidade</p>
  </div>
  <footer class="card__stats">
    <span class="card__attack">Dado: 1d6</span>
    <span class="card__health">Vida: 20</span>
  </footer>
</article>
```

3. Se a moldura completa cobrir a arte, posicione a arte por baixo e ajuste `object-fit: cover`, `overflow: hidden` e a janela interna até os limites ficarem corretos. Se o placeholder da moldura continuar visível por cima da arte, crie, quando possível, uma camada de moldura com janela interna transparente por máscara cuidadosamente revisada — sem apagar os ornamentos dos cantos. Não crie máscara automática se ela degradar o resultado; registre a limitação e use o melhor arranjo por camadas.
4. Use `position: absolute` e valores proporcionais para a arte e a moldura. Mantenha os textos em elementos HTML independentes e acima da textura de fundo.
5. A imagem de verso deve ser usada apenas quando a carta estiver virada para baixo; não exiba nomes ou efeitos no verso.

## Fase 4 — Manifesto e integração

Crie um manifesto, por exemplo `public/assets/farel/cards/assets-manifest.json`, contendo por asset:

- `id` estável;
- `type` (`back`, `hero`, `creature`, `structure`, `spell-instant`, `spell-channel`);
- caminho PNG e caminho WebP;
- largura e altura reais;
- proporção (`width / height`);
- indicação de transparência (`hasAlpha`);
- janela de arte em valores normalizados de 0 a 1 (`x`, `y`, `width`, `height`), caso tenha sido possível determiná-la;
- observações sobre limitações conhecidas.

Exemplo esquemático:

```json
{
  "id": "template-hero",
  "type": "hero",
  "png": "/assets/farel/cards/template-hero.png",
  "webp": "/assets/farel/cards/template-hero.webp",
  "width": 234,
  "height": 332,
  "aspectRatio": 0.705,
  "hasAlpha": false,
  "artWindow": { "x": 0.07, "y": 0.06, "width": 0.86, "height": 0.55 }
}
```

Os números acima são somente um exemplo de formato; preencha os valores com os resultados reais medidos e validados.

Integre os novos caminhos ao HTML/CSS existente sem quebrar as cartas de demonstração. Reutilize `farel-demo-cards.json` (ou o equivalente atual) como fonte dos dados. Não codifique nomes, vida, custos ou efeitos dentro dos PNGs.

## Fase 5 — Folha de conferência

Gere uma nova imagem de conferência, por exemplo `docs/assets/asset-sheet-extracted.png`, com fundo neutro, as seis peças recortadas, rótulos externos e dimensões exibidas fora dos próprios assets. Isso serve apenas para revisão; a imagem de conferência não deve ser usada como asset individual pelo site.

Também crie `docs/assets/asset-slicing-report.md` com:

- arquivos encontrados e reutilizados;
- arquivos criados/atualizados;
- dimensões, formatos e tamanhos antes/depois;
- método usado para os crops;
- valores finais das janelas de arte;
- problemas visuais conhecidos e decisões que precisam de revisão humana.

## Fase 6 — Testes e critérios de aceite

A missão só está concluída quando:

- [ ] Existem seis assets individuais: verso e cinco templates.
- [ ] Nenhum crop inclui as legendas ou elementos de UI da prancha.
- [ ] Nenhuma moldura perdeu cantos, filetes ou detalhes importantes.
- [ ] As proporções foram preservadas; nenhum asset está esticado.
- [ ] PNG e WebP abrem e renderizam corretamente.
- [ ] O HTML mostra pelo menos um exemplo de cada tipo de carta.
- [ ] A ilustração pode ser trocada sem editar o PNG da moldura.
- [ ] Nomes, custos, efeitos, vida e palavras-chave continuam no DOM/JSON.
- [ ] A página não apresenta imagens quebradas, console errors ou caminhos inválidos.
- [ ] A folha de conferência mostra todos os seis recortes lado a lado.
- [ ] O relatório distingue fatos verificados de estimativas e limitações.

## Execução autônoma

Execute as fases na ordem, sem parar para pedir confirmação para decisões reversíveis e de baixo risco. Antes de qualquer substituição destrutiva, crie backup. Quando encontrar ambiguidade visual que afete a qualidade, escolha a alternativa reversível e registre a dúvida no relatório em vez de improvisar silenciosamente. Ao final, apresente um resumo curto com arquivos criados, caminhos, testes executados e qualquer pendência.
