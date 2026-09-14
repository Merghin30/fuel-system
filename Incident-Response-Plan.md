# MOKA Transit Technologies Ltd
## Incident Response Plan (IRP)
### Aligning with NCA ECC-1:2018, NCA CCCS-1:2019 & SAMA GRC Guidelines

**Document Identifier:** MOKA-SEC-IRP-2026  
**Last Updated:** July 20, 2026  
**Status:** **APPROVED & DEPLOYED**  
**Classification:** STRICTLY CONFIDENTIAL - RESTRICTED REGULATORY ACCESS  

---

## 1. Plan Overview & Objective

This document defines the structured incident response workflow for **MOKA Transit Technologies Ltd** for managing cybersecurity incidents in our payment processing and fuel transaction authorization engines (Critical Systems). It complies fully with the **National Cybersecurity Authority (NCA) Essential Cybersecurity Controls (ECC-1:2018)** and **Critical Systems Cybersecurity Controls (CCCS-1:2019)** frameworks, as well as the **Saudi Central Bank (SAMA)** guidelines.

The objectives of this plan are:
1.  **Rapid Isolation & Containment:** Contain security breaches within minutes of identification.
2.  **Sovereign Data Protection:** Guard Saudi citizen PII, driver National IDs/Iqamas, and financial ledgers from exfiltration.
3.  **Regulatory Compliance:** Satisfy the mandatory notification SLA to the NCA and SAMA within statutory timeframes.
4.  **Continuous Operational Integrity:** Maintain the 168-hour local offline bypass operations while isolating compromised nodes.

---

## 2. Incident Response Team (IRT) & RACI Structure

The following core personnel compose the MOKA Incident Response Team (IRT) and are mobilized immediately upon declaring an active L1/L2 incident.

| Role | Core Responsibilities | Incident Channel Contact |
|---|---|---|
| **Incident Commander (CISO)** | Overall management, declaring status, SAMA & NCA official notifications. | ciso-alert@moka.com.sa |
| **Technical Incident Lead (VP of Eng)** | System isolation, network container redirection, VPC firewall rules. | vp-eng@moka.com.sa |
| **Lead Security Analyst (SOC Lead)** | Threat hunt analysis, log forensic integrity, Wazuh alert verification. | soc-operations@moka.com.sa |
| **Legal Counsel** | Regulatory alignment, liability assessment, third-party vendor review. | legal@moka.com.sa |
| **Public Relations Mgr** | External merchant notices, media releases (requires CISO/CEO approval). | pr@moka.com.sa |

### GRC RACI Matrix
*   **Identify Security Event:** Accountable (SOC Lead), Responsible (Security Analysts), Consulted (VP of Eng), Informed (CISO).
*   **Declare Security Incident:** Accountable (CISO), Responsible (CISO), Consulted (SOC Lead, VP of Eng), Informed (CEO, Board).
*   **Sovereign System Containment:** Accountable (VP of Eng), Responsible (Infrastructure Team), Consulted (SOC Lead), Informed (CISO).
*   **Regulator Notification (<2h / <72h):** Accountable (CISO), Responsible (CISO), Consulted (Legal Counsel), Informed (CEO).
*   **Post-Mortem & Lessons Learned:** Accountable (CISO), Responsible (CISO & VP of Eng), Consulted (IRT Team), Informed (Board).

---

## 3. Incident Lifecycle Phases

```
  +--------------------+       +--------------------+       +--------------------+
  | 1. Detect & Class  | ----> | 2. Immediate Contain | ----> | 3. Complete Eradicate|
  |  (Within 15 Mins)  |       | (Isolation & Blocks)|       | (Clean Image Build)|
  +--------------------+       +--------------------+       +--------------------+
                                                                       |
  +--------------------+       +--------------------+                  |
  | 5. Post-Mortem Log | <---- | 4. Gradual Recovery| <----------------+
  | (NCA Report < 72h) |       | (mTLS Verifications) |
  +--------------------+       +--------------------+
```

### Phase 1: Detection, Identification & Classification
All potential alerts triggered from our Wazuh/Splunk SIEM integration or physical terminal sensors must undergo primary analysis within **15 minutes**.

#### Severity Classification
*   **L1 - CRITICAL (Critical System Compromise)**
    *   *Trigger:* Root-level database intrusion, active credit/wallet draining fraud loops, compromised HSM cryptographic keys, malware inside the fuel authorization microservice, or mass data exfiltration of customer records.
    *   *SAMA/NCA SLA:* Immediate notification **within 2 hours** of discovery.
*   **L2 - HIGH (Sovereign Infrastructure Under Attack)**
    *   *Trigger:* Bypassing WAF rules, active brute-force attacks against administrative consoles (5+ failed logins in 10 mins), or missing critical security patches older than 30 days.
    *   *SAMA/NCA SLA:* Notification **within 12 hours** of discovery.
*   **L3 - MEDIUM / LOW (Standard Operational Anomalies)**
    *   *Trigger:* Individual operator email phishing attempt, single offline station failing to sync after 168 hours, or minor network latency glitches.
    *   *SAMA/NCA SLA:* Weekly aggregated compliance report.

---

### Phase 2: Containment & Isolation
Containment actions must prevent lateral threat progression without destroying forensic evidence (complying with CCCS-1.3.5).

#### Immediate Technical Containment Actions:
1.  **De-authorize Threat API Keys:** Instantly invalidate any compromised API keys, rotating Sadad, mada, or Urway gateways.
2.  **Activate Container Sandbox Isolator:** Terminate routing to compromised Cloud Run instances, creating a live forensic memory capture, and spin up pristine standby enclaves.
3.  **Engage 168-Hour Local Offline-Lock:** If connectivity is suspect, force vulnerable station terminals into a local offline sandbox, preventing any unauthorized remote state modifications.
4.  **Network-Level IP Blacklist:** Inject an automated firewall deny-rule blocking the attacker's source IP detected by the rate limiter or SQLi detection systems.

---

### Phase 3: Eradication & Remediation
Permanently remove vulnerabilities and threats from the production ecosystem.

1.  **Pristine Deployment Rebuild:** Deploy container instances built entirely from certified base golden images via secure CI/CD pipelines.
2.  **Credential Purge & Enforced Rotation:** Reset all database, console, and operator passwords, forcing absolute credential re-verification.
3.  **Hotfix Deployment:** If the breach leveraged an application-level vulnerability (e.g., input validation issue), deploy a Zod-verified patch and compile the applet with zero errors.

---

### Phase 4: Recovery & Verification
Restoring the ecosystem back to production under close inspection.

1.  **Vulnerability & Security Scans:** Run deep vulnerability checks on newly spun-up containers before exposing them to the Riyadh public load balancer.
2.  **Traffic Ramp-up:** Gradually route live traffic to the restored instances (e.g., 10% -> 50% -> 100%) while inspecting CPU load and security logs.
3.  **Ledger Reconciliation:** Cross-examine database transactions with local audit logs and external bank gateway records to verify absolute ledger integrity.

---

### Phase 5: Post-Incident Review & Lessons Learned
Continuous improvements following resolution of an incident (complying with ECC-5-5 & ECC-5-6).

1.  **NCA/SAMA Final Report Submission:** Submit the official regulatory incident report within **72 hours** of resolution, signed by the CISO.
2.  **Audit Log Hardening:** Move all session logs, Wazuh alerts, and containment records to our immutable `security_logs` database table.
3.  **Policy Retrofitting:** Review incident root causes and modify corresponding software parameters and policies inside `security-policies.md` to prevent recurrence.
