# SHAKEN-OCI

**SHAKEN-OCI** is a cloud-native task management application designed to help development teams manage tasks efficiently and transparently. It leverages the power of cloud infrastructure, a modern web interface, and an intuitive Telegram chat bot to provide a smooth daily workflow for teams and individual developers alike.

---

## Repository Structure

```plaintext
.
├── CONTRIBUTING.md           # Guidelines for contributing to this project
├── LICENSE.txt               # Licensing information
├── MtdrSpring/               # Main project source: backend and frontend folders
├── README.md                 # This file
├── SECURITY.md               # Security policy and best practices
├── THIRD_PARTY_LICENSES.txt  # Third-party dependencies
├── arch_diagram.md           # High-level architecture diagram and explanation
├── build_spec.yaml           # OCI DevOps build pipeline configuration
```

---

## Technologies Used

- **Frontend:** React + Vite
- **Backend:** Java Spring Boot
- **Bot:** Telegram Bot API connected directly to the backend
- **Database:** Oracle Autonomous Database (ATP)
- **Containerization:** Docker multi-stage builds (frontend and backend split)
- **Orchestration:** Kubernetes (OKE)
- **CI/CD:** OCI DevOps Pipelines, Container Registry, Terraform IaC

---

## Main Features

- Create, list, update, and delete to-do items.
- Secure REST endpoints with JWT authentication.
- Manage tasks directly through an integrated Telegram bot.
- Fully containerized architecture deployed on Oracle Cloud Infrastructure.

---

## Quick Overview of Deployment

1. **Local Development**  
   - Run backend with `mvn spring-boot:run` on directory `MtdrSpring/backend` or via Docker.
   - Run frontend with `npm run dev` under `MtdrSpring/backend/src/main/frontend`

2. **Container Build & Push**  
   - Build backend and frontend images with dedicated Dockerfiles.
   - Push images to OCI Container Registry.
   - Use `build_spec.yaml` for CI/CD automation.

3. **Production Deployment**  
   - Deploy containers to OKE.
   - Use Terraform modules to provision API Gateway, Database, Object Storage, and secure networking configurations.

---

## Related Docs

- [Architecture Diagram](./arch_diagram.md)
- [Installation and Maintenance Guide](./MtdrSpring/INSTALLATION.md)
- [Contributing Guidelines](./CONTRIBUTING.md)
- [Security Policy](./SECURITY.md)

---

## Authors & License

Released under the terms of the [LICENSE](./LICENSE.txt).
