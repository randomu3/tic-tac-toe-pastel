#!/bin/sh
set -e

echo "Starting tuna tunnel..."
echo "Target: ${TUNA_TARGET}"
echo "Subdomain: ${TUNA_SUBDOMAIN}"

# Save token
tuna config save-token "${TUNA_TOKEN}"

# Start tunnel with fixed subdomain
exec tuna http "${TUNA_TARGET}" --subdomain="${TUNA_SUBDOMAIN}"
