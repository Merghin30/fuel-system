# SAMA PAYMENT SERVICE PROVIDER (PSP) LICENSE APPLICATION
## MOKA Transit Technologies Ltd

**Applicant Entity:** MOKA Transit Technologies Ltd  
**Headquarters:** King Fahd Road, Riyadh, Kingdom of Saudi Arabia  
**Target License Type:** Payment Service Provider (PSP) - Micro-Payment & Card Issuance Gateway  
**Document Code:** SAMA-PSP-APP-V1.0  
**Date of Submission:** July 19, 2026  

---

## TABLE OF CONTENTS
1. [DOCUMENT 1: COMPANY PROFILE](#document-1-company-profile)
2. [DOCUMENT 2: TECHNICAL ARCHITECTURE](#document-2-technical-architecture)
3. [DOCUMENT 3: OPERATIONAL PROCEDURES](#document-3-operational-procedures)
4. [DOCUMENT 4: RISK MANAGEMENT](#document-4-risk-management)

---

## DOCUMENT 1: COMPANY PROFILE

### 1.1 Executive Summary & Core Business Model
MOKA Transit Technologies Ltd is a Saudi-registered, specialized legal-tech B2B fleet logistics and smart fueling management platform. MOKA operates a closed-loop and open-loop cardholder tokenization system tailored specifically for enterprise corporate fleets, municipal transport vehicles, and government-subsidized shipping logistics across the Kingdom of Saudi Arabia (KSA).

MOKA solves the long-standing problem of fuel fraud, manual receipt tracking, and budget leakages in corporate fleets. Through a combination of:
*   Secure driver mobile app tokens
*   On-vehicle cryptographically linked RFID hardware rings
*   Sovereign cloud fleet-rule engines (built on Riyadh VPC nodes)
*   Real-time integration with Saudi payment networks (SADAD, Urway, and partner banks)

MOKA enables logistics companies to pre-configure and authorize corporate funds for fuel spending, executing automated compliance logs with ZATCA Phase 2 and EXPRO.

```
+-----------------------------------------------------------------+
|                         MOKA B2B MODEL                          |
+-----------------------------------------------------------------+
|  1. Enterprise Client  --> Allocates Monthly fuel limits in SAR |
|  2. Driver App / RFID  --> Instantly tokenized at fuel station  |
|  3. Urway Gateway      --> Securely processes without raw card  |
|  4. EXPRO Engine       --> Automatically reports spend logs     |
+-----------------------------------------------------------------+
```

---

### 1.2 Ownership Structure & Shareholding
MOKA Transit Technologies Ltd is structured as a closed Joint Stock Company (JSC) under the regulations of the Ministry of Commerce of the Kingdom of Saudi Arabia.

| Shareholder Name | Shareholder Type | Shareholding % | Contribution (SAR) |
|---|---|---|---|
| **MOKA International Holding Ltd** | Corporate (FDI Approved) | 60% | 1,800,000 SAR |
| **Riyadh sovereign Logistics Fund** | Institutional (Saudi National) | 25% | 750,000 SAR |
| **Founding Tech Partners & Management** | Individuals (Saudi Citizens) | 15% | 450,000 SAR |
| **TOTAL** | | **100%** | **3,000,000 SAR** |

---

### 1.3 Board of Directors & Corporate Governance
MOKA’s Board of Directors consists of five seasoned leaders with experience across fintech, cybersecurity, national logistics, and Saudi financial regulation.

1.  **H.E. Ibrahim Al-Humaid (Chairman)** - Former Senior Cybersecurity Advisor to the NCA.
2.  **Eng. Fahad Al-Qahtani (CEO & Director)** - Founder of MOKA Transit Technologies, 15+ years in logistics enterprise software.
3.  **Sarah Bin Taleb (Director of Finance)** - Representative of the Riyadh sovereign Logistics Fund; fintech investments background.
4.  **Dr. Khalid Al-Mutairi (Independent Director)** - Professor of Software Engineering and Governance Consultant.
5.  **Amjad El-Amin (CISO & Board Secretary)** - Expert in SAMA/PCI compliance, non-voting tech governance board member.

---

### 1.4 Financial Projections & Capital Adequacy
*   **Capital Adequacy Mandate:** In compliance with SAMA's PSP licensing requirements, MOKA maintains a **minimum paid-up capital of 3,000,000 SAR** fully deposited in an escrow account with our acquiring partner bank (**SAB - Saudi Awwal Bank**), which is locked for regulatory license validation.

#### 3-Year Financial Projections (SAR)

| Financial Metric | Year 1 (Projections) | Year 2 (Projections) | Year 3 (Projections) |
|---|---|---|---|
| **Fleet Clients Enrolled** | 120 Corporations | 450 Corporations | 1,200 Corporations |
| **Active Corporate Cards** | 15,000 Drivers | 65,000 Drivers | 180,000 Drivers |
| **Gross Transaction Value (GTV)**| 45,000,000 SAR | 210,000,000 SAR | 680,000,000 SAR |
| **Gross Revenue (1.5% Fee)** | 675,000 SAR | 3,150,000 SAR | 10,200,000 SAR |
| **Operating Expenses** | 1,200,000 SAR | 2,100,000 SAR | 3,800,000 SAR |
| **Net Income / Loss** | (525,000 SAR) | **+1,050,000 SAR** | **+6,400,000 SAR** |

---

## DOCUMENT 2: TECHNICAL ARCHITECTURE

### 2.1 System Architecture
MOKA utilizes a modern, serverless cloud containerized architecture hosted strictly within sovereign Saudi boundaries on the **STC Cloud Riyadh Region VPC** to guarantee complete compliance with the National Cybersecurity Authority (NCA) Essential Cybersecurity Controls (ECC-1:2018).

```
   [ Driver Mobile App ]         [ Corp Portal / Web ]
             |                             |
      ( HTTPS/TLS 1.3 )             ( HTTPS/TLS 1.3 )
             |                             |
             v                             v
     [ WAF & DDoS Shield: Cloudflare Riyadh Edge ]
             |
             v
   [ Application Load Balancer - SSL Offloading ]
             |
       +-----+-----+--------------------------------------+
       |           |                                      |
       v           v                                      v
  [ API Server ] [ Auth Engine (MFA) ]       [ SIEM / Threat Monitor ]
       |           |                                      |
       v           v                                      v
 [ Core Database (Sovereign postgres, AES-256) ] <---- [ Webhook Logs ]
       ^
       | (Token Interlock Loop)
       v
  [ PCI Level 1 Token Service Gate (Urway / HyperPay) ]
```

---

### 2.2 Payment Scoping & Tokenization Flow
To eliminate the systemic risk of credit card theft and reduce our PCI-DSS scope to the absolute minimum, **MOKA utilizes a 100% tokenized payment methodology**.

1.  **Bypass Rule:** Raw Cardholder Data (CHD) like primary account numbers (PAN), expiry dates, or CVV values **NEVER** touch, pass through, or get stored on MOKA servers.
2.  **The Token Handshake:** When a user registers a payment card in the MOKA Mobile App, the secure UI leverages a PCI-DSS Level 1 compliant **Urway iframe injection**. The card parameters are transmitted directly from the client’s browser to Urway’s secure payment tokenization vault.
3.  **Sovereign Storage:** Urway stores the actual PAN and returns a non-reversible, random hash reference ID (`tok_948291_ksa`). MOKA only stores this secure token in its sovereign database to authorize fuel purchases.

---

### 2.3 Encryption & Cybersecurity Controls
*   **Data at Rest:** All sovereign databases, audit trails, and backup volumes are encrypted using **AES-256** with customer-managed keys maintained in a dedicated Cloud Key Management Service (KMS) physically located in Riyadh.
*   **Data in Transit:** All public network communication is protected via **TLS 1.3** exclusively. Weak protocol ciphers (such as TLS 1.0, 1.1, RC4, MD5, and 3DES) are programmatically disabled on our Edge routers. HTTP Strict Transport Security (HSTS) headers are enforced across all domains.
*   **Vulnerability Assessments:** Quarterly external vulnerability scans and an annual comprehensive penetration test are executed by a certified CREST-accredited Saudi cybersecurity consultancy firm.

---

### 2.4 Disaster Recovery & Service SLA Targets
MOKA’s disaster recovery environment consists of an active-passive hot-standby configuration replicating state files in real-time across two physically isolated STC data centers within Riyadh.

*   **Recovery Point Objective (RPO):** **< 1 hour** (Database replication sync maintains a latency gap of < 10 seconds).
*   **Recovery Time Objective (RTO):** **< 4 hours** (Automated infrastructure failover script re-routes DNS resolvers within 15 minutes of primary system outage).
*   **Operational SLA:** **99.95%** system availability guarantee to corporate fleets.

---

## DOCUMENT 3: OPERATIONAL PROCEDURES

### 3.1 Customer Onboarding, KYC, and AML Checks
MOKA implements a strict, multi-tiered Know Your Customer (KYC) and Anti-Money Laundering (AML) onboarding protocol integrated with official national registries.

```
[ Corp Registration ] -> [ Wathq Registry Check ] -> [ Absher Identity Auth ] -> [ Sanction List Audit ] -> [ Approved ]
```

1.  **Corporate Client Verification:** The corporate registration is checked automatically against the Ministry of Commerce database via the **Wathq API** to verify company standing, commercial registration numbers, and active licensing status.
2.  **Beneficial Owner Identification:** Key shareholders and corporate board representatives are verified via the **Yakeen / Absher** national platform.
3.  **Sanctions Screening:** All enrolling corporate entities, management board members, and operational fleet directors are automatically screened against:
    *   The SAMA Anti-Money Laundering and Terrorism Financing Sanction List.
    *   UN and OFAC global watchlist datasets.
4.  **Risk Profiling:** Companies with high-risk shipping routes (e.g., cross-border logistics to Yemen, Iraq) are assigned an elevated risk score, requiring mandatory semi-annual manual review by our Compliance Officer.

---

### 3.2 Real-Time Transaction Monitoring & Fraud Detection
MOKA’s advanced fleet rules engine utilizes machine-learning heuristic telemetry to flag fraudulent fueling attempts instantly:

*   **Fuel Capacity Check:** Prevents fuel authorization if the requested fuel volume (liters) exceeds the physical gas tank volume of the registered vehicle profile stored on our database.
*   **Odometer Audit:** Driver must submit a verified dashboard odometer photo. If the kilometer delta between refueling is physically impossible (e.g., driving 10,000 km in 2 hours), the transaction is immediately blocked.
*   **Velocity Checks:** Limits refueling to a maximum of **2 times per day** per vehicle.
*   **Geo-Location Interlocking:** If the transaction coordinates registered on the station POS do not match the real-time mobile GPS coordinates of the driver’s MOKA app, the transaction token is immediately invalidated.

---

### 3.3 Complaint SLA Handling Procedures
Corporate clients can submit regulatory complaints through our dedicated dashboard portal, live chat, or via email.

```
  +------------------+         +----------------------+         +----------------------+
  | 1. Registration  | ------> | 2. Immediate Triage  | ------> | 3. Investigation     |
  | Ticket created & |         | Ticket categorized   |         | Fleet audits & POS   |
  | ID assigned.     |         | Level 1 or Level 2   |         | reports cross-ref'd. |
  +------------------+         +----------------------+         +----------------------+
                                                                            |
  +------------------+         +----------------------+                     |
  | 5. SLA Resolution| <------ | 4. Formal Resolution | <-------------------+
  | SLA met & client |         | Resolution signed    |
  | signs closure.   |         | and client informed. |
  +------------------+         +----------------------+
```

*   **Level 1 Complaints (Critical - Wallet / Double Billing issues):**
    *   *First Response SLA:* **< 2 hours**.
    *   *Resolution SLA:* **< 24 hours**.
*   **Level 2 Complaints (Standard - UI Issues / Card dispatch delays):**
    *   *First Response SLA:* **< 12 hours**.
    *   *Resolution SLA:* **< 72 hours**.
*   **Escalation Path:** Unresolved Level 1 issues after 24 hours are automatically escalated directly to the VP of Operations. All SAMA escalated regulatory tickets are logged in SAMA’s unified electronic complaints system.

---

### 3.4 Chargeback Handling & Dispute Resolution
If an enterprise client disputes a transaction (e.g., claiming fuel was never pumped despite an authorized token log):

1.  **Temporary Hold:** MOKA places the contested fund value in a temporary escrow hold.
2.  **Evidence Request (Within 48h):** MOKA programmatically requests digital records from the specific gas station operator, including POS pump receipts, cryptographic fuel dispenser signatures, and station CCTV footage matching the vehicle's license plate.
3.  **Arbitration Review:** MOKA’s specialized card dispute board reviews telemetry evidence. If the odometer telemetry and geographical mobile app interlocking matches perfectly, the dispute is resolved in favor of the fuel merchant. Otherwise, funds are immediately credited back to the corporate wallet.

---

## DOCUMENT 4: RISK MANAGEMENT

### 4.1 Operational Risk Assessment
MOKA’s primary operational hazard is fuel pump station offline scenarios (e.g., local network coverage drop). To manage this risk:
*   **Offline Token Queuing:** The MOKA Driver App includes an encrypted offline token caching mechanism allowing drivers to execute a single low-value fuel transaction (< 100 SAR) in the event of complete local internet loss. The token is stored locally and synchronized to the main ledger as soon as network signal is restored.

---

### 4.2 Cyber Risk Matrix (Likelihood × Impact)
MOKA manages cybersecurity risk through a quantitative Risk Register updated monthly.

| Risk ID | Risk Description | Likelihood (1-5) | Impact (1-5) | Risk Score (1-25) | Mitigation Control |
|---|---|---|---|---|---|
| **R-1** | Cardholder Token Intercept (Man-in-the-Middle) | 2 (Low) | 5 (High) | **10** | Mandatory TLS 1.3, pinning SSL certificates on the Driver App. |
| **R-2** | SQL Injection against corporate billing endpoints | 1 (Rare) | 5 (High) | **5** | Prepared statements, strict Prisma schema type constraints, quarterly SAST/DAST. |
| **R-3** | Internal Staff Database Privilege Abuse | 2 (Low) | 4 (Medium) | **8** | Implement absolute least privilege RBAC; database access requires dynamic temporary tokens via Vault. |
| **R-4** | WAF Denial of Service (DDoS) on Fleet API | 3 (Med) | 4 (Medium) | **12** | Cloudflare Enterprise Advanced DDoS mitigation with Riyadh-localized traffic scrubs. |

*Risk Rating System:* `1-5 = Low Risk` | `6-12 = Moderate Risk` | `15-25 = High Risk (Requires Board Remediation Plan)`.

---

### 4.3 Business Continuity & Incident Response Plans
MOKA’s strategic operations are bound by two comprehensive, formalized continuity guidelines which are fully deployed across our operational groups:
1.  **MOKA Incident Response Plan (IRP):** Outlines containment actions, forensic collection steps, and SAMA regulatory notifications to be completed within 2 hours of a security breach. (See full plan in `/Incident-Response-Plan.md`).
2.  **MOKA Business Continuity Plan (BCP):** Standardizes cross-site failover routines, database replication checks, and off-site backup schedules to guarantee that business-critical transactions recover in less than 4 hours. (See full plan in `/Business-Continuity-Plan.md`).
