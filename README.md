# 🚀 Swagger Editor & Virtualization Configurator

<div align="center">

![OpenAPI](https://img.shields.io/badge/OpenAPI-3.0-6BA539?logo=openapi&logoColor=white)
![React](https://img.shields.io/badge/React-18.2-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?logo=tailwindcss&logoColor=white)

**A modern web application for editing, transforming, and previewing OpenAPI/Swagger specifications**

[✨ Features](#-features) • [📦 Installation](#-installation) • [🚀 Usage](#-usage) • [🛠️ Architecture](#️-architecture) • [🤝 Contributing](#-contributing)

</div>

---

## 📋 Project Overview

**Swagger Editor & Virtualization Configurator** is a sophisticated web-based tool designed to streamline the process of working with OpenAPI (formerly Swagger) specifications. Whether you're an API developer, architect, or DevOps engineer, this tool provides an intuitive interface for modifying API definitions and preparing them for virtualization and deployment.

### 🔍 The Need

Modern API development often requires:
- **Quick modifications** to existing OpenAPI specifications
- **Schema validation** and automated fixes
- **Real-time preview** of API documentation
- **Format conversion** between JSON and YAML
- **Virtualization-ready** output for API gateways

Traditional tools either lack the flexibility for quick edits or require complex setups. This application bridges that gap by offering a user-friendly, browser-based solution that combines editing capabilities with immediate visual feedback.

---

## ✨ Features

### 🎯 Core Capabilities

| Feature | Description | Status |
|---------|-------------|--------|
| **File Upload & Validation** | Upload JSON/YAML OpenAPI files with automatic validation | ✅ |
| **Real-time YAML Editing** | Live YAML editor with syntax highlighting | ✅ |
| **Interactive Swagger Preview** | Embedded Swagger UI for immediate visualization | ✅ |
| **Schema Corrections** | Automated fixes for common OpenAPI issues | ✅ |
| **Version Management** | Easy API version updates | ✅ |
| **Format Conversion** | Seamless JSON ↔ YAML conversion | ✅ |
| **Responsive Design** | Works on desktop, tablet, and mobile | ✅ |

### 🔧 Advanced Modifications

- **Time Object Fix**: Automatically corrects `Time.hour` and `Time.minute` properties from string to integer types
- **Version Control**: Update API version with a single click
- **Base Path Configuration**: Modify API base paths for different environments
- **Security Scheme Integration**: Add API key security to endpoints
- **Custom Extensions**: Support for OpenAPI extensions and custom metadata

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm/yarn
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Installation

```bash
# Clone the repository
git clone https://github.com/alaaomri/swagger-editor.git
cd swagger-editor

# Install dependencies
npm install
# or
yarn install

# Start the development server
npm run dev
# or
yarn dev