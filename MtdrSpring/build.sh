#!/bin/bash

export BACKEND_IMAGE_NAME=todolistapp-springboot
export FRONTEND_IMAGE_NAME=todolistapp-springboot
export BACKEND_IMAGE_VERSION=backend-0.1
export FRONTEND_IMAGE_VERSION=frontend-0.1

if [ -z "$DOCKER_REGISTRY" ]; then
    export DOCKER_REGISTRY=$(state_get DOCKER_REGISTRY)
    echo "DOCKER_REGISTRY set."
fi
if [ -z "$DOCKER_REGISTRY" ]; then
    echo "Error: DOCKER_REGISTRY env variable needs to be set!"
    exit 1
fi

export BACKEND_IMAGE=${DOCKER_REGISTRY}/${BACKEND_IMAGE_NAME}:${BACKEND_IMAGE_VERSION}
export FRONTEND_IMAGE=${DOCKER_REGISTRY}/${FRONTEND_IMAGE_NAME}:${FRONTEND_IMAGE_VERSION}

docker build -f backend/Dockerfile -t $BACKEND_IMAGE ./backend
docker push $BACKEND_IMAGE
if [ $? -eq 0 ]; then
    docker rmi "$BACKEND_IMAGE"
fi

docker build -f frontend/Dockerfile -t $FRONTEND_IMAGE ./frontend
docker push $FRONTEND_IMAGE
if [ $? -eq 0 ]; then
    docker rmi "$FRONTEND_IMAGE"
fi