#!/usr/bin/env bash
set -euo pipefail

# usage helper
USAGE="Usage: $0 [-e env]  (allowed envs: dev prod)"

# default environment
ENV="prod"

# parse options
while getopts "e:" opt; do
  case $opt in
    e) ENV="$OPTARG" ;;
    *) echo "$USAGE" >&2; exit 1 ;;
  esac
done

# allow-list of valid environments
VALID_ENVS=(dev prod)

# validation
if [[ ! " ${VALID_ENVS[*]} " =~ " ${ENV} " ]]; then
  echo "Invalid environment: '${ENV}'" >&2
  echo "$USAGE" >&2
  exit 1
fi

echo "==> Building for environment: $ENV"

# source files
CFG_SRC="configs/${ENV}-astro.config.mjs"
ENV_SRC="configs/${ENV}.env"

# sanity check files exist
for f in "$CFG_SRC" "$ENV_SRC"; do
  if [[ ! -f $f ]]; then
    echo "Error: Missing file '$f'" >&2
    exit 1
  fi
done

echo "copying configs"
cp "$CFG_SRC"   astro.config.mjs
cp "$ENV_SRC"   .env

echo "building app"
npm run build

echo "renaming .html → .aspx"
# if you only want to rename that one file:
if [[ -f dist/home/index.html ]]; then
  mv dist/home/index.html dist/home/index.aspx
fi

# or to mass-rename all .html files under dist:
# find dist -type f -name '*.html' -exec bash -c 'mv "$0" "${0%.html}.aspx"' {} \;

echo "Done."