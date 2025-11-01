#!/bin/bash

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SOURCE_FILE="${PROJECT_ROOT}/src/types/database.types.ts"
TARGET_DIR="${PROJECT_ROOT}/supabase/functions/_shared"
TARGET_FILE="${TARGET_DIR}/database.types.ts"

mkdir -p "$(dirname "${SOURCE_FILE}")"
mkdir -p "${TARGET_DIR}"

npx supabase gen types typescript > "${SOURCE_FILE}"
cat "${SOURCE_FILE}" > "${TARGET_FILE}"

echo "✅ Types generated and synced"
