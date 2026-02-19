FROM node:18-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src/ ./src/
COPY public/ ./public/
COPY index.ts ./

EXPOSE 3000

CMD ["npx", "ts-node", "src/server.ts"]
