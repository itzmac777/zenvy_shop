FROM node:22-alpine AS runner

WORKDIR /app
RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/server/package.json apps/server/package.json
COPY packages/shared/package.json packages/shared/package.json
RUN pnpm install --frozen-lockfile

COPY packages/shared packages/shared
COPY apps/server apps/server

RUN pnpm --filter @zenvy/shared build
RUN pnpm --filter @zenvy/server build

EXPOSE 4000
CMD ["pnpm", "--filter", "@zenvy/server", "start"]
