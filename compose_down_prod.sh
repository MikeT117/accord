#!/bin/sh

cd ./docker
docker compose -f ./docker-compose-prod.yml --env-file .env down
