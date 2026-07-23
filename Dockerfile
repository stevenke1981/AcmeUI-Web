FROM node:20.19-alpine AS build
WORKDIR /app
RUN corepack enable
COPY . .
RUN pnpm install --frozen-lockfile=false && pnpm --filter @acmeui/gallery build

FROM nginx:1.27-alpine
COPY --from=build /app/apps/gallery/dist /usr/share/nginx/html
EXPOSE 80
