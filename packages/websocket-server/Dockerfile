# syntax=docker/dockerfile:1
FROM node:19-alpine as BUILDER
WORKDIR /usr/src/accord
COPY lerna.json .
COPY package*.json .
COPY packages/websocket-server ./packages/websocket-server
COPY packages/common ./packages/common
RUN npm install
RUN npm run build-dep:common
RUN npm run build:websocket-server


FROM node:19-alpine
ENV ACCESS_TOKEN_SECRET=''
ENV REFRESH_TOKEN_SECRET=''
ENV PORT=''
ENV AMQP_URL=''
ENV POSTGRES_HOST=''
ENV POSTGRES_USER=''
ENV POSTGRES_PASSWORD=''
ENV POSTGRES_DB=''
ENV POSTGRES_PORT=''
WORKDIR /usr/src/accord
COPY lerna.json .
COPY /package*.json .
COPY --from=BUILDER /usr/src/accord/packages/websocket-server/dist ./packages/websocket-server/dist
COPY --from=BUILDER /usr/src/accord/packages/websocket-server/package*.json ./packages/websocket-server
COPY --from=BUILDER /usr/src/accord/packages/common/dist ./packages/common/dist
COPY --from=BUILDER /usr/src/accord/packages/common/package*.json ./packages/common
COPY --chmod=0755 packages/websocket-server/*.sh /opt/
RUN npm install --only=production
ENTRYPOINT ["/opt/entrypoint.sh"]