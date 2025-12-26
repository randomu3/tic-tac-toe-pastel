FROM alpine:latest

# Install tuna - the install script puts it in /usr/local/bin automatically
RUN apk add --no-cache curl && \
    curl -fsSL https://get.tuna.am | sh

WORKDIR /app

# Copy startup script
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
