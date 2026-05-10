FROM oven/bun:1.3-alpine AS base
WORKDIR /usr/src/app

FROM base AS dotenvx
RUN curl -sfS https://dotenvx.sh | sh

FROM base AS install
RUN mkdir -p /temp/dev
COPY package.json bun.lock /temp/dev
RUN cd /temp/dev && bun install --frozen-lockfile

FROM dotenvx AS prerelease
WORKDIR /usr/postbase
COPY --from=install /temp/dev/node_modules  node_modules
COPY . .
RUN  --mount=type="secret",id=DOTENV_PRIVATE_KEY_DEVELOPMENT,env=DOTENV_PRIVATE_KEY_DEVELOPMENT  bun run build-dev && \
     bun run dotenvx run --env-file=.env.development -- bun ./src/models/init-categories.mjs

EXPOSE 3000
CMD [ "bun", "run" , "dev" ]
