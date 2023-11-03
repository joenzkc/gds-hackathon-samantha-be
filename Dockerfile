FROM --platform=linux/amd64 node:20-alpine as builder
WORKDIR /app
COPY package*.json ./
COPY . .
RUN npm run build

FROM --platform=linux/amd64 node:20-alpine as runner
WORKDIR /app
COPY --from=builder --chown=node:node /app/package*.json ./
RUN npm install --only=production
COPY --from=builder --chown=node:node /app/build ./build
# USER node
EXPOSE 3000
CMD ["npm", "run", "start"]