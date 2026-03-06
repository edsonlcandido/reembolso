## PR Fase 2 - Conversao de moeda e criacao de lancamento de IOF

### Objetivo
Permitir sugestao de conversao para BRL e criar um lancamento de IOF (3.5%) quando a despesa for em moeda estrangeira.

### Escopo
1. Criar endpoint `POST /api/currency/convert` em `main.pb.js`.
2. Implementar validacoes de moeda suportada: `BRL`, `CLP`, `USD`, `EUR`.
3. Implementar hook em `hooksExpenseItems.pb.js` para criar lancamento de IOF quando `original_currency != BRL`.
4. Lancamento de IOF deve:
- usar mesma data/hora da despesa original
- usar categoria `Taxas`
- descricao no formato `IOF compra <valor> <moeda>` (ex: `IOF compra 27000 CLP`)
- calcular valor em BRL com aliquota 3.5%

### Fora de escopo
- Layout final da interface
- Badges visuais na listagem

### Arquivos previstos
- `pocketbase/pb_hooks/main.pb.js`
- `pocketbase/pb_hooks/hooksExpenseItems.pb.js`

### Criterios de aceite
- Endpoint retorna sugestao BRL e taxa de conversao.
- Criacao de item em BRL nao cria IOF.
- Criacao de item em CLP/USD/EUR cria item de IOF no mesmo relatorio.
- IOF usa mesma data da despesa original.
- Item de IOF aparece como item normal (sem flag textual de automatico).

### Testes
1. `POST /api/currency/convert` com entradas validas e invalidas.
2. Criar despesa em CLP e validar item de IOF.
3. Validar descricao `IOF compra ...`.
4. Validar recalculo de total do relatorio.

### Riscos
- Loop de hook criando IOF sobre IOF.
- Falha ao resolver categoria `Taxas`.

### Mitigacao
- Ignorar criacao de IOF quando descricao/categoria indicar que ja e IOF.
- Tratamento defensivo se categoria `Taxas` nao for encontrada.
