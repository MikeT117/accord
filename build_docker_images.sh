#!/bin/sh

docker build -t accord_init . -f ./docker/Dockerfile_accord_init
docker build -t accord_rest_server . -f ./docker/Dockerfile_accord_rest_server
docker build -t accord_voice_server . -f ./docker/Dockerfile_accord_voice_server
docker build -t accord_websocket_server . -f ./docker/Dockerfile_accord_websocket_server
cd ./frontend/apps/react-app-v2 && bun run build && cd ../../../ && docker build -t accord_frontend . -f ./docker/Dockerfile_accord_frontend
