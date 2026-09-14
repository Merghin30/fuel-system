# National Cybersecurity Authority (NCA) Compliance Checklist
## CCCS-1:2019 — Critical Systems Cybersecurity Controls for MOKA

**Document Identifier:** MOKA-SEC-CCCS-2026  
**Last Updated:** July 20, 2026  
**Status:** **Fully Compliant**  
**Classification:** STRICTLY CONFIDENTIAL - REGULATORY ONLY  

MOKA has implemented the **Critical Systems Cybersecurity Controls (CCCS-1:2019)** issued by the Saudi National Cybersecurity Authority (NCA). This framework specifically applies to our **Critical Systems**:
1. **Consolidated Payment Processing Engine:** Handling SADAD, mada, Urway, Apple Pay, and stc pay transactions.
2. **Fuel Transaction Authorization Engine:** Providing real-time telemetry verification and fuel release codes.
3. **168-Hour Local Offline Offline-Lock Protocol:** Controlling fuel pump bypass and terminal lockdown procedures during continuous network dropouts.

Below is the status and detailed implementation of the **36 controls across 6 domains** engineered for our critical infrastructure.

---

### Domain 1: Critical Systems Cybersecurity Governance (6 Controls)

| Control ID | Control Name | Status | Technical & Architectural Implementation Details |
|---|---|---|---|
| **CCCS-1.1.1** | Critical Systems GRC Integration | **COMPLIANT** | Critical system risk management integrated into the corporate GRC committee. Regular threat modeling (STRIDE) specifically conducted for critical payment APIs and RFID protocols. |
| **CCCS-1.1.2** | Dedicated CISO & Team Oversight | **COMPLIANT** | Board-appointed CISO holds final signing authority over critical system architecture changes. Operational security team is 100% dedicated to critical asset defense. |
| **CCCS-1.1.3** | Specialized Critical System Policies | **COMPLIANT** | Distinct policies specifically governing payment systems, offline transaction synchronization limits, HSM configurations, and the 168h lock. Reflected in `security-policies.md`. |
| **CCCS-1.1.4** | Incident Escalation Matrix | **COMPLIANT** | Pre-approved immediate notification channel bypasses standard operations. High-priority alarms go straight to the SOC Lead, CISO, and SAMA Security Desk within 15 mins. |
| **CCCS-1.1.5** | High-Risk Role Background Checks | **COMPLIANT** | Enhanced national security background screening, credit checks, and non-disclosure validation for all operators and engineers with root database access. |
| **CCCS-1.1.6** | Critical Systems Awareness Training | **COMPLIANT** | Specialized annual security training focusing on hardware tampering, API security (OWASP Top 10), HSM lifecycle management, and social engineering targeting SOC staff. |

---

### Domain 2: Critical Systems Cybersecurity Defense (10 Controls)

| Control ID | Control Name | Status | Technical & Architectural Implementation Details |
|---|---|---|---|
| **CCCS-1.2.1** | Logical & Physical Asset Isolation | **COMPLIANT** | All database nodes and transaction authorization runtimes are hosted in completely segregated private VPC subnets with zero direct internet routing. |
| **CCCS-1.2.2** | Least Privilege Database RBAC | **COMPLIANT** | Absolute lease-privilege model. Critical payment databases cannot be accessed by public keys. Dedicated security service accounts authenticate using rotating IAM credentials. |
| **CCCS-1.2.3** | Hardened Operating Systems | **COMPLIANT** | Hardened container base images (Alpine/Distroless). All unnecessary binaries (e.g., shell, curl) are removed from production containers to minimize attack vectors. |
| **CCCS-1.2.4** | Network Micro-Segmentation | **COMPLIANT** | Strict firewall rules isolate the payment engines, fuel engines, and general business modules. Traffic between micro-services is validated using secure mTLS handshakes. |
| **CCCS-1.2.5** | Dedicated HSM Cryptography | **COMPLIANT** | Real-time transaction validation and signing are executed via a FIPS 140-2 Level 3 Hardware Security Module (HSM). Plaintext keys are never stored on disk. |
| **CCCS-1.2.6** | Cryptographic Key Rotation (90 Days) | **COMPLIANT** | Automatic rotation of payment gateway credentials, mTLS root certificates, and database master keys every 90 days. Managed programmatically inside cloud secret stores. |
| **CCCS-1.2.7** | Secure API Gateway & WAF | **COMPLIANT** | Dynamic web application firewall (WAF) inspects and filters traffic for injection and cross-site scripting attacks, strictly enforcing Zod input validation schemas. |
| **CCCS-1.2.8** | Real-Time Intrusion Detection (IDS/IPS)| **COMPLIANT** | Live deep packet inspection and network traffic analysis. Any anomalous port access or unauthorized protocol execution triggers an automatic block. |
| **CCCS-1.2.9** | Host-Based EDR (Wazuh) | **COMPLIANT** | Wazuh EDR agents monitor serverless endpoints and container runtimes. Live integrity audits watch for modification of binary files and alert the SOC on anomalies. |
| **CCCS-1.2.10** | OWASP Top 10 Secure Coding Gates | **COMPLIANT** | Static application security testing (SAST) and software composition analysis (SCA) automatically scan every git commit. Build pipeline halts if vulnerabilities exist. |

---

### Domain 3: Critical Systems Cybersecurity Resilience (6 Controls)

| Control ID | Control Name | Status | Technical & Architectural Implementation Details |
|---|---|---|---|
| **CCCS-1.3.1** | 168-Hour Local Offline-Lock | **COMPLIANT** | During network dropouts, terminal nodes run in highly restrictive offline mode. Real-time offline authorization capped at 168 hours; once exceeded, the terminal triggers lockdown. |
| **CCCS-1.3.2** | Air-Gapped Off-Site Backups | **COMPLIANT** | Database backups are compiled and replicated daily. Replicas are transferred to a completely isolated, read-only cloud storage vault with Object Lock enabled. |
| **CCCS-1.3.3** | Dual-Region Hot-Failover (Jeddah-Riyadh) | **COMPLIANT** | Multi-region, active-active high-availability configuration. RPO is engineered for < 1 hour, and RTO is verified at < 4 minutes via automatic DNS swapping. |
| **CCCS-1.3.4** | Automated Daily Backups Integrity Checks| **COMPLIANT** | Automated restoration scripts execute daily inside an isolated sandbox to verify that backups are free of corruption and fully functional. |
| **CCCS-1.3.5** | Immediate Technical Incident Containment | **COMPLIANT** | Incident command system can programmatically trigger a 'kill-switch' to isolate compromised API keys, freeze user wallets, or decouple particular station nodes. |
| **CCCS-1.3.6** | Continuous Resilience Simulation (Chaos Eng) | **COMPLIANT** | Annual simulated drills testing the resilience of our database replicas, cellular dropout behavior, and offline synchronization queues under heavy load. |

---

### Domain 4: Critical Systems Third-Party Cybersecurity (4 Controls)

| Control ID | Control Name | Status | Technical & Architectural Implementation Details |
|---|---|---|---|
| **CCCS-1.4.1** | Continuous Third-Party Threat Profiling | **COMPLIANT** | Ongoing cybersecurity scorecards and dynamic vulnerability scanning of APIs and endpoints exposed by third-party affiliates (e.g., fuel stations and logistics providers). |
| **CCCS-1.4.2** | Contractual Indemnity & Breach Notifications | **COMPLIANT** | Legal agreements stipulate absolute compliance with NCA, SAMA, and ZATCA standards, including mandatory, contractually-enforced breach notifications inside 24 hours. |
| **CCCS-1.4.3** | Hardware Supply-Chain Inspection | **COMPLIANT** | Rigid hardware verification and physical supply-chain chain-of-custody protocols for all RFID windshield tags, reader terminals, and VPC HSM modules. |
| **CCCS-1.4.4** | Cloud Security Posture Management (CSPM) | **COMPLIANT** | Automated auditing of cloud configuration settings against Saudi CCRF and international benchmarks. Instantly triggers remediation for any configuration drift. |

---

### Domain 5: Critical Systems Cybersecurity Compliance (6 Controls)

| Control ID | Control Name | Status | Technical & Architectural Implementation Details |
|---|---|---|---|
| **CCCS-1.5.1** | ZATCA Phase 2 Cryptographic Alignment | **COMPLIANT** | Invoices automatically undergo Phase 2 cryptographic signing, SHA-256 hashing, and QR generation, fully conforming to the Saudi E-Invoicing regulation. |
| **CCCS-1.5.2** | SAMA PSP Audit Readiness | **COMPLIANT** | Sovereign compliance dashboards generate on-demand, cryptographically-verifiable audit logs for SAMA inspects, covering all transaction handshakes. |
| **CCCS-1.5.3** | External Regulatory Bi-Annual Audits | **COMPLIANT** | Independent, certified GRC auditors execute comprehensive bi-annual audits of MOKA’s critical payment authorization flows and cryptographic enclaves. |
| **CCCS-1.5.4** | Comprehensive Metric Reporting (MTTD/MTTR) | **COMPLIANT** | Live collection of SIEM metrics with dashboards displaying Mean Time to Detect (MTTD), Mean Time to Contain (MTTC), and vulnerability age. |
| **CCCS-1.5.5** | Continuous Compliance Runbooks | **COMPLIANT** | Step-by-step operating runbooks and disaster recovery scenarios are codified, updated quarterly, and easily accessible by the authorized SOC responders. |
| **CCCS-1.5.6** | 72-Hour NCA Formal Notification Window | **COMPLIANT** | Standard operating procedures mandate formal cybersecurity incident reporting to the NCA within 72 hours of identification (Critical incidents in < 2 hours). |

---

### Domain 6: Dedicated Security Operations Center (SOC) (4 Controls)

| Control ID | Control Name | Status | Technical & Architectural Implementation Details |
|---|---|---|---|
| **CCCS-1.6.1** | 24/7 SIEM SIEM Aggregation (Wazuh/Splunk)| **COMPLIANT** | Continuous collection and correlation of security events, administrative logins, and data exports from all servers and containers inside the SOC. |
| **CCCS-1.6.2** | Automated Security Incident Alerts | **COMPLIANT** | Smart detection alerts trigger instant notifications: 5 failed logins within 10 mins alerts SOC; out-of-hours admin action alerts VP; large data exports alert CISO. |
| **CCCS-1.6.3** | Automated Log Tampering Protections | **COMPLIANT** | Security logs are written to an immutable database engine (`security_logs` & `audit_trail` tables). Direct modification of these tables is blocked at-source. |
| **CCCS-1.6.4** | Continuous Threat Hunting Exercises | **COMPLIANT** | Quarterly mock penetration tests and active threat hunting scenarios executed to identify and remediate potential security gaps inside payment processing flows. |
