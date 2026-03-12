## PR Fase 6 - Testes e documentacao

### Objetivo
Cobrir o fluxo multi-moeda com testes e atualizar documentacao tecnica e de produto.

### Escopo
1. Adicionar/atualizar testes para:
- conversao de moeda
- validacoes de moeda
- criacao de item IOF (3.5%)
- total em BRL
2. Atualizar `docs/API.md` com:
- endpoint `POST /api/currency/convert`
- novos campos de `expense_items`
- exemplo de lancamento em moeda estrangeira + IOF
3. Atualizar `docs/PRD.md` com requisito funcional de multi-moeda e IOF.

### Fora de escopo
- Mudancas funcionais de backend/frontend alem das necessarias para teste

### Arquivos previstos
- `tests/backend-flow.test.mjs` (ou novos testes)
- `docs/API.md`
- `docs/PRD.md`

### Criterios de aceite
- Testes principais passam localmente.
- Documentacao reflete comportamento real do sistema.
- Exemplo no docs cobre caso CLP -> BRL com lancamento IOF.

### Testes
1. Rodar suite automatizada de backend.
2. Validar exemplos documentados manualmente via API.
3. Verificar que docs estao alinhados com implementacao final.

### Riscos
- Divergencia entre docs e comportamento final por mudancas tardias.

### Mitigacao
- Revisao final cruzada: codigo x testes x docs.
