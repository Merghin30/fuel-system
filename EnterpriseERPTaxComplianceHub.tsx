import React, { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  Layers, RefreshCw, Database, FileText, CheckCircle2, AlertTriangle,
  ArrowUpDown, Download, Copy, ExternalLink, ShieldCheck, Check,
  ChevronRight, Building2, Terminal, Filter, Plus, Edit2, Play,
  Send, Lock, Server, FileCode, CheckCircle, AlertCircle, HelpCircle,
  Eye, RefreshCcw, Shield, Clock, Hash, Globe, Coins, BadgeCheck
} from "lucide-react";
import {
  ERPConnectorConfig, SyncLogEntry, COAMappingItem, ZATCAInvoiceData,
  SudanTaxForm15Data, GCCTaxReturnSummary, ERPSystemId
} from "./types";
import {
  generateZATCAPhase2TLVBase64, inspectTLVBase64, generateZATCAUBL21XML
} from "./zatcaUtils";
import {
  initialSudanForm15, initialGCCSummaries, generateAuditCSV, downloadFile
} from "./taxComplianceUtils";

interface Props {
  lang?: "ar" | "en";
  currentUser?: { name: string; id: string; role?: string; email?: string };
  onNavigate?: (menu: string) => void;
}

export const EnterpriseERPTaxComplianceHub: React.FC<Props> = ({
  lang = "en",
  currentUser,
  onNavigate
}) => {
  const [activeTab, setActiveTab] = useState<
    "erp_connectors" | "coa_mapping" | "sync_logs" | "zatca_phase2" | "sudan_tax" | "gcc_compliance"
  >("erp_connectors");

  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  // --- ERP Connectors State ---
  const [connectors, setConnectors] = useState<ERPConnectorConfig[]>([
    {
      id: "sap_s4hana",
      name: "SAP S/4HANA Enterprise",
      vendor: "SAP SE",
      version: "Cloud 2408 / On-Premise 2023",
      protocol: "OData v4 / Service Layer",
      status: "CONNECTED",
      lastSyncTime: "2 mins ago",
      syncInterval: "Real-time Webhook + 5m Batch",
      endpointUrl: "https://s4hana.moka-logistics.corp/sap/opu/odata4/sap/api_journalentry",
      authMethod: "mTLS + Token",
      inboundEnabled: true,
      outboundEnabled: true,
      totalSynced24h: 1840,
      errorCount24h: 0,
      credentials: {
        tenantId: "S4H-PROD-100",
        clientId: "moka_fleet_odata_client",
        authSecret: "••••••••••••••••••••••••••••",
        companyDb: "MOKA_KSA_SA01"
      }
    },
    {
      id: "netsuite",
      name: "Oracle NetSuite ERP",
      vendor: "Oracle Corporation",
      version: "2026 Release 1",
      protocol: "SuiteTalk REST Web Services & SuiteScript",
      status: "CONNECTED",
      lastSyncTime: "4 mins ago",
      syncInterval: "Real-time Event Hook",
      endpointUrl: "https://1289410.restlets.api.netsuite.com/app/site/hosting/restlet.nl",
      authMethod: "OAuth 2.0",
      inboundEnabled: true,
      outboundEnabled: true,
      totalSynced24h: 1290,
      errorCount24h: 1,
      credentials: {
        tenantId: "1289410_SB1",
        clientId: "ns_consumer_key_prod",
        authSecret: "••••••••••••••••••••••••••••",
        companyDb: "Subsidiary 4: MOKA GCC"
      }
    },
    {
      id: "odoo",
      name: "Odoo ERP Enterprise",
      vendor: "Odoo S.A.",
      version: "v17.4 Enterprise & Community",
      protocol: "XML-RPC / JSON-RPC External API",
      status: "CONNECTED",
      lastSyncTime: "8 mins ago",
      syncInterval: "10m Polling + Webhooks",
      endpointUrl: "https://moka-erp.odoo.com/jsonrpc",
      authMethod: "API Key / Token",
      inboundEnabled: true,
      outboundEnabled: true,
      totalSynced24h: 640,
      errorCount24h: 0,
      credentials: {
        tenantId: "moka_fleet_db_prod",
        clientId: "api_service_account@moka.sa",
        authSecret: "••••••••••••••••••••••••••••",
        companyDb: "MOKA Sudan & Regional"
      }
    },
    {
      id: "quickbooks",
      name: "QuickBooks Online",
      vendor: "Intuit Inc.",
      version: "v3 REST API",
      protocol: "Intuit OAuth 2.0 REST API",
      status: "CONNECTED",
      lastSyncTime: "12 mins ago",
      syncInterval: "Hourly Batch Journal",
      endpointUrl: "https://quickbooks.api.intuit.com/v3/company/46208163652",
      authMethod: "OAuth 2.0",
      inboundEnabled: true,
      outboundEnabled: true,
      totalSynced24h: 350,
      errorCount24h: 0,
      credentials: {
        tenantId: "46208163652",
        clientId: "ABk7...Q91Z",
        authSecret: "••••••••••••••••••••••••••••",
        companyDb: "MOKA Express SME Fleet"
      }
    }
  ]);

  const [selectedConnector, setSelectedConnector] = useState<ERPConnectorConfig>(connectors[0]);
  const [isSyncingAll, setIsSyncingAll] = useState(false);

  const handleTriggerSync = (id?: ERPSystemId) => {
    setIsSyncingAll(true);
    setTimeout(() => {
      setIsSyncingAll(false);
      setConnectors(prev =>
        prev.map(c => (!id || c.id === id ? { ...c, lastSyncTime: "Just now", status: "CONNECTED" } : c))
      );
      showNotification(
        lang === "ar"
          ? "تمت مزامنة البيانات ثنائية الاتجاه بنجاح مع أنظمة ERP!"
          : "Bidirectional sync completed successfully across ERP connectors!"
      );
    }, 1200);
  };

  // --- Chart of Accounts (COA) Mapping State ---
  const [coaMappings, setCoaMappings] = useState<COAMappingItem[]>([
    {
      id: "coa-1",
      mokaCategory: "Fleet Diesel Fuel Direct",
      mokaAccountName: "Operational Fuel - Diesel (Station & Bulk)",
      mokaAccountType: "EXPENSE",
      erpCode: "510200",
      erpAccountName: "Direct Operating Fuel & Lube Expense",
      targetSystem: "ALL",
      costCenter: "CC-LOGISTICS-CENTRAL",
      taxCode: "VAT_STD_15",
      syncMode: "REALTIME_EVENT",
      notes: "CAN-Bus verified dispensing with pump OCR match",
      isActive: true
    },
    {
      id: "coa-2",
      mokaCategory: "Fleet Gasoline 91 / 95",
      mokaAccountName: "Operational Fuel - Light Commercial Vehicles",
      mokaAccountType: "EXPENSE",
      erpCode: "510210",
      erpAccountName: "Gasoline Fuel Direct Fleet Expense",
      targetSystem: "ALL",
      costCenter: "CC-DISTRIBUTION-URBAN",
      taxCode: "VAT_STD_15",
      syncMode: "REALTIME_EVENT",
      notes: "Linked to driver digital fuel tags & NFC cards",
      isActive: true
    },
    {
      id: "coa-3",
      mokaCategory: "Highway Toll & Road Fees",
      mokaAccountName: "Salik, Mawaqif & Regional Highway Tolls",
      mokaAccountType: "EXPENSE",
      erpCode: "520100",
      erpAccountName: "Transportation Road Tolls & Customs Transit Fees",
      targetSystem: "ALL",
      costCenter: "CC-CORRIDOR-LONGHAUL",
      taxCode: "VAT_EXEMPT_0",
      syncMode: "EOD_BATCH_JOURNAL",
      notes: "Automated telemetry geofence clearing settlement",
      isActive: true
    },
    {
      id: "coa-4",
      mokaCategory: "Driver Fuel Advance & Petty Cash",
      mokaAccountName: "Driver Operational Wallet Advance",
      mokaAccountType: "ASSET",
      erpCode: "110450",
      erpAccountName: "Prepaid Driver Fuel Advances & Imprest Cash",
      targetSystem: "ALL",
      costCenter: "CC-FLEET-HR-DISPATCH",
      taxCode: "OUT_OF_SCOPE",
      syncMode: "REALTIME_EVENT",
      notes: "Auto-reconciled against verified OCR refueling receipts",
      isActive: true
    },
    {
      id: "coa-5",
      mokaCategory: "Preventative Fleet Maintenance",
      mokaAccountName: "Oils, Filters & Engine Preventive Care",
      mokaAccountType: "EXPENSE",
      erpCode: "530400",
      erpAccountName: "Fleet Maintenance & Repair Vendor Invoices",
      targetSystem: "ALL",
      costCenter: "CC-WORKSHOP-MAINTENANCE",
      taxCode: "VAT_STD_15",
      syncMode: "REALTIME_EVENT",
      notes: "AP Vendor Bill generation in SAP / NetSuite",
      isActive: true
    },
    {
      id: "coa-6",
      mokaCategory: "Siphoning & Loss Recovery",
      mokaAccountName: "Fuel Anomaly & Investigation Suspense",
      mokaAccountType: "SUSPENSE",
      erpCode: "990100",
      erpAccountName: "Fleet Operating Loss & Siphoning Suspense",
      targetSystem: "ALL",
      costCenter: "CC-SECURITY-RISK",
      taxCode: "OUT_OF_SCOPE",
      syncMode: "REALTIME_EVENT",
      notes: "Flagged by AI Siphoning Shield pending supervisor audit",
      isActive: true
    },
    {
      id: "coa-7",
      mokaCategory: "Input VAT Recoverable",
      mokaAccountName: "VAT Paid on Fuel & Fleet Purchases",
      mokaAccountType: "ASSET",
      erpCode: "120300",
      erpAccountName: "VAT Input Tax Recoverable (ZATCA / Sudan)",
      targetSystem: "ALL",
      costCenter: "CC-TAX-FINANCE",
      taxCode: "VAT_INPUT_DEDUCT",
      syncMode: "REALTIME_EVENT",
      notes: "Auto-matched to ZATCA cryptographic QR tokens",
      isActive: true
    },
    {
      id: "coa-8",
      mokaCategory: "PetroCard Clearing Account",
      mokaAccountName: "Fuel Station Provider Clearing Account",
      mokaAccountType: "LIABILITY",
      erpCode: "210400",
      erpAccountName: "Accounts Payable - Aramco / Shell Fleet Clearing",
      targetSystem: "ALL",
      costCenter: "CC-TREASURY-SETTLEMENT",
      taxCode: "OUT_OF_SCOPE",
      syncMode: "REALTIME_EVENT",
      notes: "Reconciled with automated electronic statements",
      isActive: true
    }
  ]);

  const [coaSearch, setCoaSearch] = useState("");
  const [selectedCoaFilter, setSelectedCoaFilter] = useState<string>("ALL");
  const [editingCoa, setEditingCoa] = useState<COAMappingItem | null>(null);

  // --- Live Sync Logs State ---
  const [syncLogs, setSyncLogs] = useState<SyncLogEntry[]>([
    {
      id: "log-101",
      timestamp: "2026-09-02 23:42:15",
      system: "sap_s4hana",
      systemName: "SAP S/4HANA",
      direction: "OUTBOUND",
      eventType: "JOURNAL_ENTRY_POSTED",
      entityId: "JE-2026-SA-08912",
      referenceDoc: "MOKA-REFUEL-BATCH-9941",
      recordsCount: 42,
      amount: 54180.50,
      currency: "SAR",
      status: "SUCCESS",
      httpCode: 201,
      latencyMs: 142,
      payloadPreview: {
        companyCode: "SA01",
        fiscalYear: "2026",
        documentType: "SA",
        postingDate: "2026-09-02",
        currency: "SAR",
        items: [
          { account: "510200", debit: 47113.48, costCenter: "CC-LOGISTICS-CENTRAL" },
          { account: "120300", debit: 7067.02, taxCode: "V1" },
          { account: "210400", credit: 54180.50, text: "MOKA fleet diesel automated settlement" }
        ]
      }
    },
    {
      id: "log-102",
      timestamp: "2026-09-02 23:38:09",
      system: "netsuite",
      systemName: "Oracle NetSuite",
      direction: "OUTBOUND",
      eventType: "VENDOR_BILL_CREATED",
      entityId: "VB-NS-104928",
      referenceDoc: "INV-ARAMCO-2026-901",
      recordsCount: 1,
      amount: 19450.00,
      currency: "SAR",
      status: "SUCCESS",
      httpCode: 200,
      latencyMs: 188,
      payloadPreview: {
        entity: { id: "VENDOR_ARAMCO_KSA" },
        tranDate: "2026-09-02",
        subsidiary: { id: "4" },
        expense: [
          { account: { id: "510200" }, amount: 16913.04, taxCode: { id: "KSA_VAT_15" } }
        ]
      }
    },
    {
      id: "log-103",
      timestamp: "2026-09-02 23:31:40",
      system: "odoo",
      systemName: "Odoo Enterprise",
      direction: "INBOUND",
      eventType: "ANALYTIC_ACCOUNTS_PULL",
      entityId: "ODOO-ANALYTIC-SYNC",
      referenceDoc: "SYNC-SCHEDULE-DAILY",
      recordsCount: 18,
      amount: 0,
      currency: "SDG",
      status: "SUCCESS",
      httpCode: 200,
      latencyMs: 95,
      payloadPreview: {
        model: "account.analytic.account",
        pulledCount: 18,
        costCentersUpdated: ["CC-KHARTOUM-CORRIDOR-01", "CC-PORT-SUDAN-DEPOT"]
      }
    },
    {
      id: "log-104",
      timestamp: "2026-09-02 23:25:12",
      system: "quickbooks",
      systemName: "QuickBooks Online",
      direction: "OUTBOUND",
      eventType: "EXPENSE_RECEIPT_SYNC",
      entityId: "QBO-PURCHASE-8491",
      referenceDoc: "MOKA-DRIVER-ADVANCE-331",
      recordsCount: 5,
      amount: 3820.00,
      currency: "SAR",
      status: "SUCCESS",
      httpCode: 200,
      latencyMs: 164,
      payloadPreview: {
        PaymentType: "Cash",
        AccountRef: { value: "110450", name: "Driver Petty Cash" },
        Line: [{ DetailType: "AccountBasedExpenseLineDetail", Amount: 3820.00 }]
      }
    },
    {
      id: "log-105",
      timestamp: "2026-09-02 23:18:50",
      system: "sap_s4hana",
      systemName: "SAP S/4HANA",
      direction: "INBOUND",
      eventType: "PURCHASE_ORDER_PULL",
      entityId: "PO-4500091823",
      referenceDoc: "SAP-MM-PO-SYNC",
      recordsCount: 1,
      amount: 120000.00,
      currency: "SAR",
      status: "SUCCESS",
      httpCode: 200,
      latencyMs: 130,
      payloadPreview: {
        PurchaseOrder: "4500091823",
        Vendor: "SAUDI_ARAMCO_RETAIL",
        ItemNumber: "00010",
        Material: "DIESEL_EURO5_BULK"
      }
    }
  ]);

  const [inspectedLog, setInspectedLog] = useState<SyncLogEntry | null>(null);

  // --- ZATCA Phase 2 E-Invoicing Generator State ---
  const [zatcaInvoice, setZatcaInvoice] = useState<ZATCAInvoiceData>({
    invoiceNumber: "INV-2026-MOKA-09028",
    uuid: "9f82ab73-7e49-47bb-a902-8a9d18f5201a",
    issueDate: "2026-09-02",
    issueTime: "23:45:00",
    invoiceType: "B2B_STANDARD",
    previousInvoiceHash: "NWZkODlhMjM4MWRhNmYxYTkzOGFjYTYxOWY1ZTZlZDJkOTliNzA1Yg==",
    invoiceCounterValue: 14892,
    seller: {
      name: "MOKA Fleet Logistics & Fuel Solutions Co.",
      vatNumber: "310294857200003",
      crNumber: "1010892341",
      buildingNo: "3492",
      street: "King Fahd Road",
      district: "Al-Olaya",
      city: "Riyadh",
      postalCode: "12214",
      countryCode: "SA"
    },
    buyer: {
      name: "Al-Marai Logistics Distribution Services",
      vatNumber: "300192837400003",
      crNumber: "1010048291",
      buildingNo: "8821",
      street: "Eastern Ring Road",
      district: "Al-Rimal",
      city: "Riyadh",
      postalCode: "13256",
      countryCode: "SA"
    },
    lineItems: [
      {
        id: "1",
        description: "Commercial Fleet Diesel Euro 5 - Highway Dispensing (CAN-Bus Verified)",
        unitPrice: 1.1500,
        quantity: 14200,
        unitCode: "LTR",
        discount: 0,
        netAmount: 16330.00,
        vatRate: 15.00,
        vatAmount: 2449.50,
        subtotal: 18779.50
      },
      {
        id: "2",
        description: "Exhaust Fluid DEF AdBlue - Fleet Bulk Tank Filling",
        unitPrice: 2.8000,
        quantity: 800,
        unitCode: "LTR",
        discount: 0,
        netAmount: 2240.00,
        vatRate: 15.00,
        vatAmount: 336.00,
        subtotal: 2576.00
      },
      {
        id: "3",
        description: "Digital Toll Gateway & Telepass Automated Fleet Clearance",
        unitPrice: 45.0000,
        quantity: 24,
        unitCode: "H87",
        discount: 0,
        netAmount: 1080.00,
        vatRate: 15.00,
        vatAmount: 162.00,
        subtotal: 1242.00
      }
    ],
    subtotalExclVat: 19650.00,
    totalVatAmount: 2947.50,
    grandTotalInclVat: 22597.50,
    currency: "SAR",
    ecdsaSignature: "MEUCIQD8v8t9K5W2H6m8q7R1t5Y4u3I2o1p0a9s8d7f6g5h4j3AIgK9L8m7n6b5v4c3x2z1a0s9d8f7g6h5j4k3l2m1n0b9=",
    ecdsaPublicKey: "MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE4K2s9d8f7g6h5j4k3l2m1n0b9v8c7x6z5a4s3d2f1g0h9j8k7l6m5n4b3v2c1x0z=",
    xmlHash: "aGlzaXNhdmFsaWR6YXRjYXBoYXNlMnNoYTI1NmdlbmVyYXRlZA=="
  });

  const [zatcaMode, setZatcaMode] = useState<"visual" | "xml" | "tlv">("visual");
  const [isZatcaValidating, setIsZatcaValidating] = useState(false);
  const [zatcaValidationResult, setZatcaValidationResult] = useState<{
    status: "CLEARED" | "REPORTED" | "WARNING" | null;
    message: string;
    clearanceToken?: string;
  }>({
    status: "CLEARED",
    message: "ZATCA FATOORA API: Validation passed. Status: CLEARED. Cryptographic Stamp verified with ZATCA Production CSID.",
    clearanceToken: "CSID-KSA-ZATCA-2026-991823-CLEARED"
  });

  // Calculate live TLV Base64 and XML
  const tlvBase64 = generateZATCAPhase2TLVBase64(zatcaInvoice);
  const tlvInspection = inspectTLVBase64(tlvBase64);
  const generatedUBLXML = generateZATCAUBL21XML(zatcaInvoice);

  const handleSimulateZatcaClearance = () => {
    setIsZatcaValidating(true);
    setTimeout(() => {
      setIsZatcaValidating(false);
      setZatcaValidationResult({
        status: "CLEARED",
        message: "Invoice successfully validated and cleared against ZATCA Phase 2 FATOORA Portal API. Schematron 100% compliant.",
        clearanceToken: `ZATCA-CLR-${Date.now().toString(36).toUpperCase()}`
      });
      showNotification(
        lang === "ar"
          ? "تم اعتماد الفاتورة وتخليصها رسمياً من بوابة زاتكا (ZATCA Cleared)!"
          : "Invoice cleared and reported to ZATCA FATOORA Portal!"
      );
    }, 1000);
  };

  // --- Sudan Tax & Form 15 State ---
  const [sudanForm, setSudanForm] = useState<SudanTaxForm15Data>(initialSudanForm15);

  // --- GCC Compliance Summaries ---
  const [gccSummaries, setGccSummaries] = useState<GCCTaxReturnSummary[]>(initialGCCSummaries);

  const handleDownloadAuditCSV = () => {
    const csvContent = generateAuditCSV(sudanForm, gccSummaries);
    downloadFile(csvContent, `MOKA_Corporate_Tax_Audit_${new Date().toISOString().slice(0, 10)}.csv`, "text/csv");
    showNotification(
      lang === "ar"
        ? "تم تحميل ملف التدقيق الضريبي بصيغة CSV بنجاح!"
        : "Tax Audit CSV report successfully generated and downloaded!"
    );
  };

  return (
    <div className="w-full min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans space-y-8" id="enterprise-tax-erp-hub">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-500 text-slate-950 px-5 py-3 rounded-2xl shadow-2xl font-bold font-mono text-xs flex items-center gap-2.5 animate-bounce">
          <CheckCircle className="w-4 h-4" />
          <span>{notification}</span>
        </div>
      )}

      {/* Header & Title Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-slate-950 shadow-lg shadow-orange-500/20">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white flex items-center gap-2.5">
                <span>{lang === "ar" ? "منصة الربط المالي وأنظمة الـ ERP والامتثال الإقليمي" : "Enterprise ERP Integration & Regional Tax Compliance Hub"}</span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  v4.8 Enterprise
                </span>
              </h1>
              <p className="text-xs md:text-sm text-slate-400 mt-0.5">
                {lang === "ar"
                  ? "المزامنة ثنائية الاتجاه مع SAP وNetSuite وOdoo وQuickBooks مع الفوترة الإلكترونية للمرحلة الثانية (زاتكا) وإقرارات الضرائب السودانية والخليجية."
                  : "Bidirectional sync hooks for SAP S/4HANA, Oracle NetSuite, Odoo, QuickBooks with automated ZATCA Phase 2 e-invoicing and Sudan/GCC tax audit clearance."}
              </p>
            </div>
          </div>
        </div>

        {/* Global Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => handleTriggerSync()}
            disabled={isSyncingAll}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 font-mono font-bold text-xs shadow-lg shadow-orange-500/20 hover:brightness-110 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
            id="btn-global-erp-sync"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncingAll ? "animate-spin" : ""}`} />
            <span>{isSyncingAll ? (lang === "ar" ? "جارِ المزامنة..." : "Syncing All ERPs...") : (lang === "ar" ? "مزامنة الأنظمة الشاملة" : "Trigger Global Sync")}</span>
          </button>

          <button
            onClick={handleDownloadAuditCSV}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 font-mono font-bold text-xs hover:bg-slate-800 hover:text-white transition-all cursor-pointer"
            id="btn-export-audit-csv"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>{lang === "ar" ? "تصدير تقرير التدقيق (CSV)" : "Export Audit CSV"}</span>
          </button>

          {onNavigate && (
            <button
              onClick={() => onNavigate("dashboard")}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 font-mono text-xs hover:text-white transition-all cursor-pointer"
            >
              <span>{lang === "ar" ? "غرفة العمليات" : "Ops Room"}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-1">
            <span>{lang === "ar" ? "الأنظمة المتصلة" : "Active ERP Connectors"}</span>
            <Server className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl md:text-2xl font-black text-white font-mono">4 / 4</div>
          <div className="text-[11px] text-emerald-400 flex items-center gap-1 mt-1 font-mono">
            <CheckCircle2 className="w-3 h-3" />
            <span>SAP, NetSuite, Odoo, QBO</span>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-1">
            <span>{lang === "ar" ? "حجم المزامنة (24 ساعة)" : "24h Synced Volume"}</span>
            <ArrowUpDown className="w-4 h-4 text-orange-400" />
          </div>
          <div className="text-xl md:text-2xl font-black text-white font-mono">4,120 Txns</div>
          <div className="text-[11px] text-slate-400 font-mono mt-1">
            <span>$1,482,910 USD Equivalent</span>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-1">
            <span>{lang === "ar" ? "نسبة التخليص (زاتكا)" : "ZATCA Clearance Rate"}</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl md:text-2xl font-black text-emerald-400 font-mono">100.0%</div>
          <div className="text-[11px] text-emerald-400 font-mono mt-1">
            <span>Phase 2 CSID Production</span>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-1">
            <span>{lang === "ar" ? "جاهزية التدقيق الضريبي" : "Tax Audit Readiness"}</span>
            <BadgeCheck className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl md:text-2xl font-black text-amber-400 font-mono">98.4%</div>
          <div className="text-[11px] text-amber-300 font-mono mt-1">
            <span>Sudan Form 15 & GCC VAT</span>
          </div>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-900/90 rounded-2xl border border-slate-800 w-fit">
        <button
          onClick={() => setActiveTab("erp_connectors")}
          className={`px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === "erp_connectors"
              ? "bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 font-black shadow-md shadow-orange-500/20"
              : "text-slate-400 hover:text-white"
          }`}
          id="tab-erp-connectors"
        >
          <Server className="w-4 h-4" />
          <span>{lang === "ar" ? "موصلات أنظمة الـ ERP" : "ERP Connectors & Hooks"}</span>
          <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-slate-950/80 text-amber-300 font-black">
            4 Live
          </span>
        </button>

        <button
          onClick={() => setActiveTab("coa_mapping")}
          className={`px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === "coa_mapping"
              ? "bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 font-black shadow-md shadow-orange-500/20"
              : "text-slate-400 hover:text-white"
          }`}
          id="tab-coa-mapping"
        >
          <Database className="w-4 h-4" />
          <span>{lang === "ar" ? "شجرة الحسابات (COA Mapping)" : "Chart of Accounts Mapping"}</span>
        </button>

        <button
          onClick={() => setActiveTab("sync_logs")}
          className={`px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === "sync_logs"
              ? "bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 font-black shadow-md shadow-orange-500/20"
              : "text-slate-400 hover:text-white"
          }`}
          id="tab-sync-logs"
        >
          <Terminal className="w-4 h-4" />
          <span>{lang === "ar" ? "سجل المزامنة الحية" : "Live Sync Logs"}</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
        </button>

        <button
          onClick={() => setActiveTab("zatca_phase2")}
          className={`px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === "zatca_phase2"
              ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black shadow-md shadow-emerald-500/20"
              : "text-slate-400 hover:text-white"
          }`}
          id="tab-zatca-phase2"
        >
          <FileCode className="w-4 h-4 text-emerald-400" />
          <span>{lang === "ar" ? "فوترة زاتكا الإلكترونية (المرحلة 2)" : "ZATCA Phase 2 E-Invoice"}</span>
          <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-emerald-950 text-emerald-300 font-black border border-emerald-500/30">
            XML / QR
          </span>
        </button>

        <button
          onClick={() => setActiveTab("sudan_tax")}
          className={`px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === "sudan_tax"
              ? "bg-gradient-to-r from-red-600 to-amber-600 text-white font-black shadow-md shadow-red-500/20"
              : "text-slate-400 hover:text-white"
          }`}
          id="tab-sudan-tax"
        >
          <Building2 className="w-4 h-4 text-amber-400" />
          <span>{lang === "ar" ? "ضرائب السودان (أورنيك 15)" : "Sudan Tax & Form 15"}</span>
        </button>

        <button
          onClick={() => setActiveTab("gcc_compliance")}
          className={`px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === "gcc_compliance"
              ? "bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 font-black shadow-md shadow-teal-500/20"
              : "text-slate-400 hover:text-white"
          }`}
          id="tab-gcc-compliance"
        >
          <Globe className="w-4 h-4 text-cyan-400" />
          <span>{lang === "ar" ? "إقرارات ضريبة الخليج (GCC VAT)" : "GCC VAT & Corp Tax"}</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: ERP CONNECTORS & BIDIRECTIONAL HOOKS                               */}
      {/* ========================================================================= */}
      {activeTab === "erp_connectors" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Connectors List (4 cols) */}
            <div className="lg:col-span-5 space-y-3">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
                  {lang === "ar" ? "أنظمة ERP المتصلة" : "Enterprise ERP Systems"}
                </h3>
                <span className="text-[11px] font-mono text-emerald-400">All Connected</span>
              </div>

              {connectors.map(c => (
                <div
                  key={c.id}
                  onClick={() => setSelectedConnector(c)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    selectedConnector.id === c.id
                      ? "bg-slate-900 border-orange-500/80 shadow-lg shadow-orange-500/10"
                      : "bg-slate-900/60 border-slate-800/80 hover:bg-slate-900 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-orange-400 font-mono">
                        {c.name.slice(0, 3).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white">{c.name}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{c.vendor} • {c.version}</div>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      {c.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-800/80 text-[11px] font-mono text-slate-400">
                    <div>
                      <div className="text-[9px] uppercase text-slate-500">Protocol</div>
                      <div className="truncate text-slate-300 font-semibold">{c.protocol}</div>
                    </div>
                    <div>
                      <div className="text-[9px] uppercase text-slate-500">24h Synced</div>
                      <div className="text-emerald-400 font-semibold">{c.totalSynced24h} items</div>
                    </div>
                    <div>
                      <div className="text-[9px] uppercase text-slate-500">Last Sync</div>
                      <div className="text-slate-300 font-semibold">{c.lastSyncTime}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Connector Details & Live Hooks Configuration (7 cols) */}
            <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-white">{selectedConnector.name}</h3>
                    <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                      {selectedConnector.protocol}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    Endpoint: <span className="text-slate-300">{selectedConnector.endpointUrl}</span>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleTriggerSync(selectedConnector.id)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-orange-500 text-slate-950 font-mono font-bold text-xs hover:bg-orange-400 transition-all cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>{lang === "ar" ? "مزامنة الآن" : "Sync Now"}</span>
                  </button>
                </div>
              </div>

              {/* Bidirectional Hooks Toggle & Capabilities */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-white flex items-center gap-2">
                      <span className="p-1 rounded bg-blue-500/10 text-blue-400">⬇</span>
                      Inbound Sync Hook (ERP → MOKA)
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">
                      ACTIVE
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Continuously imports Vendor Invoices, Approved Fuel POs, Driver Employee Master, and Cost Centers.
                  </p>
                  <div className="text-[10px] font-mono text-slate-500 space-y-1">
                    <div>• OData v4: <span className="text-slate-300">API_PURCHASEORDER_PROCESS_SRV</span></div>
                    <div>• Cost Center: <span className="text-slate-300">API_COSTCENTER_SRV</span></div>
                    <div>• Sync Trigger: <span className="text-emerald-400">Automated Change Data Capture</span></div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-white flex items-center gap-2">
                      <span className="p-1 rounded bg-orange-500/10 text-orange-400">⬆</span>
                      Outbound Sync Hook (MOKA → ERP)
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">
                      ACTIVE
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Immediately posts Journal Entries, Toll Accruals, and Fuel Refueling Bills once verified by OCR & CAN-Bus.
                  </p>
                  <div className="text-[10px] font-mono text-slate-500 space-y-1">
                    <div>• Target Entity: <span className="text-slate-300">JournalEntryBulkCreationRequest</span></div>
                    <div>• Verification: <span className="text-slate-300">CAN-Bus 3-Point & ZATCA QR Token</span></div>
                    <div>• Sync Trigger: <span className="text-orange-400">Sub-second webhook execution</span></div>
                  </div>
                </div>
              </div>

              {/* Security & Authentication Configuration */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  Credentials & Transport Security
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
                  <div>
                    <label className="text-[10px] text-slate-500 block mb-1">Tenant / System ID</label>
                    <input
                      type="text"
                      readOnly
                      value={selectedConnector.credentials.tenantId}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block mb-1">Client ID / Username</label>
                    <input
                      type="text"
                      readOnly
                      value={selectedConnector.credentials.clientId}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block mb-1">Company / Database Target</label>
                    <input
                      type="text"
                      readOnly
                      value={selectedConnector.credentials.companyDb}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block mb-1">Auth Secret / Token</label>
                    <input
                      type="text"
                      readOnly
                      value={selectedConnector.credentials.authSecret}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-400 text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Sample Inbound / Outbound Schema Inspector */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                  <span>Sample Outbound Journal Payload (OData v4)</span>
                  <span className="text-[10px] text-emerald-400">HTTP 201 Created</span>
                </div>
                <pre className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-emerald-400 overflow-x-auto max-h-48">
{JSON.stringify({
  "JournalEntryBulkCreationRequest": {
    "MessageHeader": {
      "CreationDateTime": "2026-09-02T23:45:00Z",
      "SenderBusinessSystemID": "MOKA_FLEET_CLOUD"
    },
    "JournalEntry": {
      "OriginalReferenceDocumentType": "BKPFF",
      "OriginalReferenceDocument": "MOKA-REFUEL-9941",
      "BusinessTransactionType": "RFBU",
      "CompanyCode": "SA01",
      "DocumentDate": "2026-09-02",
      "PostingDate": "2026-09-02",
      "Item": [
        { "ReferenceDocumentItem": "0000000001", "GLAccount": "510200", "AmountInTransactionCurrency": 16330.00, "CostCenter": "CC-LOGISTICS-CENTRAL" },
        { "ReferenceDocumentItem": "0000000002", "GLAccount": "120300", "AmountInTransactionCurrency": 2449.50, "TaxCode": "V1" },
        { "ReferenceDocumentItem": "0000000003", "GLAccount": "210400", "AmountInTransactionCurrency": -18779.50 }
      ]
    }
  }
}, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: CHART OF ACCOUNTS (COA) MAPPING MATRIX                             */}
      {/* ========================================================================= */}
      {activeTab === "coa_mapping" && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-white">Chart of Accounts (COA) Integration Matrix</h3>
              <p className="text-xs text-slate-400 font-mono">
                Map MOKA fuel transactions, driver cash advances, toll fees, and input taxes to standard ERP GL codes and analytic cost centers.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Filter className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-500" />
                <input
                  type="text"
                  placeholder="Filter category or code..."
                  value={coaSearch}
                  onChange={(e) => setCoaSearch(e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs font-mono text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-orange-500"
                />
              </div>

              <select
                value={selectedCoaFilter}
                onChange={(e) => setSelectedCoaFilter(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-300 focus:outline-none focus:border-orange-500"
              >
                <option value="ALL">All Categories</option>
                <option value="EXPENSE">Expense Accounts</option>
                <option value="ASSET">Asset Accounts</option>
                <option value="LIABILITY">Liability Accounts</option>
                <option value="SUSPENSE">Suspense Accounts</option>
              </select>

              <button
                onClick={() => {
                  showNotification(lang === "ar" ? "تم حفظ وتحديث مخطط الحسابات بنجاح!" : "Chart of Accounts rules validated and saved!");
                }}
                className="px-4 py-2 rounded-xl bg-orange-500 text-slate-950 font-mono font-bold text-xs hover:bg-orange-400 transition-all cursor-pointer"
              >
                {lang === "ar" ? "حفظ التغييرات" : "Save All Mappings"}
              </button>
            </div>
          </div>

          {/* Mapping Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                  <tr>
                    <th className="p-4">MOKA Operational Category</th>
                    <th className="p-4">Account Type</th>
                    <th className="p-4">ERP Account Code</th>
                    <th className="p-4">Target ERP GL Name</th>
                    <th className="p-4">Cost Center</th>
                    <th className="p-4">Tax Code</th>
                    <th className="p-4">Sync Mode</th>
                    <th className="p-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {coaMappings
                    .filter(m => {
                      if (selectedCoaFilter !== "ALL" && m.mokaAccountType !== selectedCoaFilter) return false;
                      if (coaSearch && !m.mokaCategory.toLowerCase().includes(coaSearch.toLowerCase()) && !m.erpCode.includes(coaSearch)) return false;
                      return true;
                    })
                    .map(m => (
                      <tr key={m.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="p-4">
                          <div className="font-bold text-white">{m.mokaCategory}</div>
                          <div className="text-[10px] text-slate-400">{m.mokaAccountName}</div>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                            m.mokaAccountType === "EXPENSE" ? "bg-orange-500/10 text-orange-400 border border-orange-500/20" :
                            m.mokaAccountType === "ASSET" ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" :
                            m.mokaAccountType === "LIABILITY" ? "bg-purple-500/10 text-purple-400 border border-purple-500/20" :
                            "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                          }`}>
                            {m.mokaAccountType}
                          </span>
                        </td>
                        <td className="p-4 font-bold text-amber-400">
                          {m.erpCode}
                        </td>
                        <td className="p-4 text-slate-200">
                          {m.erpAccountName}
                        </td>
                        <td className="p-4 text-slate-400">
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] border border-slate-700">
                            {m.costCenter}
                          </span>
                        </td>
                        <td className="p-4 text-emerald-400 font-bold">
                          {m.taxCode}
                        </td>
                        <td className="p-4 text-slate-400 text-[10px]">
                          {m.syncMode === "REALTIME_EVENT" ? "⚡ Real-time" : "📅 EOD Batch"}
                        </td>
                        <td className="p-4 text-center">
                          <span className="inline-flex items-center gap-1 text-emerald-400 font-bold text-[10px]">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Active
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: LIVE BIDIRECTIONAL SYNC LOGS & AUDIT STREAM                        */}
      {/* ========================================================================= */}
      {activeTab === "sync_logs" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Live Sync Logs & Execution Audit</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Real-time stream of inbound and outbound transactions across SAP, Oracle NetSuite, Odoo, and QuickBooks.
              </p>
            </div>

            <button
              onClick={() => {
                const newLog: SyncLogEntry = {
                  id: `log-${Date.now()}`,
                  timestamp: new Date().toISOString().replace("T", " ").slice(0, 19),
                  system: "sap_s4hana",
                  systemName: "SAP S/4HANA",
                  direction: "OUTBOUND",
                  eventType: "JOURNAL_ENTRY_POSTED",
                  entityId: `JE-2026-SA-${Math.floor(10000 + Math.random() * 90000)}`,
                  referenceDoc: `MOKA-REFUEL-BATCH-${Math.floor(1000 + Math.random() * 9000)}`,
                  recordsCount: 12,
                  amount: 14820.00,
                  currency: "SAR",
                  status: "SUCCESS",
                  httpCode: 201,
                  latencyMs: 135,
                  payloadPreview: {
                    simulation: true,
                    msg: "Real-time dispatch from live refuel session"
                  }
                };
                setSyncLogs(prev => [newLog, ...prev]);
                showNotification(lang === "ar" ? "تم تسجيل معاملة حية جديدة في سجل الـ ERP!" : "New live sync transaction posted to ERP broker!");
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500 text-slate-950 font-mono font-bold text-xs hover:bg-orange-400 transition-all cursor-pointer"
            >
              <Play className="w-3.5 h-3.5" />
              <span>{lang === "ar" ? "محاكاة ترحيل قيد فوري" : "Simulate Live Dispatch"}</span>
            </button>
          </div>

          {/* Logs Stream Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                  <tr>
                    <th className="p-4">Timestamp</th>
                    <th className="p-4">System</th>
                    <th className="p-4">Direction</th>
                    <th className="p-4">Event Type</th>
                    <th className="p-4">Entity ID & Ref</th>
                    <th className="p-4">Amount</th>
                    <th className="p-4">Latency</th>
                    <th className="p-4">HTTP Status</th>
                    <th className="p-4 text-center">Payload</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {syncLogs.map(log => (
                    <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-4 text-slate-400 whitespace-nowrap">
                        {log.timestamp}
                      </td>
                      <td className="p-4 font-bold text-white">
                        {log.systemName}
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          log.direction === "OUTBOUND" ? "bg-orange-500/10 text-orange-400" : "bg-blue-500/10 text-blue-400"
                        }`}>
                          {log.direction === "OUTBOUND" ? "⬆ Outbound" : "⬇ Inbound"}
                        </span>
                      </td>
                      <td className="p-4 text-amber-300 font-semibold">
                        {log.eventType}
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-white">{log.entityId}</div>
                        <div className="text-[10px] text-slate-500">{log.referenceDoc}</div>
                      </td>
                      <td className="p-4 font-bold text-emerald-400">
                        {log.amount > 0 ? `${log.amount.toLocaleString()} ${log.currency}` : "—"}
                      </td>
                      <td className="p-4 text-slate-400">
                        {log.latencyMs} ms
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold text-[10px] border border-emerald-500/20">
                          {log.httpCode} {log.status}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => setInspectedLog(log)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-all text-[11px] cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 inline mr-1" />
                          Inspect
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Inspected Payload Modal */}
          {inspectedLog && (
            <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full p-6 space-y-4 shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <Terminal className="w-4 h-4 text-orange-400" />
                      Payload Inspector: {inspectedLog.entityId}
                    </h4>
                    <p className="text-xs text-slate-400 font-mono">{inspectedLog.systemName} • {inspectedLog.eventType}</p>
                  </div>
                  <button
                    onClick={() => setInspectedLog(null)}
                    className="text-slate-400 hover:text-white font-mono text-sm px-2 py-1 rounded bg-slate-800"
                  >
                    ✕
                  </button>
                </div>

                <pre className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-mono text-emerald-400 overflow-y-auto max-h-80">
{JSON.stringify(inspectedLog.payloadPreview, null, 2)}
                </pre>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(JSON.stringify(inspectedLog.payloadPreview, null, 2));
                      showNotification("Payload copied to clipboard!");
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-200 text-xs font-mono hover:bg-slate-700 transition-all flex items-center gap-1.5"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy JSON</span>
                  </button>
                  <button
                    onClick={() => setInspectedLog(null)}
                    className="px-4 py-2 rounded-xl bg-orange-500 text-slate-950 text-xs font-mono font-bold hover:bg-orange-400 transition-all"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: ZATCA PHASE 2 E-INVOICING GENERATOR                                */}
      {/* ========================================================================= */}
      {activeTab === "zatca_phase2" && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span>ZATCA Phase 2 E-Invoicing Engine (FATOORA Platform)</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                  UBL 2.1 Compliant
                </span>
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Automated generation of B2B Standard Tax Invoices with cryptographic stamps, ECDSA secp256k1 signatures, and TLV Base64 QR codes.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-1 flex">
                <button
                  onClick={() => setZatcaMode("visual")}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                    zatcaMode === "visual" ? "bg-emerald-500 text-slate-950" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Visual Invoice & QR
                </button>
                <button
                  onClick={() => setZatcaMode("xml")}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                    zatcaMode === "xml" ? "bg-emerald-500 text-slate-950" : "text-slate-400 hover:text-white"
                  }`}
                >
                  UBL 2.1 XML
                </button>
                <button
                  onClick={() => setZatcaMode("tlv")}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                    zatcaMode === "tlv" ? "bg-emerald-500 text-slate-950" : "text-slate-400 hover:text-white"
                  }`}
                >
                  TLV Byte Inspector
                </button>
              </div>

              <button
                onClick={handleSimulateZatcaClearance}
                disabled={isZatcaValidating}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-mono font-bold text-xs hover:brightness-110 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{isZatcaValidating ? "Verifying..." : "Validate with ZATCA Portal"}</span>
              </button>
            </div>
          </div>

          {/* Validation Banner */}
          {zatcaValidationResult && (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2.5 text-emerald-400">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <div>
                  <div className="font-bold">{zatcaValidationResult.message}</div>
                  <div className="text-[10px] text-emerald-300/80">
                    Clearance Token: <span className="text-white font-bold">{zatcaValidationResult.clearanceToken}</span>
                  </div>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30 text-[10px]">
                CLEARED
              </span>
            </div>
          )}

          {/* MODE 1: VISUAL INVOICE & QR CODE */}
          {zatcaMode === "visual" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Visual Printable Tax Invoice (8 cols) */}
              <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl">
                {/* Invoice Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start border-b border-slate-800 pb-6 gap-4">
                  <div>
                    <div className="text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider">
                      فاتورة ضريبية (TAX INVOICE)
                    </div>
                    <div className="text-2xl font-black text-white font-mono mt-1">
                      {zatcaInvoice.invoiceNumber}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono mt-1">
                      UUID: <span className="text-slate-300">{zatcaInvoice.uuid}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      Issue Date & Time: <span className="text-slate-300">{zatcaInvoice.issueDate} {zatcaInvoice.issueTime} UTC</span>
                    </div>
                  </div>

                  <div className="text-right sm:text-right">
                    <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      Standard B2B Invoice
                    </span>
                    <div className="text-[11px] text-slate-400 font-mono mt-2">
                      ICV Counter: <span className="text-white font-bold">{zatcaInvoice.invoiceCounterValue}</span>
                    </div>
                  </div>
                </div>

                {/* Seller & Buyer Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs font-mono">
                  <div className="space-y-1.5">
                    <div className="text-[10px] uppercase text-emerald-400 font-bold">Supplier (المورد)</div>
                    <div className="font-bold text-white text-sm">{zatcaInvoice.seller.name}</div>
                    <div className="text-slate-400">VAT Reg No: <span className="text-white font-bold">{zatcaInvoice.seller.vatNumber}</span></div>
                    <div className="text-slate-400">CR No: <span className="text-slate-300">{zatcaInvoice.seller.crNumber}</span></div>
                    <div className="text-slate-400">{zatcaInvoice.seller.buildingNo} {zatcaInvoice.seller.street}, {zatcaInvoice.seller.district}, {zatcaInvoice.seller.city} {zatcaInvoice.seller.postalCode}</div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="text-[10px] uppercase text-orange-400 font-bold">Customer / Buyer (العميل)</div>
                    <div className="font-bold text-white text-sm">{zatcaInvoice.buyer.name}</div>
                    <div className="text-slate-400">VAT Reg No: <span className="text-white font-bold">{zatcaInvoice.buyer.vatNumber}</span></div>
                    <div className="text-slate-400">CR No: <span className="text-slate-300">{zatcaInvoice.buyer.crNumber}</span></div>
                    <div className="text-slate-400">{zatcaInvoice.buyer.buildingNo} {zatcaInvoice.buyer.street}, {zatcaInvoice.buyer.district}, {zatcaInvoice.buyer.city} {zatcaInvoice.buyer.postalCode}</div>
                  </div>
                </div>

                {/* Line Items Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                      <tr>
                        <th className="p-3">#</th>
                        <th className="p-3">Item Description</th>
                        <th className="p-3 text-right">Unit Price</th>
                        <th className="p-3 text-right">Qty</th>
                        <th className="p-3 text-right">Net</th>
                        <th className="p-3 text-right">VAT (15%)</th>
                        <th className="p-3 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {zatcaInvoice.lineItems.map((line, idx) => (
                        <tr key={line.id}>
                          <td className="p-3 text-slate-500">{idx + 1}</td>
                          <td className="p-3 font-semibold text-white">{line.description}</td>
                          <td className="p-3 text-right text-slate-300">{line.unitPrice.toFixed(4)}</td>
                          <td className="p-3 text-right text-slate-300">{line.quantity.toLocaleString()} {line.unitCode}</td>
                          <td className="p-3 text-right text-slate-200">{line.netAmount.toFixed(2)}</td>
                          <td className="p-3 text-right text-emerald-400">{line.vatAmount.toFixed(2)}</td>
                          <td className="p-3 text-right font-bold text-white">{line.subtotal.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Monetary Totals Summary */}
                <div className="flex justify-end">
                  <div className="w-full sm:w-72 space-y-2 p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-mono">
                    <div className="flex justify-between text-slate-400">
                      <span>Total Excl. VAT (المجموع الفرعي):</span>
                      <span className="text-white font-bold">{zatcaInvoice.subtotalExclVat.toFixed(2)} SAR</span>
                    </div>
                    <div className="flex justify-between text-emerald-400">
                      <span>Total VAT 15% (ضريبة القيمة المضافة):</span>
                      <span className="font-bold">+{zatcaInvoice.totalVatAmount.toFixed(2)} SAR</span>
                    </div>
                    <div className="border-t border-slate-800 pt-2 flex justify-between text-sm font-black text-white">
                      <span>Total Incl. VAT (الإجمالي المستحق):</span>
                      <span className="text-amber-400">{zatcaInvoice.grandTotalInclVat.toFixed(2)} SAR</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Cryptographic QR Code & Digital Seals (4 cols) */}
              <div className="lg:col-span-4 space-y-6">
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-center space-y-4 shadow-xl">
                  <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center justify-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    ZATCA Phase 2 Cryptographic QR
                  </h4>

                  <div className="p-4 bg-white rounded-2xl inline-block shadow-lg mx-auto">
                    <QRCodeSVG
                      value={tlvBase64}
                      size={180}
                      level="M"
                      includeMargin={false}
                    />
                  </div>

                  <p className="text-[11px] text-slate-400 font-mono">
                    Scannable by the official ZATCA (FATOORA) Inspector App. Encodes Tags 1 to 8 in TLV Base64 with ECDSA signature.
                  </p>

                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-left text-[10px] font-mono space-y-1">
                    <div className="text-slate-500 uppercase">Previous Invoice Hash (PIH):</div>
                    <div className="truncate text-emerald-400">{zatcaInvoice.previousInvoiceHash}</div>
                    <div className="text-slate-500 uppercase mt-2">ECDSA Digital Signature:</div>
                    <div className="truncate text-slate-300">{zatcaInvoice.ecdsaSignature}</div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(tlvBase64);
                        showNotification("ZATCA TLV Base64 copied!");
                      }}
                      className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono transition-all flex items-center justify-center gap-1.5"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Base64</span>
                    </button>
                    <button
                      onClick={() => {
                        downloadFile(generatedUBLXML, `${zatcaInvoice.invoiceNumber}.xml`, "application/xml");
                        showNotification("UBL 2.1 XML downloaded!");
                      }}
                      className="w-full py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-mono font-bold transition-all flex items-center justify-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download XML</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* MODE 2: UBL 2.1 XML VIEWER */}
          {zatcaMode === "xml" && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">Generated UBL 2.1 XML Document (OASIS Standard)</h4>
                  <p className="text-xs text-slate-400 font-mono">Contains full cac:AccountingSupplierParty, cac:TaxTotal, cac:LegalMonetaryTotal, and cryptographic signatures.</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(generatedUBLXML);
                      showNotification("XML copied to clipboard!");
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-800 text-slate-200 hover:text-white text-xs font-mono flex items-center gap-1.5"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy XML</span>
                  </button>
                  <button
                    onClick={() => {
                      downloadFile(generatedUBLXML, `${zatcaInvoice.invoiceNumber}.xml`, "application/xml");
                      showNotification("UBL 2.1 XML downloaded!");
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-500 text-slate-950 hover:bg-emerald-400 text-xs font-mono font-bold flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download XML</span>
                  </button>
                </div>
              </div>

              <pre className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-mono text-emerald-400 overflow-x-auto max-h-[600px]">
{generatedUBLXML}
              </pre>
            </div>
          )}

          {/* MODE 3: TLV BYTE INSPECTOR */}
          {zatcaMode === "tlv" && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
              <div>
                <h4 className="text-sm font-bold text-white">TLV (Tag-Length-Value) Base64 Byte Inspector</h4>
                <p className="text-xs text-slate-400 font-mono">
                  Visual breakdown of the raw bytes conforming to ZATCA E-Invoicing resolution specifications.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono break-all text-amber-400">
                <span className="text-slate-500">Base64 Encoded Stream: </span>
                {tlvBase64}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                    <tr>
                      <th className="p-3">Tag #</th>
                      <th className="p-3">Specification Tag Name</th>
                      <th className="p-3">Byte Length</th>
                      <th className="p-3">Decoded Value</th>
                      <th className="p-3">Raw Hex Bytes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {tlvInspection.map(item => (
                      <tr key={item.tag} className="hover:bg-slate-800/40">
                        <td className="p-3 font-bold text-emerald-400">Tag {item.tag}</td>
                        <td className="p-3 font-semibold text-white">{item.tagName}</td>
                        <td className="p-3 text-slate-400">{item.length} bytes</td>
                        <td className="p-3 text-slate-200 max-w-xs truncate">{item.value}</td>
                        <td className="p-3 text-[10px] text-slate-500 font-mono max-w-xs truncate">{item.hex}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: SUDANESE CORPORATE TAX & FORM 15 COMPLIANCE                        */}
      {/* ========================================================================= */}
      {activeTab === "sudan_tax" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span>جمهورية السودان - ديوان الضرائب (Sudan Taxation Chamber)</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-red-600/20 text-red-400 font-bold border border-red-500/30">
                  Form 15 Audit
                </span>
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Official Corporate Tax Return Form 15, Value Added Tax (VAT 17%), Business Profit Tax (15%), and Withholding Tax.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  showNotification("Sudan Form 15 calculations certified and re-verified!");
                }}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-mono font-bold text-xs transition-all cursor-pointer shadow-lg shadow-red-600/20"
              >
                {lang === "ar" ? "اعتماد الحسابات الضريبية" : "Certify Sudanese Return"}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Form 15 Return Matrix (8 cols) */}
            <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6">
              <div className="border-b border-slate-800 pb-4 flex justify-between items-center">
                <div>
                  <div className="text-xs font-mono text-red-400 font-bold uppercase">
                    أورنيك 15 الإلكتروني الموحد لإقرارات الشركات والمنشآت
                  </div>
                  <div className="text-sm font-bold text-white mt-1">
                    {sudanForm.companyName}
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    TIN: <span className="text-white font-bold">{sudanForm.taxPayerTIN}</span> • {sudanForm.taxOffice}
                  </div>
                </div>
                <div className="text-right">
                  <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-slate-800 text-slate-200 border border-slate-700">
                    Year {sudanForm.assessmentYear} ({sudanForm.reportingPeriod})
                  </span>
                </div>
              </div>

              {/* Tax Schedules Breakdown */}
              <div className="space-y-4 text-xs font-mono">
                {/* Schedule 1: Operating Revenues & Deductions */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="text-xs font-bold text-amber-400 uppercase">1. Gross Logistics Revenue & Allowable Expenses</div>
                  <div className="flex justify-between text-slate-300">
                    <span>Gross Fleet Operating Revenue (الإيرادات الإجمالية):</span>
                    <span className="font-bold text-white">{sudanForm.totalOperatingRevenue.toLocaleString()} SDG</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Less: Certified Deductible Fuel Purchases (تكاليف الوقود المعتمدة):</span>
                    <span className="text-emerald-400">-{sudanForm.fuelPurchasesDeductible.toLocaleString()} SDG</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Less: Fleet Maintenance & Spare Parts (الصيانة وقطع الغيار):</span>
                    <span className="text-emerald-400">-{sudanForm.fleetMaintenanceExpenses.toLocaleString()} SDG</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Less: Driver Payroll & Allowances (أجور ومستحقات السائقين):</span>
                    <span className="text-emerald-400">-{sudanForm.driverSalariesAndAllowances.toLocaleString()} SDG</span>
                  </div>
                  <div className="border-t border-slate-800 pt-2 flex justify-between font-bold text-slate-200">
                    <span>Adjusted Net Profit Before Tax:</span>
                    <span className="text-amber-300">{sudanForm.businessProfitTaxableIncome.toLocaleString()} SDG</span>
                  </div>
                </div>

                {/* Schedule 2: VAT 17% Return */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="text-xs font-bold text-emerald-400 uppercase">2. Value Added Tax (ضريبة القيمة المضافة 17%)</div>
                  <div className="flex justify-between text-slate-300">
                    <span>Taxable Supplies at 17% (المبيعات الخاضعة للضريبة):</span>
                    <span>{sudanForm.vat17PctTaxableSupplies.toLocaleString()} SDG</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Output Tax 17% (ضريبة المخرجات المستحقة):</span>
                    <span className="text-white font-bold">{sudanForm.vat17PctOutputTax.toLocaleString()} SDG</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Less: Input Tax Deductible (خصم ضريبة المدخلات):</span>
                    <span className="text-emerald-400">-{sudanForm.vat17PctInputTaxDeduction.toLocaleString()} SDG</span>
                  </div>
                  <div className="border-t border-slate-800 pt-2 flex justify-between font-bold text-emerald-400">
                    <span>Net VAT Payable to Sudan Tax Chamber:</span>
                    <span>{sudanForm.netVat17PctPayable.toLocaleString()} SDG</span>
                  </div>
                </div>

                {/* Schedule 3: Corporate Profit Tax & Stamp Duty */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="text-xs font-bold text-cyan-400 uppercase">3. Business Profit Tax (15%) & Stamp Duty</div>
                  <div className="flex justify-between text-slate-300">
                    <span>Business Profit Tax at 15% (ضريبة أرباح الأعمال):</span>
                    <span className="font-bold text-white">{sudanForm.businessProfitTax15Pct.toLocaleString()} SDG</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Stamp Duty on Transport Waybills (رسم الدمغة النسبية):</span>
                    <span className="font-bold text-white">{sudanForm.stampDutyAmount.toLocaleString()} SDG</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Withholding Tax Pre-collected at 2% (الخصم من المنبع):</span>
                    <span className="text-slate-300">{sudanForm.withholdingTaxDeducted2Pct.toLocaleString()} SDG</span>
                  </div>
                  <div className="border-t border-slate-800 pt-2 flex justify-between text-sm font-black text-amber-400">
                    <span>Total Tax Liability Payable (إجمالي الضريبة المستحقة السداد):</span>
                    <span>{sudanForm.totalAuditedTaxPayable.toLocaleString()} SDG</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Official Clearance Certificate (4 cols) */}
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-slate-900 border-2 border-red-500/40 rounded-3xl p-6 text-center space-y-4 shadow-xl relative overflow-hidden">
                <div className="absolute -right-8 -top-8 w-24 h-24 rounded-full bg-red-500/10 blur-xl" />
                <div className="w-12 h-12 rounded-2xl bg-red-600/20 text-red-400 mx-auto flex items-center justify-center font-bold text-lg border border-red-500/30">
                  <Building2 className="w-6 h-6" />
                </div>

                <div>
                  <h4 className="text-sm font-black text-white">شهادة براءة الذمة والامتثال الضريبي</h4>
                  <div className="text-[11px] text-slate-400 font-mono mt-0.5">Sudan Tax Compliance Clearance</div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-left text-[10px] font-mono space-y-1.5">
                  <div className="text-slate-500 uppercase">Clearance Ref No:</div>
                  <div className="font-bold text-emerald-400">{sudanForm.clearanceRefNo}</div>
                  <div className="text-slate-500 uppercase">Auditor Firm:</div>
                  <div className="text-slate-200">{sudanForm.auditorName}</div>
                  <div className="text-slate-500 uppercase">License:</div>
                  <div className="text-slate-300">{sudanForm.auditorLicenseNo}</div>
                  <div className="text-slate-500 uppercase">Cryptographic Integrity Hash:</div>
                  <div className="truncate text-slate-500">{sudanForm.verificationHash}</div>
                </div>

                <div className="p-3 bg-white rounded-2xl inline-block mx-auto">
                  <QRCodeSVG
                    value={`https://tax.gov.sd/verify?ref=${sudanForm.clearanceRefNo}&tin=${sudanForm.taxPayerTIN}&status=COMPLIANT`}
                    size={140}
                  />
                </div>

                <p className="text-[10px] text-slate-400 font-mono">
                  Scan to verify live clearance status on the Sudan Taxation Chamber national portal.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: GCC VAT & CORPORATE TAX EXPORT CENTER                              */}
      {/* ========================================================================= */}
      {activeTab === "gcc_compliance" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span>GCC Regional Tax & VAT Export Schedules</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-teal-500/20 text-teal-400 font-bold border border-teal-500/30">
                  KSA • UAE • Bahrain • Oman
                </span>
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Consolidated tax schedules prepared for multi-jurisdiction fleet operations across GCC transport corridors.
              </p>
            </div>

            <button
              onClick={handleDownloadAuditCSV}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-mono font-bold text-xs transition-all cursor-pointer shadow-lg shadow-teal-500/20"
            >
              <Download className="w-4 h-4" />
              <span>{lang === "ar" ? "تصدير الملف المعتمد (CSV)" : "Download Audit File (CSV)"}</span>
            </button>
          </div>

          {/* GCC Jurisdictions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {gccSummaries.map(gcc => (
              <div key={gcc.jurisdiction} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <div className="text-base font-bold text-white flex items-center gap-2">
                      <span>{gcc.jurisdiction}</span>
                      <span className="text-xs font-mono text-slate-400">({gcc.authorityName})</span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">TIN: <span className="text-slate-200 font-bold">{gcc.tin}</span></div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-teal-500/10 text-teal-400 border border-teal-500/20">
                    {gcc.period}
                  </span>
                </div>

                <div className="space-y-2 text-xs font-mono">
                  <div className="flex justify-between text-slate-400">
                    <span>Standard Rated Supplies:</span>
                    <span className="text-white font-bold">{gcc.standardRatedSales.toLocaleString()} {gcc.currency}</span>
                  </div>
                  <div className="flex justify-between text-teal-400">
                    <span>Output VAT Collected:</span>
                    <span className="font-bold">+{gcc.standardRatedSalesVat.toLocaleString()} {gcc.currency}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Zero-Rated & Cross-Border Logistics:</span>
                    <span className="text-slate-300">{gcc.zeroRatedSales.toLocaleString()} {gcc.currency}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Standard Purchases & Recoverable VAT:</span>
                    <span className="text-emerald-400">-{gcc.standardRatedPurchasesVat.toLocaleString()} {gcc.currency}</span>
                  </div>
                  {gcc.corporateTaxAccrual && (
                    <div className="flex justify-between text-amber-400 border-t border-slate-800 pt-2">
                      <span>Corporate Tax Accrual (9%):</span>
                      <span className="font-bold">{gcc.corporateTaxAccrual.toLocaleString()} {gcc.currency}</span>
                    </div>
                  )}
                  <div className="border-t border-slate-800 pt-2 flex justify-between font-black text-sm text-white">
                    <span>Net VAT Settlement:</span>
                    <span className="text-teal-400">{gcc.netVatPayableRefundable.toLocaleString()} {gcc.currency}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
