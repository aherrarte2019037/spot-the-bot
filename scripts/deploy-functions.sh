#!/bin/bash

set -e

FUNCTIONS=(
  "submit-votes"
  "start-game"
  "end-chat-phase"
  "calculate-results"
)

echo "🚀 Deploying ${#FUNCTIONS[@]} functions..."

for func in "${FUNCTIONS[@]}"; do
  echo "  Deploying ${func}..."
  npx supabase functions deploy "${func}"
done

echo "✅ All functions deployed"

