import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  FileText,
  PenTool,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Download,
  Lock,
  RotateCcw,
  Sparkles,
  Printer,
  ChevronRight,
  AlertCircle
} from "lucide-react";
import { DigitalB2BContract } from "./types";
import { generateContractHash, generateContractDocumentText } from "./contractSigner";

interface DigitalContractSigningTabProps {
  contracts: DigitalB2BContract[];
  onSignContract: (
    contractId: string,
    signerName: string,
    signerRole: string,
    signatureData: string,
    hash: string
  ) => void;
  lang: "en" | "ar";
}

export default function DigitalContractSigningTab({
  contracts,
  onSignContract,
  lang
}: DigitalContractSigningTabProps) {
  const [selectedContractId, setSelectedContractId] = useState<string>(
    contracts[1]?.id || contracts[0]?.id || ""
  );

  const selectedContract = contracts.find((c) => c.id === selectedContractId) || contracts[0];

  // Signing Modal State
  const [showSignModal, setShowSignModal] = useState<boolean>(false);
  const [signingMode, setSigningMode] = useState<"DRAW" | "TYPE">("DRAW");
  const [signerName, setSignerName] = useState<string>("Sultan M. Al-Otaibi");
  const [signerRole, setSignerRole] = useState<string>("VP Fleet Operations & Commercial Distribution");
  const [signerEmail, setSignerEmail] = useState<string>("s.otaibi@sasco.com.sa");
  const [agreeChecked, setAgreeChecked] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  // Canvas Drawing Pad Ref
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [hasDrawn, setHasDrawn] = useState<boolean>(false);

  // Canvas drawing functions
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = "touches" in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = "touches" in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasDrawn(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = "touches" in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = "touches" in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.strokeStyle = "#38bdf8"; // Sky-400
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const handleExecuteSignature = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContract) return;

    let signatureData = "";
    if (signingMode === "DRAW" && canvasRef.current && hasDrawn) {
      signatureData = canvasRef.current.toDataURL("image/png");
    } else {
      signatureData = `TYPED_LEGAL_SIGNATURE//${signerName}//${signerRole}//${Date.now()}`;
    }

    const timestamp = new Date().toISOString();
    const hash = generateContractHash(selectedContract, signerName, timestamp);

    onSignContract(selectedContract.id, signerName, signerRole, signatureData, hash);
    setShowSignModal(false);
    clearCanvas();
  };

  const handleDownloadDoc = () => {
    if (!selectedContract) return;
    const docText = generateContractDocumentText(selectedContract);
    const blob = new Blob([docText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selectedContract.contractNumber}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    setDownloadSuccess(`Contract document ${selectedContract.contractNumber} exported successfully.`);
    setTimeout(() => setDownloadSuccess(null), 4000);
  };

  return (
    <div className="space-y-8" id="digital-contract-signing-tab">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <PenTool className="w-5 h-5 text-amber-400" />
              <h3 className="text-lg font-bold text-white">
                {lang === "ar" ? "مركز توقيع العقود الرقمية والاتفاقيات التجارية" : "Digital B2B Contract Signing & Legal Accord Center"}
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {lang === "ar"
                ? "توقيع اتفاقيات التوريد الديناميكي ومكافآت الموزعين بتوثيق رقمي مشفر (SHA-256) معتمد نظامياً"
                : "Execute legally binding merchant fuel supply and rebate agreements with cryptographic SHA-256 digital stamping"}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadDoc}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4 text-amber-400" />
              Export Executed Agreement
            </button>
          </div>
        </div>

        {downloadSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{downloadSuccess}</span>
          </motion.div>
        )}
      </div>

      {/* Contract Selector Tabs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {contracts.map((c) => {
          const isSelected = c.id === selectedContractId;
          const isSigned = c.contractStatus === "SIGNED_ACTIVE";

          return (
            <button
              key={c.id}
              onClick={() => setSelectedContractId(c.id)}
              className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                isSelected
                  ? "bg-amber-500/15 border-amber-500/60 shadow-lg shadow-amber-500/10"
                  : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"
              }`}
            >
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-mono text-slate-400 font-bold">{c.contractNumber}</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border inline-flex items-center gap-1 ${
                    isSigned
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                      : "bg-amber-500/10 text-amber-400 border-amber-500/30 animate-pulse"
                  }`}
                >
                  {isSigned ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                  {isSigned ? "Executed & Active" : "Action Required"}
                </span>
              </div>
              <h4 className="text-xs font-bold text-white mt-2 line-clamp-2">
                {lang === "ar" ? c.titleAr : c.titleEn}
              </h4>
              <div className="text-[10px] text-slate-400 mt-2 font-mono flex justify-between">
                <span>Valid to: {c.expiryDate}</span>
                <span className="text-amber-400">{c.clauses.length} Articles</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Contract Document Viewer & Signature Stamp */}
      {selectedContract && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl shadow-xl space-y-6">
          {/* Header of Contract */}
          <div className="border-b border-slate-800 pb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
              <div>
                <span className="text-[11px] font-mono uppercase text-amber-400 font-bold tracking-wider">
                  Official B2B Commercial Agreement
                </span>
                <h4 className="text-xl font-bold text-white mt-1">
                  {lang === "ar" ? selectedContract.titleAr : selectedContract.titleEn}
                </h4>
                <div className="text-xs text-slate-400 font-mono mt-1">
                  Agreement No: <strong className="text-slate-200">{selectedContract.contractNumber}</strong>
                </div>
              </div>

              {/* Action Button: Sign Contract or View Certified Stamp */}
              {selectedContract.contractStatus !== "SIGNED_ACTIVE" ? (
                <button
                  onClick={() => setShowSignModal(true)}
                  className="px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
                  id="sign-contract-now-btn"
                >
                  <PenTool className="w-4 h-4" />
                  Sign Agreement Now
                </button>
              ) : (
                <div className="px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-mono text-xs flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Cryptographically Sealed</span>
                </div>
              )}
            </div>

            {/* Parties Metadata */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5 pt-5 border-t border-slate-800/60 text-xs font-mono">
              <div>
                <span className="text-slate-500 block">First Party (Platform):</span>
                <strong className="text-slate-200">{selectedContract.firstParty}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Second Party (Merchant / Partner):</span>
                <strong className="text-slate-200">{selectedContract.secondParty}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Governing Jurisdiction:</span>
                <strong className="text-slate-200">{selectedContract.governingLaw}</strong>
              </div>
            </div>
          </div>

          {/* Clauses List */}
          <div className="space-y-4">
            <h5 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Contract Articles & Binding Operating Covenants
            </h5>
            <div className="space-y-3">
              {selectedContract.clauses.map((clause, idx) => (
                <div
                  key={idx}
                  className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 space-y-1"
                >
                  <div className="text-xs font-bold text-amber-400 font-mono flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[10px]">
                      {clause.section}
                    </span>
                    <span>{clause.title}</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed pt-1">
                    {clause.text}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Cryptographic Execution Stamp Block */}
          {selectedContract.contractStatus === "SIGNED_ACTIVE" ? (
            <div className="p-5 rounded-xl bg-gradient-to-br from-slate-950 to-emerald-950/20 border border-emerald-500/30 font-mono text-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <span>Digital Signature Verification Certificate</span>
                </div>
                <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  LEGAL STATUS: EXECUTED & BINDING
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-300">
                <div>
                  <span className="text-slate-500 block">Authorized Signatory:</span>
                  <strong className="text-white">{selectedContract.merchantSignerName}</strong>
                  <div className="text-[11px] text-slate-400">{selectedContract.merchantSignerRole}</div>
                </div>
                <div>
                  <span className="text-slate-500 block">Execution Timestamp (UTC):</span>
                  <strong className="text-white">{selectedContract.merchantSignedAt}</strong>
                  <div className="text-[11px] text-slate-400">IP: {selectedContract.merchantSigningIp}</div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/80">
                <div className="text-[10px] text-slate-400">Cryptographic SHA-256 Digest Token:</div>
                <div className="text-[11px] font-bold text-amber-400 break-all bg-slate-900 p-2 rounded border border-slate-800 mt-1">
                  {selectedContract.verificationHash}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>This contract is awaiting authorized digital signature from your commercial representative.</span>
              </div>
              <button
                onClick={() => setShowSignModal(true)}
                className="px-3 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold text-[11px] cursor-pointer"
              >
                Sign Now
              </button>
            </div>
          )}
        </div>
      )}

      {/* MODAL: Digital Contract Signature Pad */}
      <AnimatePresence>
        {showSignModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-xl w-full shadow-2xl space-y-5"
            >
              <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <PenTool className="w-5 h-5 text-amber-400" />
                  <h4 className="text-base font-bold text-white">
                    Execute Digital Contract Signature
                  </h4>
                </div>
                <button
                  onClick={() => setShowSignModal(false)}
                  className="text-slate-400 hover:text-white text-sm font-mono cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleExecuteSignature} className="space-y-4 text-xs font-mono">
                {/* Signer Details */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-300 block mb-1">Signatory Full Legal Name *</label>
                    <input
                      type="text"
                      required
                      value={signerName}
                      onChange={(e) => setSignerName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 block mb-1">Corporate Authority Title *</label>
                    <input
                      type="text"
                      required
                      value={signerRole}
                      onChange={(e) => setSignerRole(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-300 block mb-1">Corporate Verification Email</label>
                  <input
                    type="email"
                    required
                    value={signerEmail}
                    onChange={(e) => setSignerEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Signing Mode Toggle */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-slate-300">Signature Method:</label>
                    <div className="flex gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
                      <button
                        type="button"
                        onClick={() => setSigningMode("DRAW")}
                        className={`px-3 py-1 rounded text-[11px] transition-all cursor-pointer ${
                          signingMode === "DRAW"
                            ? "bg-amber-500 text-slate-950 font-bold"
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        Draw Signature
                      </button>
                      <button
                        type="button"
                        onClick={() => setSigningMode("TYPE")}
                        className={`px-3 py-1 rounded text-[11px] transition-all cursor-pointer ${
                          signingMode === "TYPE"
                            ? "bg-amber-500 text-slate-950 font-bold"
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        Type Formal Signature
                      </button>
                    </div>
                  </div>

                  {/* Draw Signature Canvas */}
                  {signingMode === "DRAW" ? (
                    <div className="relative">
                      <canvas
                        ref={canvasRef}
                        width={500}
                        height={140}
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                        onTouchStart={startDrawing}
                        onTouchMove={draw}
                        onTouchEnd={stopDrawing}
                        className="w-full h-36 bg-slate-950 border border-slate-700 rounded-xl cursor-crosshair touch-none"
                      />
                      {!hasDrawn && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-slate-600 text-xs">
                          Sign with mouse or stylus here
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={clearCanvas}
                        className="absolute bottom-2 right-2 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] flex items-center gap-1 border border-slate-700 cursor-pointer"
                      >
                        <RotateCcw className="w-3 h-3" /> Clear
                      </button>
                    </div>
                  ) : (
                    /* Typed Formal Signature */
                    <div className="p-4 bg-slate-950 border border-slate-700 rounded-xl text-center">
                      <div className="text-xl font-serif italic text-amber-400 tracking-wider">
                        {signerName || "Legal Signatory"}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-1">
                        Cryptographically Verified Representative of {selectedContract?.secondParty}
                      </div>
                    </div>
                  )}
                </div>

                {/* Legal Consent Checkbox */}
                <label className="flex items-start gap-2.5 cursor-pointer text-[11px] text-slate-400 pt-2">
                  <input
                    type="checkbox"
                    required
                    checked={agreeChecked}
                    onChange={(e) => setAgreeChecked(e.target.checked)}
                    className="mt-0.5 accent-amber-500 cursor-pointer"
                  />
                  <span>
                    I confirm that I am authorized to bind the merchant entity to this agreement. By clicking execute, a non-repudiable cryptographic signature (SHA-256) will be generated and archived.
                  </span>
                </label>

                {/* Form Buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowSignModal(false)}
                    className="flex-1 py-3 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-bold transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!agreeChecked}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold shadow-lg shadow-amber-500/20 transition-all cursor-pointer disabled:opacity-50"
                  >
                    Execute & Stamp Contract
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
