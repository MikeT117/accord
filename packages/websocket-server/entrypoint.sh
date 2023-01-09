#!/bin/sh
npm -C /usr/src/accord/packages/websocket-server run start
exec "$@"
