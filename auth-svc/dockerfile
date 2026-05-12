FROM oven/bun:canary-alpine AS base
WORKDIR /usr/src/app

FROM base AS dotenvx
RUN curl -sfS https://dotenvx.sh | sh

FROM base AS install 
RUN mkdir -p /temp/dev
COPY package.json bun.lock /temp/dev
RUN cd /temp/dev/ && bun install --frozen-lockfile

FROM dotenvx AS prerelease
WORKDIR /usr/src/app
COPY --from=install /temp/dev/node_modules node_modules
COPY . .
RUN --mount=type=secret,id=KEY_DEVELOPMENT,env=DOTENV_PRIVATE_KEY_DEVELOPMENT bun run build-dev

EXPOSE 5858
CMD [ "bun", "run", "dev" ]





