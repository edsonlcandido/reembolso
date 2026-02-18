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
      "cnpj": "12.345.678/0001-90",
      "email": "contato@acme.com",
      "phone": "(11) 98765-4321",
      "address": "Rua das Flores, 123",
      "logo": "comp123/logo_abc.png",
      "currency": "BRL",
      "settings": {
        "max_report_value": 500000,
        "approval_levels": 2
      },
      "active": true,
      "created": "2026-01-10 09:00:00.000Z",
      "updated": "2026-02-05 16:00:00.000Z"
    }
  ]
}
```

#### 2.2 Criar Empresa
```http
POST /api/collections/companies/records
```

**Body (multipart/form-data):**
```json
{
  "name": "Nova Empresa LTDA",
  "cnpj": "98.765.432/0001-10",
  "email": "contato@novaempresa.com",
  "phone": "(11) 91234-5678",
  "address": "Av. Principal, 456",
  "logo": <file>,
  "currency": "BRL",
  "settings": {},
  "active": true
}
```

**Response (200 OK):**
```json
{
  "id": "comp456",
  "name": "Nova Empresa LTDA",
  ...
}
```

#### 2.3 Atualizar Empresa
```http
PATCH /api/collections/companies/records/:id
```

**Body:**
```json
{
  "name": "Nova Empresa LTDA - Filial",
  "settings": {
    "max_report_value": 1000000
  }
}
```

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
  ...
}
```

---

### 4. Aprovadores

#### 4.1 Listar Aprovadores
```http
GET /api/collections/approvers/records
```

**Query Parameters:**
- `filter`: Ex: `company='comp123' && active=true`
- `expand`: `user,delegates_to`

**Response (200 OK):**
```json
{
  "items": [
    {
      "id": "app123",
      "company": "comp123",
      "user": "user789",
      "level": 1,
      "max_amount": 500000,
      "delegates_to": null,
      "active": true,
      "expand": {
        "user": {
          "name": "João Gerente",
          "email": "joao@example.com"
        }
      }
    }
  ]
}
```

#### 4.2 Criar Aprovador
```http
POST /api/collections/approvers/records
```

**Body:**
```json
{
  "company": "comp123",
  "user": "user789",
  "level": 1,
  "max_amount": 1000000,
  "active": true
}
```

---

### 5. Relatórios de Despesas

#### 5.1 Listar Relatórios
```http
GET /api/collections/expense_reports/records
```

**Query Parameters:**
- `filter`: Ex: `user='user123' && status='submitted'`
- `expand`: `company,user,approved_by`
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
      "status": "submitted",
      "submitted_at": "2026-01-21 10:00:00.000Z",
      "approved_by": null,
      "approved_at": null,
      "rejection_reason": null,
      "created": "2026-01-15 14:00:00.000Z",
      "updated": "2026-01-21 10:00:00.000Z"
    }
  ]
}
```

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

**Body:**
```json
{
  "status": "submitted",
  "submitted_at": "2026-02-10T14:30:00Z"
}
```

#### 5.4 Aprovar Relatório
```http
PATCH /api/collections/expense_reports/records/:id
```

**Body:**
```json
{
  "status": "approved",
  "approved_by": "user789",
  "approved_at": "2026-02-11T09:00:00Z"
}
```

#### 5.5 Rejeitar Relatório
```http
PATCH /api/collections/expense_reports/records/:id
```

**Body:**
```json
{
  "status": "rejected",
  "rejection_reason": "Falta justificativa para algumas despesas",
  "approved_by": "user789",
  "approved_at": "2026-02-11T09:00:00Z"
}
```

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
        "valor_total": 8550,
        "data": "2026-01-15",
        "hora": "12:30",
        "estabelecimento": "Restaurante Sabor",
        "categoria": "food"
      },
      "ocr_confidence": 0.95,
      "ocr_processed": true,
      "notes": "",
      "created": "2026-01-15T15:00:00Z",
      "updated": "2026-01-15T15:02:00Z"
    }
  ]
}
```

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

> **Nota:** O processamento OCR é assíncrono. O campo `ocr_processed` será `true` e os dados preenchidos quando completo.

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

### 8. Logs de Auditoria

#### 8.1 Listar Logs
```http
GET /api/collections/audit_logs/records
```

**Query Parameters:**
- `filter`: `company='comp123' && action~'approve'`
- `expand`: `user`
- `sort`: `-created`

**Response (200 OK):**
```json
{
  "items": [
    {
      "id": "log123",
      "user": "user789",
      "company": "comp123",
      "action": "expense_report.approved",
      "entity_type": "expense_reports",
      "entity_id": "rep123",
      "changes": {
        "status": {
          "old": "submitted",
          "new": "approved"
        }
      },
      "ip_address": "192.168.1.1",
      "user_agent": "Mozilla/5.0...",
      "created": "2026-02-11T09:00:00Z"
    }
  ]
}
```

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

## Rate Limiting

- **Limite:** 100 requests por minuto por IP
- **Header de resposta:**
  - `X-RateLimit-Limit: 100`
  - `X-RateLimit-Remaining: 95`
  - `X-RateLimit-Reset: 1676048400`

---

## Recursos Adicionais

- [PocketBase API Reference](https://pocketbase.io/docs/api-records/)
- [PocketBase Realtime](https://pocketbase.io/docs/api-realtime/)
- [PocketBase Authentication](https://pocketbase.io/docs/authentication/)
