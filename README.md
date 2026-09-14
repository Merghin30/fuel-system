# MOKA App - Enterprise Fleet Logistics Platform

Welcome to the **MOKA App Enterprise Platform** — a production-ready, highly-scalable software solution for orchestrating fleet logistics, dynamic RFID/NFC fuel transactions, background data synchronization, and enterprise lock protection for over 100,000+ rugged devices.

---

## 🏗️ Software Architecture

This project strictly implements **Clean Architecture** boundaries separated across modular layers to support high-performance, resilient operations:

```
                  ┌─────────────────────────────────────┐
                  │           Presentation              │
                  │   (React Administration Portal &    │
                  │     Built-in Mobile Emulator)       │
                  └──────────────────┬──────────────────┘
                                     │
                  ┌──────────────────▼──────────────────┐
                  │            API Controllers          │
                  │    (Express Node.js 22 Routers)     │
                  └──────────────────┬──────────────────┘
                                     │
                  ┌──────────────────▼──────────────────┐
                  │         Enterprise Services         │
                  │   (Auth, SyncEngine, ERP Service)   │
                  └──────────────────┬──────────────────┘
                                     │
                  ┌──────────────────▼──────────────────┐
                  │         Repositories & DB           │
                  │   (Prisma/PostgreSQL Schema Core)   │
                  └─────────────────────────────────────┘
```

### Main Directories
* `backend/` & `server.ts` - Production-grade full-stack Node.js server with REST endpoints.
* `mobile/` - Android Kotlin Native code compiling offline SQLite, NFC reader routines, and background sync scheduling.
* `admin/` & `src/` - Scalable React + Tailwind CSS dashboard containing visual reports, analytics charts, settings, audit logs, and an **Interactive Mobile Device Emulator**.
* `database/` - Complete PostgreSQL Prisma schemas (`schema.prisma`) featuring indexing, soft deletes, UUID keys, and audit timestamps.
* `docker/` - Dockerfile and Compose configurations for automated container deployments.
* `docs/` - System architecture blueprints and Swagger API catalogs.

---

## 🔒 Security & Protocols

1. **Enterprise Lock Protocol (168 Hours / 7 Days Rule)**:
   * If a field PDA/Scanner does not trigger synchronization with the central MOKA server within **168 hours**, the mobile unit executes a hard lock.
   * NFC reading, transaction creations, and wallet debit capabilities are disabled.
   * The device displays a mandatory **"Synchronization Required"** screen.
   * Active operators must either trigger a successful internet-connected sync or input a central cryptographically-random bypass unlock code generated in the Admin Portal.
   
2. **NFC Verification (Dual-Factor Fueling)**:
   * Every company vehicle and authorized driver is issued a secure MOKA NFC/RFID card.
   * Transactions require scanning the card at the fuel pump terminal and entering a dynamic security PIN verified directly in the encrypted local storage, mitigating fuel siphoning theft.

3. **Saudi Arabia ZATCA Compliance**:
   * Complete calculations for the 15% VAT threshold including ZATCA Phase-2 cryptographic stamps and audit reporting capabilities.

---

## 🔄 Offline Synchronization Engine

* **SQLite Offline Database**: Fully autonomous database schema loaded on Android devices to process transactions in deep rural areas (e.g., desert highway routes) without internet.
* **Incremental Delta Updates**: Minimizes cellular bandwidth using differential schema updates. The device requests updates since its last successful sync timestamp; the server responds only with net modifications in a compressed format (Gzip).
* **Conflict Resolution**: Uses FIFO local queue serialization and server-side balance checking to prevent double-spending or wallet overdraws.
* **Retry Queue**: Failed uploads due to intermittent signal are stored in a SQLite retry heap with exponential backoff scheduling.
