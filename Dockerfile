FROM node:16-alpine as builder

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:16-alpine
WORKDIR /app
COPY --from=builder /app/build ./build
COPY --from=builder /app/server.js .
COPY --from=builder /app/package*.json ./
RUN npm install --production

EXPOSE 3000
CMD ["node", "server.js"]
