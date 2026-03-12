## PR Fase 1 - Base de dados e categoria Taxas

### Objetivo
Adicionar suporte estrutural para lancamentos em moeda estrangeira e garantir a categoria padrao `Taxas` para novas empresas.

### Escopo
1. Criar migration para novos campos em `expense_items`:
- `original_currency` (text, default `BRL`)
- `original_amount` (number)
- `suggested_brl_amount` (number)
- `conversion_rate` (number)
- `currency_note` (text)
2. Atualizar `hooksCompanies.pb.js` para incluir categoria padrao `Taxas`.

### Fora de escopo
- Conversao de moeda via endpoint
- Geracao de IOF
- Ajustes de UI

### Arquivos previstos
- `pocketbase/pb_migrations/<novo_arquivo>.js`
- `pocketbase/pb_hooks/hooksCompanies.pb.js`

### Criterios de aceite
- Migration aplica sem erro.
- Itens novos aceitam campos de moeda.
- Itens antigos continuam validos com `original_currency=BRL`.
- Empresa criada apos deploy recebe categoria `Taxas`.

### Testes
1. Criar empresa nova e validar categoria `Taxas`.
2. Criar item com e sem campos de moeda e validar persistencia.
3. Validar que o total do relatorio segue em BRL.

### Riscos
- Migracao com valores nulos em base existente.
- Duplicacao de categoria caso nao haja cuidado na criacao.

### Rollback
- Reverter migration.
- Reverter alteracao no array de categorias default.
