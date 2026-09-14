# MOKA App Enterprise Platform - OpenAPI Swagger Spec
> **Version:** 1.0.0-Beta  
> **Base URL:** `/api`  
> **Contact:** enterprise-api@moka-logistics.com

This document describes the complete REST API specification for MOKA App Enterprise Fleet Logistics. All endpoints are fully implemented on the custom Node.js/Express full-stack backend server.

---

## 1. Authentication APIs (`/auth`)

### `POST /auth/login`
Authenticates administrative users and fleet operators.
* **Request Body:**
  ```json
  {
    "email": "admin@moka.com",
    "password": "adminpassword"
  }
  ```
* **Response (200 OK):**
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.user-user-super-admin",
    "user": {
      "id": "user-super-admin",
      "name": "Eng. Ahmed Al-Mansoori",
      "email": "admin@moka.com",
      "role": "SUPER_ADMIN",
      "companyId": null,
      "isActive": true
    }
  }
  ```

### `POST /auth/refresh`
Refreshes session credentials.
* **Request Body:** `{ "token": "JWT_TOKEN" }`
* **Response (200 OK):** `{ "token": "NEW_JWT_TOKEN", "expiresAt": "2026-07-09T01:08:17Z" }`

### `POST /auth/logout`
Terminates active sessions and logs audits.
* **Request Body:** `{ "userId": "user-id" }`
* **Response (200 OK):** `{ "success": true, "message": "Logged out successfully" }`

---

## 2. Synchronization Engine APIs (`/sync`)

### `POST /sync/upload`
Uploads batched, locally-encrypted offline transactions stored in SQLite queues.
* **Request Body:**
  ```json
  {
    "deviceUuid": "MOKA-HW-MOB-1001",
    "transactions": [
      {
        "uuid": "tx-uuid-random-882",
        "vehicleId": "veh-moka-01",
        "driverId": "drv-moka-01",
        "stationId": "st-oasis-1",
        "pumpId": "pump-o1",
        "fuelProductId": "prod-diesel",
        "liters": 150,
        "pricePerLiter": 1.15,
        "amount": 172.50,
        "transactionDate": "2026-07-08T18:30:00Z"
      }
    ]
  }
  ```
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "syncId": "f7812041-3312a",
    "uploadedCount": 1,
    "rejectedCount": 0,
    "isLocked": false,
    "serverTime": "2026-07-09T00:08:17Z"
  }
  ```

### `GET /sync/download`
Downloads dynamic delta master data (companies, drivers, vehicles, NFC-pins, stations, products, settings) supporting Gzip-compression.
* **Query Params:** `deviceUuid=MOKA-HW-MOB-1001&lastSyncTimestamp=2026-07-08T00:00:00Z`
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "delta": {
      "companies": [...],
      "vehicles": [...],
      "drivers": [...],
      "nfcCards": [...],
      "stations": [...],
      "products": [...],
      "settings": {...}
    },
    "compressionRatio": "1:4.2 (Gzip Enabled)",
    "deltaTimestamp": "2026-07-09T00:08:17Z"
  }
  ```

### `POST /sync/heartbeat`
Verifies live device metrics and runs the **168-Hour Enterprise Lock Protocol check**.
* **Request Body:**
  ```json
  {
    "deviceUuid": "MOKA-HW-MOB-OFFLINE",
    "batteryLevel": 88,
    "signalStrength": 4,
    "offlineDurationHours": 172
  }
  ```
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "isLocked": true,
    "unlockCode": "772183",
    "syncPeriodLimit": 168,
    "serverTime": "2026-07-09T00:08:17Z"
  }
  ```

### `POST /sync/unlock`
Generates a cryptographic bypass unlock code to release a locked device remotely from the Administration Portal.
* **Request Body:** `{ "deviceUuid": "MOKA-HW-MOB-OFFLINE", "userId": "user-super-admin" }`
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Device 'Remote Highway Patrol Unit #9' unlocked successfully.",
    "device": { ... }
  }
  ```

---

## 3. ERP Integration REST APIs (`/erp`)

### `GET /erp/employees` & `POST /erp/employees/sync`
Verifies local MOKA drivers against external ERP employee databases (e.g., SAP, Oracle, Microsoft Dynamics).

### `GET /erp/vehicles` & `POST /erp/vehicles/sync`
Binds and synchronizes local Fleet Vehicles to ERP Fixed Asset logs.

### `POST /erp/journal`
Directly posts completed fueling transactions as synchronized General Ledger Journal entries.
* **Request Body:** `{ "transactionId": "tx-1" }`
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "journalEntryId": "SAP-JE-882049",
    "debitAccount": "5020-004 (Fuel & Fleet Expense)",
    "creditAccount": "1010-001 (Petty Cash/Fleet Bank Wallet)",
    "amount": 253.00,
    "currency": "SAR"
  }
  ```

### `GET /erp/vat`
Returns real-time 15% Saudi Arabia VAT compilations and cryptographic hashes certified compliant under the Zakat, Tax and Customs Authority (ZATCA) Phase-2 regulations.
* **Response (200 OK):**
  ```json
  {
    "taxAuthority": "Zakat, Tax and Customs Authority (ZATCA)",
    "reportingPeriod": "Q3 2026",
    "vatRate": "15%",
    "grossAmountSAR": 587.85,
    "netAmountSAR": 511.17,
    "vatAmountSAR": 76.68,
    "isZatcaComplaint": true,
    "cryptographicStamp": "F9B03C9E2734A99221CFF991B"
  }
  ```
