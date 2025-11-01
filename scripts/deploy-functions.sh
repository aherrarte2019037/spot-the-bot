#!/bin/bash

set -e

PROJECT_ID="${SUPABASE_PROJECT_ID:-zbpowpvpzsugrdqwurub}"

echo "🚀 Deploying all functions..."

npx supabase functions deploy --project-ref "${PROJECT_ID}"

echo "✅ All functions deployed"

