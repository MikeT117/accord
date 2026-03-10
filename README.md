# Accord

A full-stack Discord-inspired chat application featuring real-time messaging, voice channels, guild management, and friend relationships. Built with a Go backend and a React frontend.

## Overview
The backend runs as three independently deployable services that share a PostgreSQL database and communicate via NATS for real-time event fan-out:

### REST Server
This handles all CRUD operations, OAuth, and attachment signing

### WebSocket Server
This manages persistent client connections and pushes real-time events

### Voice Server
This handles WebRTC signalling and peer connection management for voice channels

## Features
- **Guilds**: Create and manage servers with named text and voice channels organised into categories
- **Real-time messaging**: Live message delivery, editing, deletion, and pinning over WebSocket using Protocol Buffers
- **Voice channels**: WebRTC-powered audio with self-mute and per-user mute controls
- **Direct messages**: Private one-to-one and group channels (group channels > 2 are not implemented in the client)
- **Relationships**: Friend requests, friend list, and blocked users
- **Role-based permissions**: Bitfield permission system with per-role, per-channel and per-guild access control
- **Guild discovery**: Browse and join public guilds
- **Guild invite system**: Non-public guilds can be joined via an invite
- **OAuth authentication**: Sign in with GitHub or GitLab
- **Attachment uploads**: Image attachments via Cloudinary with inline gallery viewer
- **Drag and drop**: Reorder channels within the guild sidebar


## Tech Stack

### Backend
The backend is written in Go, using the Echo HTTP framework, Gorrilla Websocket, Pion WebRTC, PGX (Postgres), Goose for SQL migrations, NATS as the message broker, protobuf for serialisation and Cloudinary for attachment storage.

### Frontend
The frontend is written in JS (Typescript) using the React framework, TanStack Router, TanStack Query, Zustand, TailwindCSS/ShadCN/UI and React-Hook-Form.

## Architecture

### Event flow
The REST server publishes events to NATS after state-changing operations. The WebSocket server subscribes to these events and fans them out to the relevant connected clients, filtered by user ID or role ID. This decouples write operations from push delivery and allows the servers to scale independently.

### Permissions
Both the backend and frontend use a bitfield permission system. Each guild role stores an integer where each bit represents a permission. The backend uses `bit_or` in SQL to aggregate a user's effective permissions across all their roles in a single query. The frontend mirrors this with bitwise checks for UI rendering.

### Real-time protocol
All WebSocket messages are serialised with Protocol Buffers. The `.proto` definitions live in `backend/internal/infra/pb/` and are mirrored in `frontend/apps/react-app-v2/src/lib/protobuf/`. The frontend uses a generated JS bundle; the backend uses generated Go bindings.

### Frontend state split
- **Zustand** holds real-time entity state: guilds, channels, roles, voice states, relationships, these are inititialised on connection with subsequent updates pushed over websocket applied.
- **TanStack Query** handles paginated server data: message history, guild members, invites, bans, basically anything that is not sent on initial connection is fetched as needed with staleTime: Infinity`, WebSocket events applied as cache mutations e.g. message edits, pins etc.

## Getting Started

### Prerequisites

* Go 1.26+
* Bun
* Can use provided scripts to set these up automatically using docker but they are both required
    - PostgreSQL 15+
    - [NATS Server](https://docs.nats.io/running-a-nats-service/introduction/installation)
- A GitHub or GitLab OAuth application

#### For file attachment functionality 
- A cloudinary account

### 1. Configure environment

Copy the example env file and fill in all values:

```bash
cp backend/.env_local.example backend/.env.local
```

Copy the example frontend env file and fill in all values:

```bash
cp frontend/apps/react-app-v2/.env_development.example frontend/apps/react-app-v2/.env_development.local
```

### 1a (optional). Configure Docker environment

This is only necessary if you don't want to set up NATs, PostgreSQL and manually run the DB migrations.

```bash
cp docker/.env.dev.example docker/.env.local.dev
```

Fill out the necessary values matching the values passed to the environment for the backend services in step 1 and the run the following:

```bash
sh build_docker_images_dev.sh
```

```bash
sh compose_up_dev.sh
```

### 2. Run database migrations (**Not required if you followed step 1a**)

```bash
cd backend
go run ./cmd/init
```

### 3. Start the backend services

Each service is a standalone binary. Run them in separate terminals:

```bash
# REST API
go run ./cmd/rest_server

# WebSocket server
go run ./cmd/websocket_server

# Voice server
go run ./cmd/voice_server
```

### 4. Start the frontend

```bash
cd frontend/apps/react-app-v2
bun install
bun run dev
```

The app will be available at `http://SERVER_IP:3000`.

## Quick Start via Docker-Compose
If you just want to get up and running you may use the included scripts and docker compose files to get up and running quickly.

### 1. Configure Environment

Copy the example frontend env file and fill in all values:

```bash
cp docker/.env.example docker/.env
```

### 2. Build Docker Images

```bash
sh build_docker_images_prod.sh
```

### 3. Start

```bash
sh compose_prod_up.sh
```

### 4. Shutdown

```bash
sh compose_prod_down.sh
```