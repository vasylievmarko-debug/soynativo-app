# syntax=docker/dockerfile:1.7
# Multi-stage build keeps the final image small and free of build tooling.

FROM node:20-alpine AS base
WORKDIR /app
ENV YARN_ENABLE_GLOBAL_CACHE=false
RUN corepack enable

# ---- deps: install with cache mount ----
FROM base AS deps
COPY package.json yarn.lock .yarnrc.yml ./
COPY apps/backend/package.json apps/backend/
COPY packages/shared/package.json packages/shared/
RUN --mount=type=cache,target=/root/.yarn yarn install --immutable

# ---- build ----
FROM deps AS build
COPY tsconfig.base.json ./
COPY packages/shared packages/shared
COPY apps/backend apps/backend
RUN yarn workspace @soynativo/shared build && \
    yarn workspace @soynativo/backend build

# ---- runtime ----
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
RUN apk add --no-cache tini && addgroup -S app && adduser -S app -G app
COPY --from=build --chown=app:app /app/node_modules ./node_modules
COPY --from=build --chown=app:app /app/apps/backend/dist ./apps/backend/dist
COPY --from=build --chown=app:app /app/apps/backend/package.json ./apps/backend/
COPY --from=build --chown=app:app /app/packages/shared/dist ./packages/shared/dist
COPY --from=build --chown=app:app /app/packages/shared/package.json ./packages/shared/
USER app
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -q -O - http://localhost:3000/health || exit 1
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "apps/backend/dist/server.js"]
