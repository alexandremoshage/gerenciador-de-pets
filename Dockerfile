# syntax=docker/dockerfile:1

ARG NODE_IMAGE=node
ARG NGINX_IMAGE=nginx

ARG NODE_VERSION=20
ARG NGINX_VERSION=1.27
ARG APP_NAME=gerenciador-de-pets

FROM ${NODE_IMAGE}:${NODE_VERSION}-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci


FROM ${NODE_IMAGE}:${NODE_VERSION}-alpine AS build
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG APP_NAME
ENV NODE_ENV=production

RUN npm run build -- --configuration production


FROM ${NODE_IMAGE}:${NODE_VERSION}-alpine AS dev
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

EXPOSE 4200

  
CMD ["npm","run","start","--","--host","0.0.0.0","--port","4200"]


FROM ${NGINX_IMAGE}:${NGINX_VERSION}-alpine AS prod

ARG APP_NAME

COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/${APP_NAME}/browser /usr/share/nginx/html

EXPOSE 80
