## PR Fase 3 - Formulario multi-moeda no AddExpense

### Objetivo
Permitir lancamento em BRL, CLP, USD e EUR com sugestao de valor em BRL editavel.

### Escopo
1. Estender `AddExpenseView.vue` com campos:
- `originalCurrency`
- `originalAmountDisplay`
- `suggestedBRLAmount`
2. Adicionar seletor de moeda (default `BRL`).
3. Chamar endpoint de conversao para sugerir BRL.
4. Manter campo de valor em BRL editavel pelo usuario.
5. Exibir nota da moeda original (ex: `Compra em CLP 27.000`).
6. Exibir estimativa de IOF 3.5% no formulario.
7. Enviar novos campos no `handleAddItem`.

### Fora de escopo
- Ajustes de listagem detalhada
- Testes E2E completos

### Arquivos previstos
- `apps/web/src/views/AddExpenseView.vue`
- `apps/web/src/stores/expenses.ts` (se necessario para payload)

### Criterios de aceite
- Usuario consegue selecionar moeda.
- Conversao sugere BRL corretamente.
- Valor BRL pode ser alterado manualmente.
- Payload inclui dados de moeda para backend.
- Fluxo BRL puro permanece funcionando.

### Testes
1. Lancamento BRL sem conversao.
2. Lancamento CLP com sugestao de BRL.
3. Edicao manual do valor BRL apos sugestao.
4. Validar envio correto para backend.

### Riscos
- Conversao disparando muitas chamadas durante digitacao.
- Inconsistencia entre valor sugerido e valor final editado.

### Mitigacao
- Debounce na chamada de conversao.
- Mensagem clara: valor em BRL e editavel e sera o valor contabil.
