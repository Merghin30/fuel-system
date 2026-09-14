# MOKA Transit Technologies Ltd
## SAMA-Compliant Business Continuity Plan (BCP) & Disaster Recovery Strategy

| Document Identifier | MOKA-SEC-BCP-2026 |
|---|---|
| **Version** | 1.0.2 |
| **Effective Date** | July 19, 2026 |
| **Classification** | STRICTLY CONFIDENTIAL - RESTRICTED REGULATORY ACCESS |
| **Approval** | Chief Executive Officer (CEO) & Chief Operations Officer (COO) |

---

## 1. Introduction & Executive Summary
As a SAMA-licensed Payment Service Provider (PSP) operating in the Kingdom of Saudi Arabia, **MOKA Transit Technologies Ltd** recognizes that B2B fleet fuel management is critical national infrastructure. A disruption in fuel processing could instantly halt corporate fleet operations, delivery services, and public transport systems.

This **Business Continuity Plan (BCP)** establishes the strategic framework, organizational roles, and recovery protocols required to:
*   Maintain continuous operations of the MOKA platform.
*   Enforce SAMA's strict disaster recovery limits: **RTO < 4 hours** (Recovery Time Objective) and **RPO < 1 hour** (Recovery Point Objective).
*   Ensure that all backup systems remain strictly within Saudi sovereign borders (Riyadh/Jeddah cloud zones) in compliance with NCA NDMO rules.

---

## 2. Business Impact Analysis (BIA)

| Business Function | Criticality | Operational Impact of Outage | SAMA RTO Target | SAMA RPO Target | Backup Mechanism |
|---|---|---|---|---|---|
| **Fleet Payment Processing** | **CRITICAL** | Driver stranded at fuel station, unable to purchase fuel, fleet stoppage. | < 4 Hours | < 1 Hour | Hot-standby active-active replica in Riyadh VPC zone B |
| **ZATCA Phase 2 Invoicing** | **HIGH** | Statutory non-compliance. Invoices cannot be stamped cryptographically. | < 12 Hours | < 4 Hours | Local buffer queue with automatic offline queuing and retro-active submission. |
| **EXPRO Spend Reporting** | **MEDIUM** | Corporate clients cannot see real-time fuel efficiency logs. | < 24 Hours | < 12 Hours | Daily off-site database replication (Encrypted S3 bucket in Riyadh region). |

---

## 3. Disruption Scenarios & Mitigation Procedures

### Scenario A: Total Outage of Primary Cloud Provider (Riyadh Zone A)
*   *Probability:* Low | *Impact:* Catastrophic
*   *Action Plan:*
    1.  **Automated Failover Routing:** The Cloudflare Global Traffic Manager (GTM) detects unhealthy endpoints in Riyadh Zone A and immediately routes 100% of driver app traffic to Riyadh Zone B.
    2.  **Sovereign DB Promotion:** The PostgreSQL Database replica in Riyadh Zone B is automatically promoted to Primary. Since the replication lag is less than 5 seconds, **RPO is met (< 10 seconds, well within the 1-hour mandate)**.
    3.  **Audit Logs Sync:** Verification systems reconcile transactions received during the failover window against the audit ledger.

### Scenario B: Primary Payment Gateway (Urway) is Unreachable
*   *Probability:* Medium | *Impact:* High
*   *Action Plan:*
    1.  **Fallback Gateway Activation:** If Urway returns 3 consecutive `5xx` errors, the system dynamically switches routing to the secondary SAMA-authorized gateway (e.g., HyperPay) using pre-configured endpoint headers.
    2.  **Token Handshake Integrity:** MOKA servers query the HyperPay vault structure to map equivalent token references for the cardholder's safety.
    3.  **Operator Notification:** An automated Alert is dispatched to MOKA NOC and the client's corporate account manager via secure channels.

### Scenario C: Core Database Corruption / Ransomware
*   *Probability:* Low | *Impact:* Critical
*   *Action Plan:*
    1.  **Isolate Database Cluster:** Terminate all database write connections immediately to prevent corruption from spreading.
    2.  **Point-In-Time Recovery (PITR):** Execute PostgreSQL PITR using the continuous WAL (Write-Ahead Logging) archiving pipeline. The system will restore database states to exactly 1 minute prior to the suspected corruption timestamp.
    3.  **Verifying RPO/RTO:** Ensure recovery finishes within 4 hours. Once restored, all EXPRO compliance entries and ZATCA invoice queues are re-processed from client-side buffers.

---

## 4. BCP Governance & Continuous Improvement

### Annual Mock-Failover Testing (Mandatory SAMA Requirement)
MOKA mandates quarterly simulated disaster recovery failover drills.
1.  **Scheduled Testing Window:** Conducted during low-traffic periods (e.g., Friday 02:00 AST).
2.  **Verification Criteria:** System must demonstrate successful failover with:
    *   No manual intervention (completely automated failover in < 5 minutes).
    *   Zero data loss (all pre-drilled database writes reconciled perfectly).
3.  **Reporting:** Post-drill metrics are compiled and submitted to SAMA's Cybersecurity Supervision Department within 15 working days.

### Crisis Management Organization

```
                  +--------------------------------+
                  |    CEO / Crisis Director       |
                  +--------------------------------+
                                  |
         +------------------------+------------------------+
         |                                                 |
+------------------------+                        +------------------------+
|  CISO / Tech Commander |                        | COO / Biz Operations  |
+------------------------+                        +------------------------+
         |                                                 |
         * System Failover Ops                             * Bank & Merchant Relations
         * Data Integrity Audits                           * Sovereign Regulatory Liaison
```
