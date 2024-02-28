#!/bin/sh

cd ./docker
docker compose -f ./docker-compose-prod.yaml --env-file .env up -d