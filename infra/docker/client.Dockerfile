FROM node:22-alpine AS runner

WORKDIR /app
RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/client/package.json apps/client/package.json
COPY packages/shared/package.json packages/shared/package.json
RUN pnpm install --frozen-lockfile

COPY packages/shared packages/shared
COPY apps/client apps/client

RUN pnpm --filter @zenvy/shared build
RUN pnpm --filter @zenvy/client build

EXPOSE 3000
CMD ["pnpm", "--filter", "@zenvy/client", "start"]
