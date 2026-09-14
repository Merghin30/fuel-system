# MOKA Transit Technologies Ltd
## Corporate Cybersecurity Policies

**Document Identifier:** MOKA-SEC-POL-2026  
**Last Updated:** July 20, 2026  
**Approval:** Chief Information Security Officer (CISO)  
**Classification:** RESTRICTED - ALL EMPLOYEES & ASSOCIATES  

This document outlines the formal information security policies for MOKA Transit Technologies Ltd. All employees, contractors, third-party operators, and administrative personnel must strictly adhere to these policies. Compliance is audited annually in accordance with the National Cybersecurity Authority (NCA) Essential Cybersecurity Controls (ECC-1:2018).

---

## 1. Acceptable Use Policy (AUP)

### 1.1 Objective
To define the rules for using MOKA's technology assets, network enclaves, cloud consoles, database environments, and corporate devices.

### 1.2 Policy Rules
*   **Authorized Access Only:** Employees may only access technology assets and databases for which they have been granted explicit, role-based authorization (RBAC). Attempting to bypass network controls or access unauthorized serverless container clusters is a severe violation.
*   **MFA Mandate:** Under no circumstances should an employee disable or attempt to bypass Multi-Factor Authentication (MFA) on any corporate system, email account, or cloud-native database console.
*   **No Unapproved Software:** Employees must not install unapproved software, terminal utilities, or network diagnostic tools (e.g., packet sniffers, port scanners) on corporate endpoints without the CISO's explicit written consent.
*   **Device Security Integrity:** Users are prohibited from rooting, jailbreaking, or disabling security agents (such as Wazuh EDR) on any corporate mobile device or terminal used to process fuel transactions.
*   **Phishing Reporting:** Employees must report any suspicious emails, unexpected OTP requests, or unauthorized login notifications to the Security Operations Center (SOC) within 15 minutes.

---

## 2. Data Classification & Protection Policy

### 2.1 Objective
To establish a systematic framework for classifying and protecting data processed, stored, or transmitted by MOKA's critical systems, ensuring strict alignment with the Saudi Personal Data Protection Law (PDPL) and SAMA standards.

### 2.2 Classification Framework

MOKA categorizes all information into four distinct sensitivity levels:

| Level | Classification | Description | Storage Requirements | Protection Controls |
|---|---|---|---|---|
| **L4** | **Restricted / Critical** | Critical secrets, cryptographic root keys, or high-compliance cardholder data (PAN) which would cause immediate, catastrophic damage if compromised. | Hosted inside dedicated Hardware Security Modules (HSM) or secure cloud enclaves with Zero storage of credit card numbers. | HSM-sealed keys, automatic 90-day rotation, multi-party authorization (m-of-n) to access. |
| **L3** | **Confidential / Sensitive** | Personally Identifiable Information (PII) of Saudi citizens, driver National IDs/Iqamas, fleet budget metrics, and monthly government Expro reporting documents. | Stored in dedicated database enclaves with field-level encryption. | AES-256 field-level encryption, logged read access, strict RBAC, and quarterly audits. |
| **L2** | **Internal Use** | Operational data, vehicle fueling logs, RFID windshield serial numbers, and system performance metrics. | Encrypted at-rest on secure cloud block storage. | Regular backup, network micro-segmentation, and TLS 1.3 in-transit. |
| **L1** | **Public** | Marketing materials, fuel station geographic coordinates, public API structures, and open-source documentation. | Replicated across distributed CDN nodes and public caches. | Integrity checks via CDN, protected from unauthorized modification at-source. |

---

## 3. Strong Password & Identity Policy

### 3.1 Objective
To enforce strong cryptographic authentication parameters for all users, administrators, and automated service accounts accessing MOKA systems, mitigating credential stuffing and brute-force attacks.

### 3.2 Complexity Requirements
All password-based authentications must conform to the following minimum standards:
*   **Minimum Length:** 12 characters for standard users; 16 characters for administrators and service accounts.
*   **Complexity Matrix:** Must contain at least:
    *   One uppercase letter (`A-Z`)
    *   One lowercase letter (`a-z`)
    *   One numeric digit (`0-9`)
    *   One special character (e.g., `! @ # $ % ^ & * ( ) _ + - =`)
*   **Pwned Check:** Passwords must be run against the "Have I Been Pwned" database at-creation to ensure they have not been leaked in previous third-party breaches.
*   **No Common Terms:** Must not contain dictionary words, common sequences (e.g., `123456`, `password`), or company names (e.g., `moka`, `riyadh`).

### 3.3 Lifecycle & Enforcements
*   **Expiration Period:** Standard passwords must be changed every **90 days**. Administrative passwords must expire every **60 days**.
*   **History Enforcements:** The system must prevent the reuse of any of the last **12 passwords** used by the user.
*   **Failed Logins Lockdown:** After **5 failed login attempts** inside 10 minutes, the account is locked for **30 minutes**, and an alert is dispatched to the SOC.
*   **Session Idle Timeouts:** Web sessions must automatically terminate and require re-authentication after **15 minutes** of idle time.
*   **MFA Enforcement:** MFA (via TOTP authenticator app or biometric handshake) is mandatory for ALL employees and CANNOT be bypassed.
