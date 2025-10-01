# Análise do Schema do Banco de Dados
## Sistema de Controle de Estoque - Defesa Civil

---

## 📊 Visão Geral do Schema

O schema apresentado na imagem mostra uma estrutura de banco de dados bem organizada para um sistema de controle de estoque, com **10 tabelas principais** e **5 enums** que definem os tipos de dados utilizados no sistema.

### **🎯 Características Gerais:**
- **Tema escuro** com design minimalista
- **Relacionamentos 1:N** bem definidos
- **UUIDs** como chaves primárias
- **Timestamps** para auditoria
- **Campos opcionais** claramente marcados

---

## 🔍 Análise Detalhada das Entidades

### **📋 Enums (Tipos de Dados)**

| Enum | Valores | Propósito |
|------|---------|-----------|
| `udm_tipo` | PESO, VOLUME, COMPRIMENTO, UNIDADE | Classifica unidades de medida |
| `condicao_material` | NOVO, BOM, REGULAR, RUIM, INSERVIVEL | Estados do material |
| `movimentacao_tipo` | ENTRADA, ALOCACAO, TRANSFERENCIA, DOACAO, AJUSTE, BAIXA | Tipos de movimentação |
| `movimentacao_status` | PENDENTE, APROVADO, REPROVADO, CONCLUIDO | Status das movimentações |
| `destino_tipo` | DEPARTAMENTO, MUNICIPIO, OUTRA_SECRETARIA | Tipos de destino |
| `anexo_referencia_tipo` | MATERIAL | Tipo de referência para anexos |

### **📦 Tabelas Principais**

#### **1. MATERIAL**
```sql
CREATE TABLE material (
    id UUID PRIMARY KEY,
    codigo VARCHAR(20),
    nome VARCHAR(50),
    simbolo VARCHAR(10),
    tipo udm_tipo,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

**Análise:**
- ✅ **Estrutura simples** e direta
- ✅ **Código único** para identificação
- ✅ **Tipo integrado** com enum
- ⚠️ **Falta campos** importantes como descrição, valor, tombamento

#### **2. LOTE**
```sql
CREATE TABLE lote (
    id UUID PRIMARY KEY,
    material_id UUID REFERENCES material(id),
    quantidade_base DECIMAL(18,6),
    condicao_inicial condicao_material,
    valor_unitario_compra DECIMAL(14,2),
    numero_empenho VARCHAR(50),
    numero_nota_fiscal VARCHAR(50),
    validade DATE,
    criado_por UUID REFERENCES users(id),
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

**Análise:**
- ✅ **Precisão alta** (DECIMAL 18,6) para quantidades
- ✅ **Rastreabilidade** com criado_por
- ✅ **Documentação** com empenho e NF
- ✅ **Controle de validade**

#### **3. MOVIMENTACAO**
```sql
CREATE TABLE movimentacao (
    id UUID PRIMARY KEY,
    lote_id UUID REFERENCES lote(id),
    tipo movimentacao_tipo,
    origem_destino_from UUID REFERENCES destino(id),
    origem_destino_to UUID REFERENCES destino(id),
    quantidade_base DECIMAL(18,6),
    condicao condicao_material,
    descricao TEXT,
    status movimentacao_status,
    requer_aprovacao BOOLEAN,
    aprovado_por UUID REFERENCES users(id),
    aprovado_em TIMESTAMP,
    criado_por UUID REFERENCES users(id),
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

**Análise:**
- ✅ **Sistema de aprovação** completo
- ✅ **Rastreabilidade** de origem e destino
- ✅ **Controle de status** detalhado
- ✅ **Auditoria** com timestamps

#### **4. DESTINO**
```sql
CREATE TABLE destino (
    id UUID PRIMARY KEY,
    tipo destino_tipo,
    ref_id UUID,
    nome VARCHAR(200),
    endereco TEXT,
    contato VARCHAR(100),
    telefone VARCHAR(20),
    is_active BOOLEAN,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

**Análise:**
- ✅ **Flexibilidade** com ref_id para referências externas
- ✅ **Informações de contato** completas
- ✅ **Controle de ativação**

#### **5. USERS**
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY,
    username VARCHAR(100),
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

**Análise:**
- ⚠️ **Estrutura muito simples**
- ⚠️ **Falta campos** como email, perfil, permissões
- ⚠️ **Sem integração** com sistema de autenticação

#### **6. ANEXO**
```sql
CREATE TABLE anexo (
    id UUID PRIMARY KEY,
    referencia_tipo anexo_referencia_tipo,
    referencia_id UUID,
    nome_arquivo VARCHAR(255),
    url VARCHAR(500),
    tipo_mime VARCHAR(100),
    hash VARCHAR(64),
    tamanho BIGINT,
    criado_por UUID REFERENCES users(id),
    created_at TIMESTAMP
);
```

**Análise:**
- ✅ **Polimorfismo** com referencia_tipo e referencia_id
- ✅ **Integridade** com hash SHA256
- ✅ **Metadados** completos do arquivo
- ⚠️ **Enum limitado** (só MATERIAL)

#### **7. SALDO_DESTINO**
```sql
CREATE TABLE saldo_destino (
    id UUID PRIMARY KEY,
    lote_id UUID REFERENCES lote(id),
    destino_id UUID REFERENCES destino(id),
    quantidade_base DECIMAL(18,6),
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

**Análise:**
- ✅ **Performance** otimizada para consultas
- ✅ **Consolidação** de saldos por lote/destino
- ✅ **Precisão** alta para quantidades

---

## 🔄 Relacionamentos e Fluxo de Dados

### **Fluxo Principal:**
```
MATERIAL → LOTE → MOVIMENTACAO → SALDO_DESTINO
    ↓         ↓         ↓
  ANEXO    ANEXO    ANEXO
    ↓         ↓         ↓
  USERS    USERS    USERS
```

### **Diagrama de Relacionamentos:**
```
┌─────────────────────────────────────────────────────────┐
│                    SCHEMA ATUAL                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐ │
│  │   MATERIAL  │    │    LOTE     │    │MOVIMENTACAO │ │
│  │             │    │             │    │             │ │
│  │ id (PK)     │◄───┤ material_id │◄───┤ lote_id     │ │
│  │ codigo      │    │ quantidade  │    │ tipo        │ │
│  │ nome        │    │ condicao    │    │ origem      │ │
│  │ simbolo     │    │ valor       │    │ destino     │ │
│  │ tipo        │    │ empenho     │    │ quantidade  │ │
│  └─────────────┘    │ nf          │    │ condicao    │ │
│         │           │ validade    │    │ status      │ │
│         │           │ criado_por  │    │ aprovacao   │ │
│         │           └─────────────┘    │ criado_por  │ │
│         │                   │          └─────────────┘ │
│         │                   │                   │      │
│         ▼                   ▼                   ▼      │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐ │
│  │    ANEXO    │    │    USERS    │    │   DESTINO   │ │
│  │             │    │             │    │             │ │
│  │ referencia  │    │ id (PK)     │    │ id (PK)     │ │
│  │ arquivo     │    │ username    │    │ tipo        │ │
│  │ url         │    │ timestamps  │    │ ref_id      │ │
│  │ hash        │    └─────────────┘    │ nome        │ │
│  │ criado_por  │                       │ endereco    │ │
│  └─────────────┘                       │ contato     │ │
│                                        └─────────────┘ │
│                                                         │
│  ┌─────────────┐                                        │
│  │SALDO_DESTINO│                                        │
│  │             │                                        │
│  │ lote_id     │                                        │
│  │ destino_id  │                                        │
│  │ quantidade  │                                        │
│  └─────────────┘                                        │
└─────────────────────────────────────────────────────────┘
```

### **Enums do Sistema:**
```
┌─────────────────────────────────────────────────────────┐
│                      ENUMS                              │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ udm_tipo:                    condicao_material:         │
│ • PESO                       • NOVO                     │
│ • VOLUME                     • BOM                      │
│ • COMPRIMENTO                • REGULAR                  │
│ • UNIDADE                    • RUIM                     │
│                            • INSERVIVEL                 │
│                                                         │
│ movimentacao_tipo:           movimentacao_status:       │
│ • ENTRADA                    • PENDENTE                 │
│ • ALOCACAO                   • APROVADO                 │
│ • TRANSFERENCIA              • REPROVADO                │
│ • DOACAO                     • CONCLUIDO                │
│ • AJUSTE                                                   │
│ • BAIXA                                                   │
│                                                         │
│ destino_tipo:                anexo_referencia_tipo:     │
│ • DEPARTAMENTO               • MATERIAL                 │
│ • MUNICIPIO                  (limitado)                 │
│ • OUTRA_SECRETARIA                                       │
└─────────────────────────────────────────────────────────┘
```

### **Relacionamentos Críticos:**
1. **MATERIAL ↔ LOTE** (1:N) - Um material pode ter vários lotes
2. **LOTE ↔ MOVIMENTACAO** (1:N) - Um lote pode ter várias movimentações
3. **DESTINO ↔ MOVIMENTACAO** (1:N) - Um destino pode ter várias movimentações
4. **USERS ↔ TODAS** (1:N) - Usuários rastreiam todas as operações

---

## ⚖️ Comparação com Especificação Técnica

### **📊 Matriz de Comparação:**

| Aspecto | Schema Atual | Especificação | Status |
|---------|--------------|---------------|--------|
| **Tabelas** | 7 principais | 10 principais | ⚠️ Incompleto |
| **Enums** | 5 enums | 5 enums | ✅ Completo |
| **Relacionamentos** | 1:N bem definidos | 1:N + N:N | ⚠️ Limitado |
| **Auditoria** | Timestamps básicos | Logs completos | ⚠️ Básico |
| **Performance** | SALDO_DESTINO | Índices + cache | ⚠️ Parcial |
| **Segurança** | FKs + hash | Criptografia + IAM | ⚠️ Básico |

### **🔍 Análise Detalhada por Tabela:**

#### **MATERIAL - Comparação:**
```
Schema Atual:                    Especificação:
┌─────────────────┐              ┌─────────────────────────┐
│ id (PK)         │              │ id (PK)                 │
│ codigo          │              │ nome                    │
│ nome            │              │ id_compra               │
│ simbolo         │              │ link_siged              │
│ tipo            │              │ descricao               │
│ timestamps      │              │ udm_base_id             │
└─────────────────┘              │ valor_unitario_compra   │
                                 │ possui_tombo            │
                                 │ numero_tombo            │
                                 │ tags                    │
                                 │ min_stock               │
                                 │ max_stock               │
                                 │ is_active               │
                                 │ criado_por              │
                                 │ timestamps              │
                                 └─────────────────────────┘

❌ FALTAM: 8 campos importantes
⚠️  CAMPOS: codigo vs nome (confusão)
✅  MANTÉM: id, timestamps
```

#### **LOTE - Comparação:**
```
Schema Atual:                    Especificação:
┌─────────────────┐              ┌─────────────────────────┐
│ id (PK)         │              │ id (PK)                 │
│ material_id     │              │ material_id             │
│ quantidade_base │              │ quantidade_base         │
│ condicao_inicial│              │ condicao_inicial        │
│ valor_unitario  │              │ valor_unitario_compra   │
│ numero_empenho  │              │ numero_empenho          │
│ numero_nf       │              │ numero_nota_fiscal      │
│ validade        │              │ validade                │
│ criado_por      │              │ criado_em               │
│ timestamps      │              │ timestamps              │
└─────────────────┘              └─────────────────────────┘

✅ COMPLETO: Todos os campos essenciais
✅  MANTÉM: Estrutura idêntica
✅  BOM: Rastreabilidade com criado_por
```

#### **MOVIMENTACAO - Comparação:**
```
Schema Atual:                    Especificação:
┌─────────────────┐              ┌─────────────────────────┐
│ id (PK)         │              │ id (PK)                 │
│ lote_id         │              │ lote_id                 │
│ tipo            │              │ tipo                    │
│ origem_from     │              │ origem_destino_from     │
│ origem_to       │              │ origem_destino_to       │
│ quantidade_base │              │ quantidade_base         │
│ condicao        │              │ condicao                │
│ descricao       │              │ descricao               │
│ status          │              │ status                  │
│ requer_aprovacao│              │ requer_aprovacao        │
│ aprovado_por    │              │ aprovado_por            │
│ aprovado_em     │              │ aprovado_em             │
│ criado_por      │              │ criado_por              │
│ timestamps      │              │ timestamps              │
└─────────────────┘              └─────────────────────────┘

✅ COMPLETO: Todos os campos essenciais
✅  MANTÉM: Sistema de aprovação
✅  BOM: Rastreabilidade completa
```

### **🚨 Principais Gaps Identificados:**

#### **1. Tabelas Faltantes:**
- ❌ **UDM** (Unidade de Medida)
- ❌ **CONVERSAO_UDM** (Conversões)
- ❌ **MATERIAL_CATEGORY** (Categorias)
- ❌ **AUDITORIA** (Logs detalhados)

#### **2. Campos Faltantes:**
- ❌ **MATERIAL**: 8 campos importantes
- ❌ **USERS**: Perfis e permissões
- ❌ **ANEXO**: Referências limitadas

#### **3. Funcionalidades Faltantes:**
- ❌ **Sistema de categorias** hierárquico
- ❌ **Conversões de UDM** automáticas
- ❌ **Auditoria completa** com logs
- ❌ **Controle de acesso** granular

### **✅ Pontos Positivos do Schema:**

#### **1. Estrutura Sólida**
- **UUIDs** garantem unicidade global
- **Timestamps** para auditoria completa
- **Enums** para consistência de dados
- **Relacionamentos** bem definidos

#### **2. Performance**
- **SALDO_DESTINO** para consultas rápidas
- **Índices implícitos** em FKs
- **Precisão alta** em cálculos

#### **3. Flexibilidade**
- **Polimorfismo** em anexos
- **ref_id** para integrações externas
- **Sistema de aprovação** robusto

### **⚠️ Pontos de Melhoria:**

#### **1. Tabela MATERIAL Simplificada**
```sql
-- Schema atual (limitado)
material (id, codigo, nome, simbolo, tipo, timestamps)

-- Especificação (completa)
material (
    id, nome, id_compra, link_siged, descricao, 
    udm_base_id, valor_unitario_compra, possui_tombo, 
    numero_tombo, tags, min_stock, max_stock, is_active
)
```

#### **2. Falta Categorização**
- **Sem MATERIAL_CATEGORY** no schema
- **Sem hierarquia** de categorias
- **Sem organização** por tipo

#### **3. UDM Limitada**
- **Sem tabela UDM** separada
- **Sem conversões** entre unidades
- **Tipo integrado** no material

#### **4. USERS Incompleta**
- **Sem perfis** de usuário
- **Sem permissões** granulares
- **Sem integração** com IAM

#### **5. Anexos Limitados**
- **Enum restrito** (só MATERIAL)
- **Sem referência** para LOTE, MOVIMENTACAO

---

## 🚀 Recomendações de Melhoria

### **1. Expandir Tabela MATERIAL**
```sql
ALTER TABLE material ADD COLUMN id_compra VARCHAR(100);
ALTER TABLE material ADD COLUMN link_siged TEXT;
ALTER TABLE material ADD COLUMN descricao TEXT;
ALTER TABLE material ADD COLUMN valor_unitario_compra DECIMAL(14,2);
ALTER TABLE material ADD COLUMN possui_tombo BOOLEAN DEFAULT false;
ALTER TABLE material ADD COLUMN numero_tombo VARCHAR(50);
ALTER TABLE material ADD COLUMN tags TEXT[];
ALTER TABLE material ADD COLUMN min_stock DECIMAL(18,6);
ALTER TABLE material ADD COLUMN max_stock DECIMAL(18,6);
ALTER TABLE material ADD COLUMN is_active BOOLEAN DEFAULT true;
```

### **2. Adicionar Tabela UDM**
```sql
CREATE TABLE udm (
    id UUID PRIMARY KEY,
    codigo VARCHAR(20) UNIQUE,
    nome VARCHAR(50),
    simbolo VARCHAR(10),
    tipo udm_tipo,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

-- Adicionar FK no material
ALTER TABLE material ADD COLUMN udm_base_id UUID REFERENCES udm(id);
```

### **3. Adicionar Tabela de Conversões**
```sql
CREATE TABLE conversao_udm (
    id UUID PRIMARY KEY,
    material_id UUID REFERENCES material(id),
    udm_origem_id UUID REFERENCES udm(id),
    udm_destino_id UUID REFERENCES udm(id),
    fator DECIMAL(18,6),
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### **4. Expandir Tabela USERS**
```sql
ALTER TABLE users ADD COLUMN email VARCHAR(255);
ALTER TABLE users ADD COLUMN nome_completo VARCHAR(200);
ALTER TABLE users ADD COLUMN perfil VARCHAR(50);
ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT true;
ALTER TABLE users ADD COLUMN last_login TIMESTAMP;
```

### **5. Expandir Enum de Anexos**
```sql
-- Adicionar valores ao enum
ALTER TYPE anexo_referencia_tipo ADD VALUE 'LOTE';
ALTER TYPE anexo_referencia_tipo ADD VALUE 'MOVIMENTACAO';
ALTER TYPE anexo_referencia_tipo ADD VALUE 'DESTINO';
```

### **6. Adicionar Tabela de Categorias**
```sql
CREATE TABLE material_category (
    id UUID PRIMARY KEY,
    name VARCHAR(100),
    parent_id UUID REFERENCES material_category(id),
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

-- Adicionar FK no material
ALTER TABLE material ADD COLUMN category_id UUID REFERENCES material_category(id);
```

---

## 📊 Análise de Performance

### **Pontos Fortes:**
- ✅ **SALDO_DESTINO** para consultas rápidas
- ✅ **UUIDs** para distribuição
- ✅ **Índices** em FKs
- ✅ **Precisão** em cálculos

### **Pontos de Atenção:**
- ⚠️ **Falta índices** em campos de busca
- ⚠️ **Sem particionamento** por data
- ⚠️ **Sem cache** de consultas frequentes

### **Recomendações de Índices:**
```sql
-- Índices para performance
CREATE INDEX idx_material_codigo ON material(codigo);
CREATE INDEX idx_material_nome ON material(nome);
CREATE INDEX idx_lote_material_id ON lote(material_id);
CREATE INDEX idx_movimentacao_lote_id ON movimentacao(lote_id);
CREATE INDEX idx_movimentacao_status ON movimentacao(status);
CREATE INDEX idx_movimentacao_created_at ON movimentacao(created_at);
CREATE INDEX idx_saldo_destino_lote_destino ON saldo_destino(lote_id, destino_id);
```

---

## 🔒 Análise de Segurança

### **Pontos Positivos:**
- ✅ **Rastreabilidade** completa com users
- ✅ **Auditoria** com timestamps
- ✅ **Integridade** com FKs
- ✅ **Hash** para anexos

### **Pontos de Melhoria:**
- ⚠️ **Sem criptografia** de dados sensíveis
- ⚠️ **Sem controle** de acesso granular
- ⚠️ **Sem logs** de segurança
- ⚠️ **Sem backup** automático

### **Recomendações de Segurança:**
```sql
-- Tabela de auditoria
CREATE TABLE auditoria (
    id UUID PRIMARY KEY,
    entidade VARCHAR(50),
    entidade_id UUID,
    acao VARCHAR(20),
    payload_old JSONB,
    payload_new JSONB,
    usuario UUID REFERENCES users(id),
    ip_address INET,
    user_agent TEXT,
    data_hora TIMESTAMP DEFAULT NOW()
);

-- Índices para auditoria
CREATE INDEX idx_auditoria_entidade ON auditoria(entidade, entidade_id);
CREATE INDEX idx_auditoria_usuario ON auditoria(usuario);
CREATE INDEX idx_auditoria_data_hora ON auditoria(data_hora);
```

---

## 📈 Métricas e Monitoramento

### **KPIs do Schema:**
- 📊 **Número de materiais** cadastrados
- 📊 **Volume de movimentações** por período
- 📊 **Tempo médio** de aprovação
- 📊 **Taxa de erro** em operações
- 📊 **Performance** de consultas

### **Alertas Recomendados:**
- 🚨 **Tabelas** com crescimento excessivo
- 🚨 **Consultas** lentas (>1s)
- 🚨 **Falhas** de integridade
- 🚨 **Anexos** não encontrados
- 🚨 **Usuários** inativos

---

## 🎯 Conclusão

### **Avaliação Geral: 8.5/10**

O schema apresentado é **sólido e bem estruturado**, com uma base excelente para um sistema de controle de estoque. Os pontos fortes incluem:

✅ **Estrutura robusta** com relacionamentos bem definidos  
✅ **Sistema de aprovação** completo  
✅ **Auditoria** com timestamps  
✅ **Performance** otimizada com SALDO_DESTINO  
✅ **Flexibilidade** com polimorfismo  

### **Principais Melhorias Necessárias:**

1. **Expandir MATERIAL** com campos da especificação
2. **Adicionar UDM** e conversões
3. **Implementar categorias** hierárquicas
4. **Melhorar USERS** com perfis e permissões
5. **Expandir anexos** para todas as entidades
6. **Adicionar índices** para performance
7. **Implementar auditoria** completa

### **Próximos Passos:**

1. **Revisar** especificação técnica
2. **Implementar** melhorias sugeridas
3. **Criar** scripts de migração
4. **Testar** performance
5. **Documentar** APIs
6. **Treinar** equipe

O schema está **pronto para implementação** com as melhorias sugeridas, atendendo completamente aos requisitos da Defesa Civil do Amazonas.

---

*Análise realizada em janeiro de 2025 - Sistema SISPDEC*
