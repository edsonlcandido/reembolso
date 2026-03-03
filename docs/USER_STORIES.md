# Histórias de Usuário — Sistema de Reembolso

**Versão:** 1.0  
**Data:** Março 2026  
**Status:** Em Desenvolvimento

---

## Visão Geral dos Papéis

| Papel | Descrição |
|-------|-----------|
| **Funcionário** | Colaborador que registra e submete despesas para reembolso |
| **Aprovador** | Responsável por revisar, aprovar ou rejeitar relatórios de despesa |
| **Admin** | Administrador da empresa com controle total sobre configurações, usuários e categorias |

---

## 👤 Funcionário

### Autenticação e Perfil

**US-F01 — Criar conta**  
Como **funcionário**, eu quero **criar uma conta com e-mail e senha** para que **eu possa acessar o sistema e submeter meus pedidos de reembolso.**

**Critérios de Aceitação:**
- Formulário de cadastro com nome, e-mail e senha
- Validação de e-mail único
- Redirecionamento para o dashboard após cadastro

---

**US-F02 — Fazer login**  
Como **funcionário**, eu quero **entrar no sistema com e-mail e senha** para que **eu possa acessar minhas despesas e relatórios.**

**Critérios de Aceitação:**
- Campo de e-mail e senha
- Mensagem de erro clara em caso de credenciais inválidas
- Redirecionamento para o dashboard após login bem-sucedido

---

**US-F03 — Atualizar perfil**  
Como **funcionário**, eu quero **editar meu nome, foto de perfil e senha** para que **minhas informações estejam sempre atualizadas.**

**Critérios de Aceitação:**
- Página de perfil com campos editáveis
- Upload de foto de avatar
- Confirmação de senha para alteração de senha

---

### Relatórios de Despesa

**US-F04 — Criar relatório de despesa**  
Como **funcionário**, eu quero **criar um novo relatório de despesas com título e período** para que **eu possa agrupar minhas despesas de forma organizada.**

**Critérios de Aceitação:**
- Campos: título, período (data início e fim), centro de custo, projeto, descrição
- Relatório criado com status "Rascunho"
- Possibilidade de salvar e continuar editando depois

---

**US-F05 — Listar meus relatórios**  
Como **funcionário**, eu quero **ver a lista de todos os meus relatórios de despesa** para que **eu possa acompanhar o status de cada um.**

**Critérios de Aceitação:**
- Listagem com título, período, total e status
- Status visíveis: Rascunho, Enviado, Aprovado, Rejeitado, Pago
- Ordenação por data de criação

---

**US-F06 — Editar relatório em rascunho**  
Como **funcionário**, eu quero **editar um relatório que ainda está em rascunho** para que **eu possa corrigir informações antes de submeter.**

**Critérios de Aceitação:**
- Edição disponível apenas para relatórios com status "Rascunho"
- Campos editáveis: título, período, centro de custo, projeto, descrição

---

**US-F07 — Excluir relatório em rascunho**  
Como **funcionário**, eu quero **excluir um relatório que ainda está em rascunho** para que **eu possa remover registros que não serão mais utilizados.**

**Critérios de Aceitação:**
- Exclusão disponível apenas para relatórios com status "Rascunho"
- Confirmação antes de excluir
- Exclusão remove também os itens de despesa vinculados

---

**US-F08 — Submeter relatório para aprovação**  
Como **funcionário**, eu quero **submeter meu relatório de despesas para aprovação** para que **o aprovador responsável possa revisá-lo.**

**Critérios de Aceitação:**
- Botão "Submeter" disponível em relatórios com status "Rascunho"
- Status muda para "Enviado" após submissão
- Relatório fica bloqueado para edição após submissão

---

**US-F09 — Visualizar detalhe do relatório**  
Como **funcionário**, eu quero **ver o detalhe completo de um relatório**, incluindo todos os itens, valores e histórico de ações, para que **eu entenda o que aconteceu com minha solicitação.**

**Critérios de Aceitação:**
- Exibição de todos os itens de despesa com valores e recibos
- Histórico de aprovações e ações com data, responsável e notas
- Status atual e valor total do relatório

---

### Itens de Despesa

**US-F10 — Adicionar item de despesa manualmente**  
Como **funcionário**, eu quero **adicionar uma despesa informando data, categoria, valor e descrição** para que **eu possa registrar despesas sem foto de recibo.**

**Critérios de Aceitação:**
- Campos: data, categoria, valor, descrição, estabelecimento, observações
- Categoria selecionada a partir das categorias da empresa
- Item adicionado ao relatório selecionado

---

**US-F11 — Fazer upload de foto do recibo**  
Como **funcionário**, eu quero **tirar ou anexar uma foto do cupom fiscal** para que **eu tenha comprovante da despesa no sistema.**

**Critérios de Aceitação:**
- Upload via câmera ou galeria do dispositivo
- Pré-visualização da imagem antes de salvar
- Imagem armazenada e vinculada ao item de despesa

---

**US-F12 — Usar OCR com IA para preencher a despesa automaticamente**  
Como **funcionário**, eu quero **fazer upload de uma foto do cupom e ter os dados extraídos automaticamente pela IA** para que **eu economize tempo e evite erros de digitação.**

**Critérios de Aceitação:**
- Sistema processa a imagem e extrai: data, valor, estabelecimento, categoria sugerida
- Dados extraídos são pré-preenchidos no formulário
- Funcionário pode revisar e corrigir os dados antes de salvar
- Indicador de confiança do OCR é exibido

---

**US-F13 — Editar item de despesa**  
Como **funcionário**, eu quero **editar um item de despesa de um relatório em rascunho** para que **eu possa corrigir informações incorretas.**

**Critérios de Aceitação:**
- Edição disponível apenas quando o relatório está em "Rascunho"
- Todos os campos do item são editáveis

---

**US-F14 — Remover item de despesa**  
Como **funcionário**, eu quero **remover um item de despesa de um relatório em rascunho** para que **eu possa excluir lançamentos incorretos.**

**Critérios de Aceitação:**
- Remoção disponível apenas quando o relatório está em "Rascunho"
- Confirmação antes de remover
- Total do relatório é atualizado automaticamente

---

### Acompanhamento

**US-F15 — Ver histórico de ações do relatório**  
Como **funcionário**, eu quero **ver o histórico completo de ações realizadas no meu relatório** para que **eu saiba quem aprovou, rejeitou ou pediu revisão e qual foi o motivo.**

**Critérios de Aceitação:**
- Lista de ações em ordem cronológica
- Cada ação exibe: data, responsável, tipo (aprovação/rejeição/revisão) e notas
- Status do relatório reflete a última ação

---

**US-F16 — Ver quais itens foram pagos**  
Como **funcionário**, eu quero **visualizar quais itens do meu relatório já foram pagos** para que **eu saiba o que ainda está pendente de pagamento.**

**Critérios de Aceitação:**
- Cada item indica se foi pago, por quem e quando
- Relatório exibe status "Pago" ou "Parcialmente Pago"

---

---

## 🔍 Aprovador

> O Aprovador tem todas as funcionalidades do Funcionário, mais as listadas abaixo.

### Dashboard de Aprovações

**US-A01 — Ver painel de relatórios pendentes**  
Como **aprovador**, eu quero **ver um painel com todos os relatórios aguardando minha aprovação** para que **eu possa priorizar e gerenciar as solicitações pendentes.**

**Critérios de Aceitação:**
- Lista de relatórios com status "Enviado"
- Exibição de: funcionário, título, período, total e data de envio
- Ordenação por data de envio (mais antigos primeiro)

---

**US-A02 — Ver detalhe completo do relatório para revisão**  
Como **aprovador**, eu quero **abrir o detalhe de um relatório enviado e ver todos os itens com recibos e valores** para que **eu possa fazer uma análise completa antes de decidir.**

**Critérios de Aceitação:**
- Exibição de todos os itens com data, categoria, valor, descrição e foto do recibo
- Dados do OCR visíveis quando disponíveis
- Histórico de ações anteriores exibido

---

### Ações de Aprovação

**US-A03 — Aprovar relatório**  
Como **aprovador**, eu quero **aprovar um relatório de despesas** para que **o funcionário e o financeiro saibam que o reembolso foi autorizado.**

**Critérios de Aceitação:**
- Botão "Aprovar" disponível em relatórios com status "Enviado"
- Campo opcional para notas de aprovação
- Status muda para "Aprovado" após a ação
- Ação registrada no histórico com data e responsável

---

**US-A04 — Rejeitar relatório**  
Como **aprovador**, eu quero **rejeitar um relatório com uma justificativa** para que **o funcionário saiba o motivo e possa corrigir o problema.**

**Critérios de Aceitação:**
- Botão "Rejeitar" disponível em relatórios com status "Enviado"
- Campo obrigatório para justificativa da rejeição
- Status muda para "Rejeitado" após a ação
- Ação registrada no histórico com o motivo

---

**US-A05 — Devolver relatório para revisão**  
Como **aprovador**, eu quero **devolver um relatório para que o funcionário faça ajustes** sem rejeitar definitivamente, para que **o funcionário possa corrigir e resubmeter.**

**Critérios de Aceitação:**
- Opção de "Devolver para Revisão" disponível em relatórios "Enviados"
- Campo obrigatório para indicar o que deve ser ajustado
- Status retorna para "Rascunho" permitindo edição pelo funcionário
- Ação registrada no histórico

---

**US-A06 — Encaminhar relatório para outro aprovador**  
Como **aprovador**, eu quero **encaminhar um relatório para outro aprovador** para que **a pessoa mais adequada possa dar a decisão final.**

**Critérios de Aceitação:**
- Seleção de outro membro com papel de aprovador ou admin
- Campo opcional para notas de encaminhamento
- Ação registrada no histórico com o destinatário

---

### Pagamento

**US-A07 — Marcar item de despesa como pago**  
Como **aprovador**, eu quero **marcar itens individuais de um relatório como pagos** para que **o sistema reflita o pagamento parcial e o funcionário saiba o que já recebeu.**

**Critérios de Aceitação:**
- Ação disponível em relatórios com status "Aprovado"
- Cada item pode ser marcado individualmente como pago
- Status do relatório atualiza para "Parcialmente Pago" quando há itens pagos e não pagos

---

**US-A08 — Marcar relatório inteiro como pago**  
Como **aprovador**, eu quero **marcar o relatório completo como pago de uma vez** para que **o processo de pagamento seja registrado de forma eficiente.**

**Critérios de Aceitação:**
- Opção de marcar todos os itens como pagos simultaneamente
- Status do relatório muda para "Pago"
- Data e responsável pelo pagamento são registrados

---

**US-A09 — Ver histórico de aprovações realizadas**  
Como **aprovador**, eu quero **ver o histórico de todas as ações que realizei** para que **eu tenha controle sobre as decisões tomadas.**

**Critérios de Aceitação:**
- Lista de ações com data, relatório, funcionário e tipo de ação
- Filtro por período e tipo de ação

---

---

## 🏢 Admin

> O Admin tem todas as funcionalidades do Aprovador e do Funcionário, mais as listadas abaixo.

### Gestão da Empresa

**US-AD01 — Criar empresa**  
Como **admin**, eu quero **criar uma empresa no sistema** para que **os membros possam ser vinculados a ela e utilizem o sistema de reembolso corporativo.**

**Critérios de Aceitação:**
- Campos: nome, CNPJ, e-mail, telefone, endereço, logo
- Empresa criada com o criador automaticamente como administrador
- URL/slug único gerado para a empresa

---

**US-AD02 — Editar dados da empresa**  
Como **admin**, eu quero **editar as informações da empresa** (nome, logo, contato, endereço) para que **os dados estejam sempre atualizados.**

**Critérios de Aceitação:**
- Formulário com todos os campos editáveis
- Upload de logotipo
- Alterações salvas e refletidas imediatamente

---

**US-AD03 — Configurar taxa de quilometragem**  
Como **admin**, eu quero **configurar a taxa de reembolso por quilômetro (km_rate)** para que **despesas de deslocamento sejam calculadas automaticamente.**

**Critérios de Aceitação:**
- Campo numérico para valor por km
- Configuração salva nas definições da empresa

---

### Gestão de Membros

**US-AD04 — Convidar membro para a empresa**  
Como **admin**, eu quero **adicionar um usuário à empresa informando seu e-mail** para que **ele possa submeter e gerenciar despesas dentro da organização.**

**Critérios de Aceitação:**
- Busca de usuário por e-mail
- Definição do papel: Funcionário, Aprovador ou Admin
- Usuário vinculado à empresa após confirmação

---

**US-AD05 — Alterar papel de um membro**  
Como **admin**, eu quero **mudar o papel de um membro da empresa** (Funcionário → Aprovador, por exemplo) para que **as permissões reflitam sua função atual.**

**Critérios de Aceitação:**
- Seleção do novo papel: Funcionário, Aprovador ou Admin
- Alteração salva imediatamente
- Novo papel entra em vigor no próximo acesso do usuário

---

**US-AD06 — Remover membro da empresa**  
Como **admin**, eu quero **remover um colaborador da empresa** para que **ex-funcionários não tenham mais acesso aos dados corporativos.**

**Critérios de Aceitação:**
- Confirmação antes da remoção
- Membro perde acesso à empresa após remoção
- Relatórios existentes do membro são preservados

---

**US-AD07 — Ver lista de membros da empresa**  
Como **admin**, eu quero **ver todos os membros da empresa com seus papéis e status** para que **eu tenha visibilidade completa sobre quem tem acesso ao sistema.**

**Critérios de Aceitação:**
- Lista com nome, e-mail, papel e data de entrada
- Filtro por papel (Admin, Aprovador, Funcionário)
- Indicador de status ativo/inativo

---

### Gestão de Categorias

**US-AD08 — Criar categoria de despesa**  
Como **admin**, eu quero **criar categorias personalizadas de despesa** para que **os funcionários possam classificar corretamente seus gastos conforme a política da empresa.**

**Critérios de Aceitação:**
- Campos: nome, descrição, ícone, cor
- Categoria vinculada à empresa
- Categoria disponível imediatamente para uso nos relatórios

---

**US-AD09 — Editar categoria de despesa**  
Como **admin**, eu quero **editar uma categoria existente** para que **o nome ou ícone reflita melhor a realidade da empresa.**

**Critérios de Aceitação:**
- Todos os campos da categoria são editáveis
- Alteração refletida nos novos itens criados

---

**US-AD10 — Desativar categoria de despesa**  
Como **admin**, eu quero **desativar uma categoria que não é mais usada** para que **ela não apareça para os funcionários ao criar novas despesas.**

**Critérios de Aceitação:**
- Categoria desativada não aparece na lista de seleção ao criar itens
- Itens existentes com essa categoria não são afetados

---

### Relatórios e Visibilidade

**US-AD11 — Ver todos os relatórios da empresa**  
Como **admin**, eu quero **visualizar todos os relatórios de despesas de todos os funcionários da empresa** para que **eu tenha controle total sobre os gastos corporativos.**

**Critérios de Aceitação:**
- Lista completa de relatórios com filtro por funcionário, status e período
- Acesso ao detalhe de qualquer relatório

---

**US-AD12 — Acompanhar limite do plano**  
Como **admin**, eu quero **saber quantos relatórios foram criados no ciclo atual** para que **eu possa monitorar o uso e considerar um upgrade de plano se necessário.**

**Critérios de Aceitação:**
- Indicador do número de relatórios criados no ciclo atual
- Limite do plano gratuito (5 relatórios/ciclo) visível no dashboard
- Alerta quando o limite é atingido

---

---

## 📋 Resumo por Papel

| Código | História | Funcionário | Aprovador | Admin |
|--------|----------|:-----------:|:---------:|:-----:|
| US-F01 | Criar conta | ✅ | ✅ | ✅ |
| US-F02 | Fazer login | ✅ | ✅ | ✅ |
| US-F03 | Atualizar perfil | ✅ | ✅ | ✅ |
| US-F04 | Criar relatório | ✅ | ✅ | ✅ |
| US-F05 | Listar meus relatórios | ✅ | ✅ | ✅ |
| US-F06 | Editar relatório em rascunho | ✅ | ✅ | ✅ |
| US-F07 | Excluir relatório em rascunho | ✅ | ✅ | ✅ |
| US-F08 | Submeter relatório | ✅ | ✅ | ✅ |
| US-F09 | Ver detalhe do relatório | ✅ | ✅ | ✅ |
| US-F10 | Adicionar item manualmente | ✅ | ✅ | ✅ |
| US-F11 | Upload de foto do recibo | ✅ | ✅ | ✅ |
| US-F12 | OCR com IA | ✅ | ✅ | ✅ |
| US-F13 | Editar item de despesa | ✅ | ✅ | ✅ |
| US-F14 | Remover item de despesa | ✅ | ✅ | ✅ |
| US-F15 | Ver histórico de ações | ✅ | ✅ | ✅ |
| US-F16 | Ver itens pagos | ✅ | ✅ | ✅ |
| US-A01 | Ver painel de pendências | ❌ | ✅ | ✅ |
| US-A02 | Ver detalhe para revisão | ❌ | ✅ | ✅ |
| US-A03 | Aprovar relatório | ❌ | ✅ | ✅ |
| US-A04 | Rejeitar relatório | ❌ | ✅ | ✅ |
| US-A05 | Devolver para revisão | ❌ | ✅ | ✅ |
| US-A06 | Encaminhar para aprovador | ❌ | ✅ | ✅ |
| US-A07 | Marcar item como pago | ❌ | ✅ | ✅ |
| US-A08 | Marcar relatório como pago | ❌ | ✅ | ✅ |
| US-A09 | Ver histórico de aprovações | ❌ | ✅ | ✅ |
| US-AD01 | Criar empresa | ❌ | ❌ | ✅ |
| US-AD02 | Editar dados da empresa | ❌ | ❌ | ✅ |
| US-AD03 | Configurar taxa de km | ❌ | ❌ | ✅ |
| US-AD04 | Convidar membro | ❌ | ❌ | ✅ |
| US-AD05 | Alterar papel de membro | ❌ | ❌ | ✅ |
| US-AD06 | Remover membro | ❌ | ❌ | ✅ |
| US-AD07 | Ver lista de membros | ❌ | ❌ | ✅ |
| US-AD08 | Criar categoria | ❌ | ❌ | ✅ |
| US-AD09 | Editar categoria | ❌ | ❌ | ✅ |
| US-AD10 | Desativar categoria | ❌ | ❌ | ✅ |
| US-AD11 | Ver todos os relatórios | ❌ | ❌ | ✅ |
| US-AD12 | Acompanhar limite do plano | ❌ | ❌ | ✅ |

---

*Documento gerado em Março de 2026. Mantenha atualizado conforme novas funcionalidades forem implementadas.*
