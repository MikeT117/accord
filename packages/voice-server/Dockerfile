# syntax=docker/dockerfile:1
FROM node:19-alpine as BUILDER_S1
WORKDIR /usr/src/accord
COPY lerna.json .
COPY package*.json .
COPY packages/voice-server ./packages/voice-server
COPY packages/common ./packages/common
RUN apk add --no-cache --virtual \
        python \
        py-pip \
        make \
        g++ \
        linux-headers \
    && npm install
RUN npm run build-dep:common
RUN npm run build:voice-server



FROM node:19-alpine as BUILDER_S2
WORKDIR /usr/src/accord
COPY lerna.json .
COPY package*.json .

COPY --from=BUILDER_S1 /usr/src/accord/node_modules ./node_modules
COPY --from=BUILDER_S1 /usr/src/accord/packages/voice-server/dist ./packages/voice-server/dist
COPY --from=BUILDER_S1 /usr/src/accord/packages/voice-server/package*.json ./packages/voice-server
COPY --from=BUILDER_S1 /usr/src/accord/packages/common/dist ./packages/common/dist
COPY --from=BUILDER_S1 /usr/src/accord/packages/common/package*.json ./packages/common

RUN apk add --no-cache --virtual \
        python \
        py-pip \
        make \
        g++ \
        linux-headers \
    && npm install --only=production



FROM node:19-alpine
ENV ACCESS_TOKEN_SECRET=''
ENV REFRESH_TOKEN_SECRET=''

ENV PORT=''

ENV AMQP_URL=''

ENV OAUTH_GITHUB_TOKEN_VALIDATION_URI=''
ENV OAUTH_GITHUB_BASIC_AUTH=''

ENV POSTGRES_HOST=''
ENV POSTGRES_USER=''
ENV POSTGRES_PASSWORD=''
ENV POSTGRES_DB=''
ENV POSTGRES_PORT=''

WORKDIR /usr/src/accord

COPY lerna.json .
COPY package*.json .

COPY --from=BUILDER_S2 /usr/src/accord/node_modules ./node_modules
COPY --from=BUILDER_S2 /usr/src/accord/packages/voice-server/dist ./packages/voice-server/dist
COPY --from=BUILDER_S2 /usr/src/accord/packages/voice-server/package*.json ./packages/voice-server
COPY --from=BUILDER_S2 /usr/src/accord/packages/common/dist ./packages/common/dist
COPY --from=BUILDER_S2 /usr/src/accord/packages/common/package*.json ./packages/common
COPY --chmod=0755 packages/voice-server/*.sh /opt/

ENTRYPOINT ["/opt/entrypoint.sh"]