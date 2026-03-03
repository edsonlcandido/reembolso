# Documentação da API - Sistema de Reembolso

Esta documentação descreve os endpoints da API do sistema de reembolso, construído sobre o PocketBase.

## Base URL

**Desenvolvimento:** `http://localhost:8090/api`  
**Produção:** `https://seu-dominio.com/api`

## Autenticação

Todos os endpoints protegidos requerem autenticação via JWT token no header:

```
Authorization: YOUR_AUTH_TOKEN
```

O token é obtido após login bem-sucedido e enviado diretamente no header (sem prefixo "Bearer"). O PocketBase Client gerencia isso automaticamente.

---

## Convenção de Valores Monetários

Todos os valores monetários na API são armazenados e transmitidos em **centavos (integer)**. Isso evita problemas de arredondamento com números de ponto flutuante.

| Valor Real (R$) | Valor na API (centavos) |
|------------------|------------------------|
| R$ 1,00          | 100                    |
| R$ 85,50         | 8550                   |
| R$ 2.450,00      | 245000                 |
| R$ 10.000,00     | 1000000                |

Para exibir ao usuário, divida o valor por 100. Para enviar à API, multiplique por 100.

---

## Endpoints

### 1. Autenticação

#### 1.1 Login
```http
POST /api/collections/users/auth-with-password
```

**Body:**
```json
{
  "identity": "user@example.com",
  "password": "senha123"
}
```

**Response (200 OK):**
```json
{
  "token": "eyJhbGc...",
  "record": {
    "id": "abc123",
    "email": "user@example.com",
    "name": "João Silva",
    "verified": true,
    "created": "2026-01-15 10:00:00.000Z",
    "updated": "2026-02-10 14:00:00.000Z"
  }
}
```

#### 1.2 Registro
```http
POST /api/collections/users/records
```

**Body:**
```json
{
  "email": "novousuario@example.com",
  "password": "senha123",
  "passwordConfirm": "senha123",
  "name": "Novo Usuário"
}
```

**Response (200 OK):**
```json
{
  "id": "xyz789",
  "email": "novousuario@example.com",
  "name": "Novo Usuário",
  "verified": false,
  "created": "2026-02-10 14:30:00.000Z",
  "updated": "2026-02-10 14:30:00.000Z"
}
```

#### 1.3 Refresh Token
```http
POST /api/collections/users/auth-refresh
```

**Headers:**
```
Authorization: YOUR_AUTH_TOKEN
```

**Response (200 OK):**
```json
{
  "token": "eyJhbGc...",
  "record": { ... }
}
```

#### 1.4 Recuperação de Senha
```http
POST /api/collections/users/request-password-reset
```

**Body:**
```json
{
  "email": "user@example.com"
}
```

**Response (204 No Content)**

---

### 2. Empresas

#### 2.1 Listar Empresas
```http
GET /api/collections/companies/records
```

**Query Parameters:**
- `page` (int): Número da página (default: 1)
- `perPage` (int): Registros por página (default: 30)
- `filter` (string): Filtro PocketBase (ex: `active=true`)
- `sort` (string): Ordenação (ex: `-created`)

**Response (200 OK):**
```json
{
  "page": 1,
  "perPage": 30,
  "totalItems": 5,
  "totalPages": 1,
  "items": [
    {
      "id": "comp123",
      "name": "Acme Corp",
      "slug": "acme-corp",
      "cnpj": "12.345.678/0001-90",
      "email": "contato@acme.com",
      "phone": "(11) 98765-4321",
      "address": "Rua das Flores, 123",
      "logo": "comp123/logo_abc.png",
      "currency": "BRL",
      "km_rate": 100,
      "plan": "FREE",
      "billing_anchor_day": 1,
      "active": true,
      "created": "2026-01-10 09:00:00.000Z",
      "updated": "2026-02-05 16:00:00.000Z"
    }
  ]
}
```

> **Campos:** `plan` pode ser `FREE` ou `PRO`. `km_rate` é o valor em **centavos** por km (ex: `100` = R$ 1,00/km). `slug` é gerado automaticamente a partir do nome da empresa (minúsculas, hífens, único) e não é editável. `billing_anchor_day` é o dia do mês que inicia o ciclo de faturamento; para meses com menos dias, o ciclo começa no último dia do mês.

#### 2.2 Criar Empresa (via endpoint customizado)

> **Importante:** A criação de empresa deve ser feita pelo endpoint customizado `/api/companies/create` (ver Seção 9.1), que vincula automaticamente o criador como administrador.

#### 2.3 Atualizar Empresa
```http
PATCH /api/collections/companies/records/:id
```

**Body:**
```json
{
  "name": "Nova Empresa LTDA - Filial",
  "km_rate": 150,
  "plan": "PRO"
}
```

> **Efeito do `km_rate`:** A alteração afeta apenas **novos** itens de despesa criados após a mudança. Itens de km existentes não são recalculados retroativamente.

**Response (200 OK):**
```json
{
  "id": "comp456",
  "name": "Nova Empresa LTDA - Filial",
  ...
}
```

#### 2.4 Deletar Empresa
```http
DELETE /api/collections/companies/records/:id
```

**Response (204 No Content)**

---

### 3. Usuários de Empresa (Company Users)

#### 3.1 Listar Usuários da Empresa
```http
GET /api/collections/company_users/records
```

**Query Parameters:**
- `filter`: Ex: `company='comp123' && active=true`
- `expand`: Ex: `user,company`

**Response (200 OK):**
```json
{
  "items": [
    {
      "id": "cu123",
      "company": "comp123",
      "user": "user123",
      "role": "employee",
      "cost_center": "Marketing",
      "active": true,
      "created": "2026-01-15 10:00:00.000Z",
      "updated": "2026-02-10 11:00:00.000Z",
      "expand": {
        "user": {
          "id": "user123",
          "name": "Maria Silva",
          "email": "maria@example.com"
        },
        "company": {
          "id": "comp123",
          "name": "Acme Corp"
        }
      }
    }
  ]
}
```

#### 3.2 Adicionar Usuário à Empresa
```http
POST /api/collections/company_users/records
```

**Body:**
```json
{
  "company": "comp123",
  "user": "user456",
  "role": "approver",
  "cost_center": "Financeiro",
  "active": true
}
```

**Response (200 OK):**
```json
{
  "id": "cu789",
  "company": "comp123",
  "user": "user456",
  "role": "approver",
  "cost_center": "Financeiro",
  "active": true,
  "activated_at": "2026-02-10 14:00:00.000Z",
  "deactivated_at": null,
  ...
}
```

> **Roles disponíveis:** `admin`, `approver`, `employee`.  
> **Campos automáticos:** `activated_at` é preenchido automaticamente quando `active=true`. `deactivated_at` é preenchido quando `active` muda para `false`.

---

### 4. Ações de Aprovação (approval_actions)

A trilha de auditoria do fluxo de aprovação é registrada na collection `approval_actions`. Cada ação realizada por um aprovador ou admin gera um registro nesta collection.

#### 4.1 Listar Ações de um Relatório
```http
GET /api/collections/approval_actions/records
```

**Query Parameters:**
- `filter`: Ex: `report='rep123'`
- `expand`: `user,forwarded_to`
- `sort`: `created`

**Response (200 OK):**
```json
{
  "items": [
    {
      "id": "act123",
      "report": "rep123",
      "company": "comp123",
      "user": "user789",
      "action": "approve",
      "notes": "Despesas dentro da política.",
      "forwarded_to": null,
      "created": "2026-02-11T09:00:00Z",
      "updated": "2026-02-11T09:00:00Z",
      "expand": {
        "user": {
          "id": "user789",
          "name": "João Gerente",
          "email": "joao@example.com"
        }
      }
    }
  ]
}
```

**Valores possíveis para `action`:**
- `approve` — Relatório aprovado
- `reject` — Relatório rejeitado
- `forward` — Encaminhado para outro aprovador (campo `forwarded_to` preenchido)
- `pay` — Relatório marcado como pago integralmente
- `partially_pay` — Um ou mais itens marcados como pagos

#### 4.2 Criar Ação de Aprovação
```http
POST /api/collections/approval_actions/records
```

**Body:**
```json
{
  "report": "rep123",
  "company": "comp123",
  "user": "user789",
  "action": "approve",
  "notes": "Aprovado conforme política."
}
```

**Body para encaminhamento:**
```json
{
  "report": "rep123",
  "company": "comp123",
  "user": "user789",
  "action": "forward",
  "forwarded_to": "user999",
  "notes": "Encaminhando para o gestor do projeto."
}
```

> **Validações automáticas (via hooks):** O sistema valida que apenas usuários com role `admin` ou `approver` na empresa podem registrar ações de aprovação. Um usuário que aprovou o relatório não pode registrar a ação de pagamento do mesmo relatório.

---

### 5. Relatórios de Despesas

#### 5.1 Listar Relatórios
```http
GET /api/collections/expense_reports/records
```

**Query Parameters:**
- `filter`: Ex: `user='user123' && status='submitted'`
- `expand`: `company,user,approved_by,submitted_to`
- `sort`: Ex: `-created`

**Response (200 OK):**
```json
{
  "items": [
    {
      "id": "rep123",
      "company": "comp123",
      "user": "user123",
      "title": "Viagem São Paulo - Janeiro 2026",
      "period_start": "2026-01-15",
      "period_end": "2026-01-20",
      "cost_center": "Vendas",
      "project": "Projeto Alpha",
      "description": "Despesas da viagem de vendas",
      "total_amount": 245000,
      "advance_amount": 0,
      "status": "submitted",
      "submitted_at": "2026-01-21 10:00:00.000Z",
      "submitted_to": "user789",
      "approved_by": null,
      "approved_at": null,
      "rejection_reason": null,
      "created": "2026-01-15 14:00:00.000Z",
      "updated": "2026-01-21 10:00:00.000Z"
    }
  ]
}
```

> **Valores possíveis para `status`:** `draft`, `submitted`, `approved`, `rejected`, `paid`, `partially_paid`.  
> **Campo `advance_amount`:** Valor de adiantamento já recebido pelo funcionário (em centavos).  
> **Campo `submitted_to`:** Referência ao usuário aprovador para quem o relatório foi enviado.

#### 5.2 Criar Relatório
```http
POST /api/collections/expense_reports/records
```

**Body:**
```json
{
  "company": "comp123",
  "user": "user123",
  "title": "Despesas Fevereiro 2026",
  "period_start": "2026-02-01",
  "period_end": "2026-02-10",
  "cost_center": "Marketing",
  "description": "Despesas com eventos",
  "status": "draft"
}
```

**Response (200 OK):**
```json
{
  "id": "rep456",
  "total_amount": 0,
  ...
}
```

#### 5.3 Atualizar Relatório
```http
PATCH /api/collections/expense_reports/records/:id
```

**Body (submissão):**
```json
{
  "status": "submitted",
  "submitted_at": "2026-02-10T14:30:00Z",
  "submitted_to": "user789"
}
```

> **Efeito automático (hook):** Ao mudar `status` para `submitted`, o sistema cria automaticamente um registro na collection `approval_actions` com `action=forward`, registrando quem recebeu o relatório para aprovação.  
> **Limite FREE:** No plano FREE, são permitidos até 5 relatórios por ciclo. Ao atingir o limite, novos envios são bloqueados com erro `plan_limit`:
> ```json
> { "code": 400, "message": "Limite de relatórios do plano FREE atingido.", "data": { "plan_limit": { "code": "plan_limit", "message": "Limite de 5 relatórios por ciclo atingido." } } }
> ```

#### 5.4 Aprovar Relatório
```http
POST /api/collections/approval_actions/records
```

**Body:**
```json
{
  "report": "rep123",
  "company": "comp123",
  "user": "user789",
  "action": "approve",
  "notes": "Aprovado."
}
```

> A mudança de status do relatório para `approved` é feita pelo frontend após criar a ação de aprovação com `action=approve`.

#### 5.5 Rejeitar Relatório
```http
POST /api/collections/approval_actions/records
```

**Body:**
```json
{
  "report": "rep123",
  "company": "comp123",
  "user": "user789",
  "action": "reject",
  "notes": "Falta justificativa para algumas despesas."
}
```

> A mudança de status para `rejected` e o preenchimento de `rejection_reason` são feitos pelo frontend após criar a ação com `action=reject`.

---

### 6. Itens de Despesa

#### 6.1 Listar Itens de um Relatório
```http
GET /api/collections/expense_items/records
```

**Query Parameters:**
- `filter`: `report='rep123'`
- `sort`: `-date`

**Response (200 OK):**
```json
{
  "items": [
    {
      "id": "item123",
      "report": "rep123",
      "date": "2026-01-15T12:30:00Z",
      "category": "food",
      "amount": 8550,
      "description": "Almoço com cliente",
      "receipt_image": "item123/receipt_xyz.jpg",
      "merchant": "Restaurante Sabor",
      "ocr_data": {
        "valor_total": 85.50,
        "data": "2026-01-15",
        "hora": "12:30",
        "estabelecimento": "Restaurante Sabor",
        "categoria": "food"
      },
      "ocr_confidence": 0.95,
      "ocr_processed": true,
      "notes": "",
      "km": 0,
      "paid": false,
      "paid_by": null,
      "paid_at": null,
      "created": "2026-01-15T15:00:00Z",
      "updated": "2026-01-15T15:02:00Z"
    }
  ]
}
```

> **Campo `km`:** Para despesas de deslocamento, o campo `km` registra a distância percorrida. O `amount` é calculado automaticamente via hook: `km × company.km_rate`.  
> **Campos de pagamento:** `paid`, `paid_by` e `paid_at` são atualizados quando o aprovador marca o item como pago.

#### 6.2 Criar Item de Despesa (com OCR)
```http
POST /api/collections/expense_items/records
```

**Body (multipart/form-data):**
```json
{
  "report": "rep123",
  "date": "2026-02-10T19:00:00Z",
  "category": "transport",
  "receipt_image": <file>,
  "description": "Táxi aeroporto"
}
```

**Response (200 OK):**
```json
{
  "id": "item456",
  "report": "rep123",
  "receipt_image": "item456/receipt_abc.jpg",
  "ocr_processed": false,
  "amount": 0,
  ...
}
```

> **Nota:** O processamento OCR é feito de forma **síncrona** via endpoint customizado `POST /api/ai/read-receipt` (ver Seção 9.3). O frontend envia a imagem em base64, recebe os dados extraídos, e os usa para pré-preencher o formulário antes de criar o item.

#### 6.3 Atualizar Item (após revisão OCR)
```http
PATCH /api/collections/expense_items/records/:id
```

**Body:**
```json
{
  "amount": 4500,
  "description": "Táxi - Aeroporto para Hotel",
  "merchant": "Táxi Premium"
}
```

#### 6.4 Deletar Item
```http
DELETE /api/collections/expense_items/records/:id
```

**Response (204 No Content)**

---

### 7. Categorias

#### 7.1 Listar Categorias da Empresa
```http
GET /api/collections/categories/records
```

**Query Parameters:**
- `filter`: `company='comp123' && active=true`

**Response (200 OK):**
```json
{
  "items": [
    {
      "id": "cat123",
      "company": "comp123",
      "name": "Alimentação",
      "description": "Refeições, lanches, etc",
      "icon": "utensils",
      "color": "#10B981",
      "active": true
    },
    {
      "id": "cat456",
      "company": "comp123",
      "name": "Transporte",
      "description": "Táxi, uber, combustível",
      "icon": "car",
      "color": "#3B82F6",
      "active": true
    }
  ]
}
```

#### 7.2 Criar Categoria
```http
POST /api/collections/categories/records
```

**Body:**
```json
{
  "company": "comp123",
  "name": "Equipamentos",
  "description": "Compra de equipamentos",
  "icon": "desktop-computer",
  "color": "#8B5CF6",
  "active": true
}
```

---

### 8. Variáveis de Sistema (system_variables)

Usada internamente para armazenar configurações globais da plataforma, como chaves de API.

#### 8.1 Listar Variáveis (apenas superusuário)
```http
GET /api/collections/system_variables/records
```

**Response (200 OK):**
```json
{
  "items": [
    {
      "id": "sv123",
      "key": "OPENROUTER_API_KEY",
      "value": "sk-or-...",
      "description": "Chave da API do OpenRouter para OCR"
    }
  ]
}
```

> **Acesso restrito:** Esta collection é acessível apenas via PocketBase Admin UI ou superusuário. A chave de API de IA **não** deve ser exposta em variáveis de ambiente do frontend.

---

### 9. Endpoints Customizados

Além da API padrão do PocketBase, o sistema expõe os seguintes endpoints customizados implementados em `pocketbase/pb_hooks/main.pb.js`:

#### 9.1 Criar Empresa
```http
POST /api/companies/create
```

Cria uma nova empresa e vincula automaticamente o usuário autenticado como administrador (`role=admin`) na `company_users`.

**Headers:**
```
Authorization: YOUR_AUTH_TOKEN
```

**Body:**
```json
{
  "name": "Minha Empresa LTDA",
  "cnpj": "12.345.678/0001-90",
  "email": "contato@empresa.com",
  "phone": "(11) 91234-5678",
  "address": "Av. Principal, 456"
}
```

**Response (200 OK):**
```json
{
  "company": {
    "id": "comp789",
    "name": "Minha Empresa LTDA",
    "slug": "minha-empresa-ltda",
    "plan": "FREE",
    ...
  },
  "companyUser": {
    "id": "cu001",
    "company": "comp789",
    "user": "user123",
    "role": "admin",
    "active": true
  }
}
```

#### 9.2 Buscar Usuário por E-mail
```http
POST /api/users/find-by-email
```

Permite buscar um usuário pelo e-mail sem expor a collection diretamente. Usado para convidar membros à empresa.

**Headers:**
```
Authorization: YOUR_AUTH_TOKEN
```

**Body:**
```json
{
  "email": "funcionario@example.com"
}
```

**Response (200 OK):**
```json
{
  "id": "user456",
  "name": "Ana Souza",
  "email": "funcionario@example.com"
}
```

**Response (404 Not Found):**
```json
{
  "message": "Usuário não encontrado."
}
```

#### 9.3 Leitura de Recibo com IA (OCR)
```http
POST /api/ai/read-receipt
```

Envia uma imagem de cupom fiscal (em base64) para o modelo de IA (via OpenRouter) e retorna os dados extraídos. O processamento é **síncrono**.

**Headers:**
```
Authorization: YOUR_AUTH_TOKEN
```

**Body:**
```json
{
  "image": "data:image/jpeg;base64,/9j/4AAQ...",
  "mimeType": "image/jpeg"
}
```

**Response (200 OK):**
```json
{
  "valor_total": 85.50,
  "data": "2026-01-15",
  "hora": "12:30",
  "estabelecimento": "Restaurante Sabor",
  "categoria": "food",
  "itens": [
    { "descricao": "Prato Executivo", "valor": 45.00 },
    { "descricao": "Suco de Laranja", "valor": 12.50 }
  ]
}
```

> **Atenção:** O campo `valor_total` retornado é em **reais** (decimal). Para salvar o item em `expense_items`, o frontend deve converter para **centavos** multiplicando por 100. Ex: `85.50 × 100 = 8550`.

**Response (500 Internal Server Error — chave de API não configurada):**
```json
{
  "message": "API key não configurada."
}
```

> **Configuração:** A chave da API é armazenada na collection `system_variables` com `key=OPENROUTER_API_KEY`. Deve ser configurada via PocketBase Admin UI.

---

## Filtros PocketBase

O PocketBase usa uma sintaxe de filtro específica:

### Operadores Básicos
- `=` : Igual
- `!=` : Diferente
- `>` : Maior que
- `>=` : Maior ou igual
- `<` : Menor que
- `<=` : Menor ou igual
- `~` : Contém (case insensitive)
- `!~` : Não contém

### Operadores Lógicos
- `&&` : E
- `||` : OU

### Exemplos
```
// Relatórios do usuário com status submitted
filter=user='user123' && status='submitted'

// Despesas acima de R$ 100 (10000 centavos)
filter=amount>10000

// Empresas ativas com nome contendo "tech"
filter=active=true && name~'tech'

// Relatórios de janeiro ou fevereiro
filter=(period_start>='2026-01-01' && period_start<'2026-02-01') || (period_start>='2026-02-01' && period_start<'2026-03-01')
```

---

## Paginação

Todas as listagens suportam paginação:

```http
GET /api/collections/{collection}/records?page=2&perPage=50
```

**Response:**
```json
{
  "page": 2,
  "perPage": 50,
  "totalItems": 150,
  "totalPages": 3,
  "items": [...]
}
```

---

## Realtime (Server-Sent Events)

O PocketBase suporta atualizações em tempo real via SSE:

```javascript
// Subscribe to expense_reports changes
pb.collection('expense_reports').subscribe('*', (e) => {
  console.log('Relatório atualizado:', e.record)
})

// Subscribe to specific record
pb.collection('expense_reports').subscribe('rep123', (e) => {
  console.log('Relatório rep123 atualizado:', e.record)
})

// Unsubscribe
pb.collection('expense_reports').unsubscribe()
```

---

## Códigos de Status HTTP

- `200 OK` - Sucesso
- `201 Created` - Recurso criado
- `204 No Content` - Sucesso sem corpo de resposta
- `400 Bad Request` - Dados inválidos
- `401 Unauthorized` - Não autenticado
- `403 Forbidden` - Sem permissão
- `404 Not Found` - Recurso não encontrado
- `500 Internal Server Error` - Erro no servidor

---

## Tratamento de Erros

**Exemplo de Erro:**
```json
{
  "code": 400,
  "message": "Failed to create record.",
  "data": {
    "email": {
      "code": "validation_invalid_email",
      "message": "Must be a valid email address."
    }
  }
}
```

---

## Recursos Adicionais

- [PocketBase API Reference](https://pocketbase.io/docs/api-records/)
- [PocketBase Realtime](https://pocketbase.io/docs/api-realtime/)
- [PocketBase Authentication](https://pocketbase.io/docs/authentication/)
