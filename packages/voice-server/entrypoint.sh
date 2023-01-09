#!/bin/sh
npm -C /usr/src/accord/packages/voice-server run start
exec "$@"
