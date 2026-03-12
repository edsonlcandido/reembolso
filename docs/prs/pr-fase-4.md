## PR Fase 4 - Validacoes de moeda e regras de negocio

### Objetivo
Consolidar regras de validacao para moedas e garantir consistencia dos dados multi-moeda em todos os planos.

### Escopo
1. Validar moedas suportadas: `BRL`, `CLP`, `USD`, `EUR`.
2. Exigir campos de conversao quando moeda diferente de BRL:
- `suggested_brl_amount`
- `conversion_rate`
3. Manter suporte multi-moeda em todos os planos.
4. Preservar regra ja existente do plano FREE (limite de 5 relatorios), sem restringir moeda.

### Fora de escopo
- Mudancas visuais de UX
- Ajustes de exportacao

### Arquivos previstos
- `pocketbase/pb_hooks/hooksExpenseItems.pb.js`
- (opcional) `pocketbase/pb_hooks/hooksExpenseReports.pb.js` se houver ajuste de regra correlata

### Criterios de aceite
- Moeda invalida retorna erro claro.
- Lancamento estrangeiro sem campos de conversao retorna erro.
- FREE e PRO aceitam moedas suportadas.
- Limite de 5 relatorios no FREE permanece ativo.

### Testes
1. Criar item com moeda invalida.
2. Criar item em USD sem taxa/conversao.
3. Criar item em EUR no FREE e no PRO.
4. Validar que regra de limite FREE nao foi afetada.

### Riscos
- Quebra de fluxos legados que nao enviam novos campos.

### Mitigacao
- Defaults seguros para BRL.
- Mensagens de erro objetivas para clientes antigos.
