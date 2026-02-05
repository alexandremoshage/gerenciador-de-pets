# Gerenciador de Pets

Aplicação web em Angular para gerenciamento de **Pets** e **Tutores**, com autenticação e integração com uma API REST.

## O que foi feito neste projeto

- Tela de **login** e fluxo de autenticação (token + refresh).
- CRUD de **Pets** (listar, criar, editar, remover) e suporte a **upload de foto**.
- CRUD de **Tutores** (listar, criar, editar, remover) e suporte a **upload de foto**.
- **Vínculo/Desvínculo** de Pets em Tutores.
- Componentes utilitários (ex.: paginação, loading, sidebar) e validações/máscaras.

## Tecnologias utilizadas

- **Angular 21** (standalone) + **TypeScript**
- **RxJS**
- **SCSS**
- **Tailwind CSS**
- **ngx-mask** (máscaras)
- Testes com `ng test` (specs em `*.spec.ts`)
- **Docker** (multi-stage) + **Docker Compose**
- **Nginx** para servir o build de produção

## Pré-requisitos

Para rodar fora do Docker:

- **Node.js 20+**
- **npm** (o projeto usa `npm`)

Para rodar com Docker:

- **Docker Desktop** (Windows/macOS/Linux)

## Configuração da API

Por padrão, o front consome a API configurada em:

- `src/app/environments/environment.ts` → `apiUrl`

Se você tiver uma API local, troque o `apiUrl` para o seu endereço.

## Como rodar fora do Docker (Node + Angular CLI)

Instalar dependências:

```bash
npm ci
```

Subir o servidor de desenvolvimento:

```bash
npm start
```

Acesso no navegador:

- `http://localhost:4200/`

Build de produção (gera o `dist/`):

```bash
npm run build
```

## Como rodar os testes unitários

O projeto separa testes unitários e de integração por nome de arquivo:

- Unitários: `src/**/*.spec.ts`
- Integração: `src/**/*.integration.spec.ts`

Para rodar **somente os unitários**:

```bash
npm test
```

## Como rodar os testes de integração

Os testes de integração ficam em `src/**/*.integration.spec.ts` e fazem chamadas reais para a API (ex.: login, criação/edição/vínculo).

Rodar:

```bash
npm run test:integration
```

Observações importantes:

- A API precisa estar **acessível** conforme o `apiUrl` do `environment.ts`.

## Como rodar a aplicação pelo Docker

### Produção (Nginx) via Docker Compose

Subir e fazer build:

```bash
docker compose up --build
```

Acesso no navegador:

- `http://localhost:8080/`

### Desenvolvimento (Angular dev server) via Docker Compose

Subir com o profile `dev`:

```bash
docker compose --profile dev up --build
```

Acesso no navegador:

- `http://localhost:4200/`

### Se o pull do Docker Hub falhar na sua rede

Algumas redes bloqueiam o host de download de camadas do Docker Hub (Cloudflare R2), causando erros durante `docker build` / `docker pull`.

Workaround: usar as imagens oficiais espelhadas no **AWS ECR Public**.

PowerShell (Compose):

```powershell
$env:NODE_IMAGE  = 'public.ecr.aws/docker/library/node'
$env:NGINX_IMAGE = 'public.ecr.aws/docker/library/nginx'
docker compose up --build
```

Ou no `docker build`:

```bash
docker build -t gerenciador-de-pets:prod \
	--build-arg APP_NAME=gerenciador-de-pets \
	--build-arg NODE_IMAGE=public.ecr.aws/docker/library/node \
	--build-arg NGINX_IMAGE=public.ecr.aws/docker/library/nginx \
	.
```
