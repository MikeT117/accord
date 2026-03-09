#!/bin/sh

cd ./docker
docker compose -f ./docker-compose.yml --env-file .env down
