#!/bin/bash

echo "Deleting backend deployment and service..."
kubectl -n mtdrworkshop delete deployment backend-deployment
kubectl -n mtdrworkshop delete service backend-service

echo "Deleting frontend deployment and service..."
kubectl -n mtdrworkshop delete deployment frontend-deployment
kubectl -n mtdrworkshop delete service frontend-service
