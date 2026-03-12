## PR Fase 5 - Ajustes de store e exibicao de itens multi-moeda

### Objetivo
Atualizar a camada de dados no frontend e melhorar exibicao de itens em moeda estrangeira, mantendo IOF como lancamento normal.

### Escopo
1. Atualizar `expenses.ts` para aceitar e enviar novos campos de moeda.
2. Ajustar visualizacao de itens no detalhe do relatorio:
- badge de moeda quando nao for BRL
- exibicao de valor original
3. Garantir que item de IOF seja apresentado como item normal da categoria `Taxas`.
4. Confirmar que total do relatorio segue baseado em `amount` BRL.
5. Na impressao do relatorio (`PrintReportView.vue`), exibir abaixo da descricao de cada despesa em moeda estrangeira um texto muted com o valor da compra na moeda de origem (ex: `Compra em CLP 27.000`). O texto so aparece quando `original_currency` for diferente de `BRL`.

### Fora de escopo
- Mudancas de estilo amplas fora dos componentes de despesa

### Arquivos previstos
- `apps/web/src/stores/expenses.ts`
- `apps/web/src/views/ExpenseReportDetailView.vue`
- `apps/web/src/views/PrintReportView.vue`
- (se necessario) componentes auxiliares de listagem de itens

### Criterios de aceite
- Store envia payload completo de moeda.
- Itens estrangeiros exibem moeda e valor original.
- Item de IOF aparece sem tratamento especial de rotulo automatico.
- Total segue correto em BRL.
- Impressao do relatorio exibe texto muted com valor na moeda original abaixo da descricao, somente para itens com `original_currency != BRL`.
- Itens em BRL ou sem campo de moeda nao exibem texto adicional na impressao.

### Testes
1. Ver detalhe de relatorio com itens BRL + CLP + IOF.
2. Validar formato visual e consistencia de valores.
3. Validar total final do relatorio.
4. Imprimir relatorio com itens em moeda estrangeira e validar que o texto muted aparece abaixo da descricao com o valor original.
5. Imprimir relatorio somente com itens BRL e validar que nenhum texto extra aparece.

### Riscos
- Regressao de exibicao em relatorios antigos.

### Mitigacao
- Fallback de renderizacao quando campos novos estiverem ausentes.
