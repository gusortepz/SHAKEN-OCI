# 📦 SHAKEN-OCI — Installation & Maintenance Guide

This guide explains how to install, run, deploy, and maintain **SHAKEN-OCI**, both locally and on Oracle Cloud Infrastructure (OCI).


## 1. Prerequisites

Before starting, ensure you have the following installed:

- **Java 11+**
- **Maven 3.8+**
- **Node.js & npm (v18+)**
- **Docker & Docker Compose**
- **kubectl** (configured for OKE cluster)
- **OCI CLI** (properly authenticated)

Also, before running locally, make sure to configure your [application.properties](./backend/src/main/resources/application.properties):

```
spring.datasource.url=<your local or cloud DB URL>
spring.datasource.username=<your DB username>
spring.datasource.password=<your DB password>

spring.profiles.active=development # Locally

telegram.bot.token=<your Telegram bot token>
telegram.bot.name=<your Telegram bot name>
```
---

## 2. Local Development Setup

### Backend (Spring Boot)

```bash
cd MtdrSpring/backend
mvn spring-boot:run
```

### Frontend (React + Vite)

```bash
cd MtdrSpring/backend/src/main/frontend
npm install
npm run dev
```

### Local Database

You may connect to:

- **Oracle XE Docker image** (recommended for local DB tests)
- Or an **ATP instance** (ensure your `application.properties` or `OracleConfiguration.java` points to the correct DB)

---

## 3. Build & Test Locally

Build and run Docker images manually (no build.sh needed for local only):


```bash
docker build -f backend/Dockerfile -t todolistapp:local ./backend
docker run -p 8080:8080 todolistapp:local
```


---

## 4. Terraform & Infrastructure Setup (OCI)

Before deploying the app, provision your infrastructure with Terraform modules in `MtdrSpring/terraform/`. For a clear step-by-step, follow this official tutorial:

👉 [LiveLabs Workshop - Deploy Java Spring Boot on OKE](https://apexapps.oracle.com/pls/apex/r/dbpm/livelabs/run-workshop?p210_wid=3701&p210_wec=&session=1183742264263)

Typical flow:

```bash
cd MtdrSpring
bash setup.sh   # Provisions OCI infrastructure
bash destroy.sh # Destroys all resources (use with caution)
```

---

## 5. Deploy on OCI

Once the infrastructure is ready:

```bash
cd MtdrSpring/backend
bash build.sh   # Builds and pushes images
bash deploy.sh  # Deploys to OKE using deployment.yaml
bash undeploy.sh # Undeploys from OKE
```

Ensure your `deployment.yaml` points to the correct image tags pushed by `build.sh`.

---

## 6. Useful Tips & Troubleshooting

- Verify OKE pods:

  ```bash
  kubectl get pods
  ```

- Inspect pod logs:

  ```bash
  kubectl logs <pod-name>
  ```

- Inspect running services:

  ```bash
  services
  ```

- Clean local Docker cache if disk is full:

  ```bash
  docker system prune -a -f
  ```

---