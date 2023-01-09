#!/bin/sh
npm -C /usr/src/accord/packages/rest-api run fastify:start
exec "$@"
