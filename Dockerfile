FROM node:16-alpine as builder

WORKDIR /app

# Установка craco глобально
RUN npm install -g @craco/craco

# Копирование конфигурационных файлов
COPY package*.json ./
COPY craco.config.js ./
COPY .eslintrc.json ./
COPY jsconfig.json ./

# Установка зависимостей
RUN npm install

# Копирование исходного кода
COPY public/ public/
COPY src/ src/
COPY server.js ./

# Сборка приложения
RUN npm run build

FROM node:16-alpine
WORKDIR /app
COPY --from=builder /app/build ./build
COPY --from=builder /app/server.js .
COPY --from=builder /app/package*.json ./
RUN npm install --production

EXPOSE 3000
CMD ["node", "server.js"]
