#!/bin/bash
SCRIPT_DIR=$(pwd)
K8S_DIR="$SCRIPT_DIR/k8s"
CURRENTTIME=$(date '+%F_%H:%M:%S')

# Validación de variables de entorno
if [ -z "$DOCKER_REGISTRY" ]; then
    export DOCKER_REGISTRY=$(state_get DOCKER_REGISTRY)
    echo "DOCKER_REGISTRY set."
fi
if [ -z "$DOCKER_REGISTRY" ]; then
    echo "Error: DOCKER_REGISTRY env variable needs to be set!"
    exit 1
fi

if [ -z "$TODO_PDB_NAME" ]; then
    export TODO_PDB_NAME=$(state_get MTDR_DB_NAME)
    echo "TODO_PDB_NAME set."
fi
if [ -z "$TODO_PDB_NAME" ]; then
    echo "Error: TODO_PDB_NAME env variable needs to be set!"
    exit 1
fi

if [ -z "$OCI_REGION" ]; then
    echo "OCI_REGION not set. Will get it with state_get"
    export OCI_REGION=$(state_get REGION)
fi
if [ -z "$OCI_REGION" ]; then
    echo "Error: OCI_REGION env variable needs to be set!"
    exit 1
fi

if [ -z "$UI_USERNAME" ]; then
    echo "UI_USERNAME not set. Will get it with state_get"
    export UI_USERNAME=$(state_get UI_USERNAME)
fi
if [ -z "$UI_USERNAME" ]; then
    echo "Error: UI_USERNAME env variable needs to be set!"
    exit 1
fi

# Backend
cp $K8S_DIR/backend.yaml $K8S_DIR/backend-$CURRENTTIME.yaml

sed -i "s|%DOCKER_REGISTRY%|${DOCKER_REGISTRY}|g" $K8S_DIR/backend-$CURRENTTIME.yaml
sed -i "s|%TODO_PDB_NAME%|${TODO_PDB_NAME}|g" $K8S_DIR/backend-$CURRENTTIME.yaml
sed -i "s|%OCI_REGION%|${OCI_REGION}|g" $K8S_DIR/backend-$CURRENTTIME.yaml
sed -i "s|%UI_USERNAME%|${UI_USERNAME}|g" $K8S_DIR/backend-$CURRENTTIME.yaml

if [ -z "$1" ]; then
    kubectl apply -f $K8S_DIR/backend-$CURRENTTIME.yaml -n mtdrworkshop
else
    kubectl apply -f <(istioctl kube-inject -f $K8S_DIR/backend-$CURRENTTIME.yaml) -n mtdrworkshop
fi

# Frontend 
cp $K8S_DIR/frontend.yaml $K8S_DIR/frontend-$CURRENTTIME.yaml

sed -i "s|%DOCKER_REGISTRY%|${DOCKER_REGISTRY}|g" $K8S_DIR/frontend-$CURRENTTIME.yaml

kubectl apply -f $K8S_DIR/frontend-$CURRENTTIME.yaml -n mtdrworkshop

echo "Deploy completo."
