#!/usr/bin/env sh
DIR="$(pwd)"

export NODE_PATH="${DIR}/node_modules"

if [ ! -d "${NODE_PATH}" ] || [ $(ls "${NODE_PATH}" | wc -l) -lt 1 ]; then
  printf "Installing node modules\n"
  npm install
fi
touch .done
tail -f /dev/null
