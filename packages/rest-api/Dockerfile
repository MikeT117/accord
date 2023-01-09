# syntax=docker/dockerfile:1
FROM node:19-alpine as BUILDER
WORKDIR /usr/src/accord
COPY lerna.json .
COPY package*.json .
COPY packages/rest-api ./packages/rest-api
COPY packages/common ./packages/common
RUN npm install
RUN npm run build-dep:common
RUN npm run build:rest-api


FROM node:19-alpine
ENV ACCESS_TOKEN_SECRET=''
ENV REFRESH_TOKEN_SECRET=''
ENV FASTIFY_ADDRESS=''
ENV FASTIFY_PORT=''
ENV PUBLIC_URL=''
ENV CORS_ORIGIN=''
ENV POSTGRES_HOST=''
ENV POSTGRES_USER=''
ENV POSTGRES_PASSWORD=''
ENV POSTGRES_DB=''
ENV POSTGRES_PORT=''
ENV OAUTH_STATE_SECRET=''
ENV OAUTH_ERROR_REDIRECT_URL=''
ENV OAUTH_GITHUB_CLIENT_ID=''
ENV OAUTH_GITHUB_REDIRECT_URI=''
ENV OAUTH_GITHUB_TOKEN_VALIDATION_URI=''
ENV OAUTH_GITHUB_CLIENT_SECRET=''
ENV OAUTH_GITHUB_BASIC_AUTH=''
ENV CLOUDINARY_API_SECRET=''
ENV CLOUDINARY_UPLOAD_PRESET=''
ENV CLOUDINARY_CLOUD_NAME=''
ENV CLOUDINARY_API_KEY=''
ENV CLOUDINARY_UPLOAD_PATH=''
WORKDIR /usr/src/accord
COPY lerna.json .
COPY /package*.json .
COPY --from=BUILDER /usr/src/accord/packages/rest-api/dist ./packages/rest-api/dist
COPY --from=BUILDER /usr/src/accord/packages/rest-api/package*.json ./packages/rest-api
COPY --from=BUILDER /usr/src/accord/packages/common/dist ./packages/common/dist
COPY --from=BUILDER /usr/src/accord/packages/common/package*.json ./packages/common
COPY --chmod=0755 packages/rest-api/*.sh /opt/
RUN npm install --only=production
ENTRYPOINT ["/opt/entrypoint.sh"]