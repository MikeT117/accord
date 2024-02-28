#!/bin/sh

docker build -t accord_rest_api . -f ./docker/Dockerfile_rest_server
docker build -t accord_voice_server . -f ./docker/Dockerfile_voice_server
docker build -t accord_websocket_api . -f ./docker/Dockerfile_websocket_server
docker build -t accord_postgres . -f ./docker/Dockerfile_postgres
cd ./frontend/apps/react-app && npm run build && cd ../../../ && docker build -t accord_react_frontend . -f ./docker/Dockerfile_react_frontend
