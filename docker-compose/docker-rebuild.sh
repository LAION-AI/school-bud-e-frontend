
#!/bin/bash

cd "$(dirname "$0")"

echo "Pulling latest changes..."
docker compose pull school-bud-e-frontend

echo "Rebuilding and restarting frontend service..."
docker compose up -d --build --force-recreate school-bud-e-frontend