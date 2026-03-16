version: "3.9"

services:
  context-annotation-app:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: context-annotation-app
    ports:
      - "3000:3000"
    env_file:
      - .env
    restart: unless-stopped
