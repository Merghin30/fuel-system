import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Truck, Nfc, Camera, CheckCircle, ChevronRight, ChevronLeft, 
  HelpCircle, AlertTriangle, ShieldCheck, RefreshCw, Smartphone, 
  QrCode, UserCheck, Check, RotateCw 
} from "lucide-react";

interface FuelTabProps {
  lang: "en" | "ar" | "sd";
  isOnline: boolean;
  onAddTransaction: (tx: {
    type: "fuel" | "expense";
    details: string;
  }) => void;
  speakText: (text: string) => void;
  onNavigateHome: () => void;
}

const mockTrucks = [
  { id: "T-882", name: "Mercedes Actros 1845", plate: "KSA-1892", image: "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=400&q=80", odo: 142850, fuel: "Diesel" },
  { id: "T-991", name: "Volvo FH Globetrotter", plate: "SUD-41-991", image: "https://images.unsplash.com/photo-1591768793355-74d75b5d17fc?auto=format&fit=crop&w=400&q=80", odo: 389220, fuel: "Heavy Diesel" },
  { id: "T-312", name: "Scania R500 V8 Stream", plate: "KSA-3120", image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=400&q=80", odo: 89430, fuel: "Diesel" }
];

const localization = {
  en: {
    title: "Fuel Authorization",
    step1: "Step 1: Select Truck",
    step2: "Step 2: NFC Terminal Check",
    step3: "Step 3: Enter Fuel Amount",
    step4: "Step 4: Odometer Scan",
    step5: "Step 5: Review & Commit",
    step6: "Step 6: Receipt Approved",
    btnSelect: "Select Asset",
    btnSelected: "Selected ✓",
    holdNfc: "Hold Phone Near Terminal",
    nfcSub: "Simulating MOKA cryptographic badge handshake...",
    litersLabel: "Liters to Refuel",
    quickFill: "Full Tank (450L)",
    customLiters: "Enter liters count (e.g., 150)",
    cameraGuide: "Align Odometer inside Guide",
    cameraBtn: "Capture Compliance Photo",
    reviewLiters: "Requested Fuel",
    reviewPrice: "Diesel Tariff",
    reviewTotal: "Total Charge",
    reviewStation: "Designated Station",
    btnSubmit: "Authorize & Dispatch Fuel",
    preAuthOk: "MOKA Pre-Auth Check: OK",
    receiptTitle: "Fuel Voucher Receipt",
    receiptApproved: "APPROVED BY CORRIDOR LEDGER",
    receiptTx: "Voucher Ticket ID",
    receiptQrDesc: "Scan this QR code at the physical dispenser terminal to activate fuel nozzle flow.",
    btnHome: "Back to Home Screen",
    preOdoLabel: "Pre-Refuel Photo Locked",
    postOdoLabel: "Post-Refuel Photo Locked",
    fillTankQuick: "Auto Fill (Max Tank)",
  },
  ar: {
    title: "طلب تصريح وتعبئة الوقود",
    step1: "الخطوة ١: اختر الشاحنة",
    step2: "الخطوة ٢: مطابقة الـ NFC بالمحطة",
    step3: "الخطوة ٣: حدد كمية الديزل",
    step4: "الخطوة ٤: تصوير العداد للتأكيد",
    step5: "الخطوة ٥: المراجعة والتأكيد",
    step6: "الخطوة ٦: إيصال التزود بالوقود",
    btnSelect: "اختيار الشاحنة",
    btnSelected: "محددة ✓",
    holdNfc: "قرب هاتفك من قارئ المحطة",
    nfcSub: "محاكاة التشفير الآمن والتحقق من هوية السائق...",
    litersLabel: "كمية الوقود باللتر",
    quickFill: "خزان كامل (٤٥٠ لتر)",
    customLiters: "أدخل عدد اللترات المطلوبة (مثال: ١٥٠)",
    cameraGuide: "وجه الكاميرا لعداد المسافة بالمقصورة",
    cameraBtn: "التقاط صورة الامتثال والتسجيل",
    reviewLiters: "كمية الديزل المطلوبة",
    reviewPrice: "تسعيرة الديزل المعتمدة",
    reviewTotal: "إجمالي التكلفة",
    reviewStation: "محطة الخدمة المعتمدة",
    btnSubmit: "اعتماد وصرف كمية الوقود",
    preAuthOk: "تحقق الموافقة المسبقة: سليم ✓",
    receiptTitle: "فاتورة سحب الوقود الرقمية",
    receiptApproved: "موافقة معتمدة من الخادم المركزي",
    receiptTx: "رقم قسيمة الوقود",
    receiptQrDesc: "أبرز رمز الـ QR هذا للمضخة لبدء تزويد الشاحنة بالوقود مباشرة.",
    btnHome: "العودة للشاشة الرئيسية",
    preOdoLabel: "تم قفل صورة العداد المسبقة",
    postOdoLabel: "تم قفل صورة العداد اللاحقة",
    fillTankQuick: "تعبئة كاملة (الحد الأقصى)",
  },
  sd: {
    title: "طلب جاز الوقود للموتور",
    step1: "الخطوة ١: أقرا كرت اللوري",
    step2: "الخطوة ٢: طقطق اللوري بالـ NFC",
    step3: "الخطوة ٣: كمية اللترات المطلوبة",
    step4: "الخطوة ٤: طق صورة عداد الكيلو",
    step5: "الخطوة ٥: راجع سفرية الجاز",
    step6: "الخطوة ٦: إيصال تصديق الجاز",
    btnSelect: "أختار اللوري ده",
    btnSelected: "تم الاختيار ✓",
    holdNfc: "خِت التلفون جنب الماكينة",
    nfcSub: "جاري إرسال تصريح السفرية المؤمن بالـ NFC...",
    litersLabel: "كمية لترات الجاز",
    quickFill: "أملأ التانك تب (٤٥٠ لتر)",
    customLiters: "دخل اللترات البتدورها (مثلاً: ١٥٠)",
    cameraGuide: "ثبت الكاميرا على عداد التابلون",
    cameraBtn: "طق صورة العداد لتأكيد الكيلو",
    reviewLiters: "الجاز المطلوب باللتر",
    reviewPrice: "سعر لتر الجاز الليلة",
    reviewTotal: "القروش المطلوبة كلها",
    reviewStation: "الطلمبة المعتمدة للرحلة",
    btnSubmit: "بصم وإرسال طلب الجاز طوالي",
    preAuthOk: "تأكيد بصمة السفرية: سليم تب ✓",
    receiptTitle: "قسيمة صرف الجاز المؤمنة",
    receiptApproved: "التصديق نزل من إدارة مُؤْكَا طوالي",
    receiptTx: "رقم قسيمة الصرف",
    receiptQrDesc: "أقرا باركود الـ QR ده فوق طلمبة الديزل عشان تبدأ التعبئة طوالي.",
    btnHome: "أرجع للرئيسية طوالي",
    preOdoLabel: "تم تسجيل صورة الكيلو قبل التعبئة",
    postOdoLabel: "تم تسجيل صورة الكيلو بعد التعبئة",
    fillTankQuick: "أملأ التانك كلو",
  }
};

export default function FuelTab({
  lang,
  isOnline,
  onAddTransaction,
  speakText,
  onNavigateHome
}: FuelTabProps) {
  const t = localization[lang] || localization.en;
  const isRTL = lang === "ar" || lang === "sd";

  const [step, setStep] = useState(1);
  const [selectedTruck, setSelectedTruck] = useState<typeof mockTrucks[0] | null>(null);
  
  // Handshake states
  const [nfcScanning, setNfcScanning] = useState(false);
  const [nfcSuccess, setNfcSuccess] = useState(false);

  // Liters state
  const [liters, setLiters] = useState("");
  const [odoReading, setOdoReading] = useState("");

  // Photo states
  const [capturingPhoto, setCapturingPhoto] = useState(false);
  const [preOdoCaptured, setPreOdoCaptured] = useState(false);
  const [postOdoCaptured, setPostOdoCaptured] = useState(false);

  // Simulated ticket output
  const [ticketId, setTicketId] = useState("");

  const handleSelectTruck = (truck: typeof mockTrucks[0]) => {
    setSelectedTruck(truck);
    setOdoReading((truck.odo + 5).toString()); // suggest current odometer slightly higher
    speakText(`Selected ${truck.name}, plate ${truck.plate}. Proceeding to terminal handshake.`);
    setStep(2);
  };

  const handleNfcTrigger = () => {
    setNfcScanning(true);
    speakText("Hold your device steady close to the terminal. Handshake initiating.");
    setTimeout(() => {
      setNfcScanning(false);
      setNfcSuccess(true);
      speakText("NFC credentials verified. Hardware handshake completed successfully.");
      setTimeout(() => {
        setStep(3);
      }, 1000);
    }, 2000);
  };

  const handleQuickLiters = (amount: string) => {
    setLiters(amount);
    speakText(`Selected quick amount of ${amount} liters.`);
  };

  const handleCapturePhoto = (type: "PRE" | "POST") => {
    setCapturingPhoto(true);
    speakText("Camera shutter activated. Compliance photograph locked with coordinates.");
    setTimeout(() => {
      setCapturingPhoto(false);
      if (type === "PRE") {
        setPreOdoCaptured(true);
      } else {
        setPostOdoCaptured(true);
      }
      speakText("Photo captured and stored with cryptographic security checksum.");
    }, 1500);
  };

  const handleSubmitFuelFlow = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTruck || !liters || !odoReading || !preOdoCaptured || !postOdoCaptured) return;

    speakText("Submitting fuel ticket. Cross-checking compliance registers.");
    
    const voucherId = "F-VOUCH-" + Math.floor(100000 + Math.random() * 900000);
    setTicketId(voucherId);

    onAddTransaction({
      type: "fuel",
      details: `${liters}L Diesel - ${selectedTruck.plate} (Odo: ${odoReading} km)`
    });

    setStep(6);
  };

  return (
    <div className="space-y-4 font-sans text-white text-left" style={{ direction: isRTL ? "rtl" : "ltr" }}>
      
      {/* HEADER */}
      <div className="flex items-center gap-1.5 border-b border-slate-800 pb-2.5">
        {step > 1 && step < 6 && (
          <button 
            onClick={() => {
              setStep(prev => prev - 1);
              speakText(`Returned to step ${step - 1}`);
            }}
            className="p-1 hover:bg-slate-850 rounded text-slate-400 hover:text-white"
          >
            <ChevronLeft className={`w-4 h-4 ${isRTL ? "rotate-180" : ""}`} />
          </button>
        )}
        <h4 className="text-xs font-bold font-mono text-slate-300 uppercase tracking-wider">{t.title}</h4>
      </div>

      {/* STEP PROGRESS INDICATOR */}
      {step < 6 && (
        <div className="flex items-center justify-between text-[8px] font-mono text-slate-500 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-900">
          <span className={step === 1 ? "text-orange-400 font-bold" : "text-slate-450"}>1. ASSET</span>
          <ChevronRight className="w-2.5 h-2.5" />
          <span className={step === 2 ? "text-orange-400 font-bold" : "text-slate-450"}>2. NFC</span>
          <ChevronRight className="w-2.5 h-2.5" />
          <span className={step === 3 ? "text-orange-400 font-bold" : "text-slate-450"}>3. LITERS</span>
          <ChevronRight className="w-2.5 h-2.5" />
          <span className={step === 4 ? "text-orange-400 font-bold" : "text-slate-450"}>4. CAMERA</span>
          <ChevronRight className="w-2.5 h-2.5" />
          <span className={step === 5 ? "text-orange-400 font-bold" : "text-slate-450"}>5. REVIEW</span>
        </div>
      )}

      {/* STEP CONTENT SWITCHER */}
      <AnimatePresence mode="wait">
        
        {/* STEP 1: CHOOSE VEHICLE */}
        {step === 1 && (
          <motion.div 
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-3"
          >
            <span className="text-[10px] font-bold font-mono text-slate-400 uppercase tracking-widest pl-1">
              {t.step1}
            </span>

            <div className="space-y-2.5 overflow-y-auto max-h-[360px] pr-1">
              {mockTrucks.map((truck) => (
                <div 
                  key={truck.id}
                  onClick={() => handleSelectTruck(truck)}
                  className={`bg-slate-950 border rounded-2xl p-3 flex gap-3 cursor-pointer transition-all hover:border-orange-500/30 ${
                    selectedTruck?.id === truck.id ? "border-orange-500 bg-slate-900/40 shadow-lg" : "border-slate-850"
                  }`}
                >
                  <img 
                    src={truck.image} 
                    alt={truck.name} 
                    className="w-16 h-16 rounded-xl object-cover border border-slate-800 shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1 space-y-1 select-none">
                    <div className="flex justify-between items-start">
                      <h5 className="text-[11px] font-bold text-slate-200 font-mono leading-tight">{truck.name}</h5>
                      <span className="text-[8px] font-bold bg-slate-900 px-1.5 py-0.5 rounded text-orange-400 border border-slate-850 font-mono">
                        {truck.fuel}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-mono">{truck.plate}</p>
                    <div className="flex justify-between items-center text-[9px] text-slate-500 font-mono pt-1">
                      <span>Base: {truck.odo.toLocaleString()} km</span>
                      <span className="text-emerald-400 text-[10px] font-bold flex items-center gap-0.5">
                        {t.btnSelect}
                        <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* STEP 2: NFC HANDSHAKE */}
        {step === 2 && (
          <motion.div 
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4 text-center py-6"
          >
            <span className="text-[10px] font-bold font-mono text-slate-400 uppercase tracking-widest pl-1 block text-left">
              {t.step2}
            </span>

            <div className="my-8 flex flex-col items-center justify-center">
              <button
                onClick={handleNfcTrigger}
                disabled={nfcScanning || nfcSuccess}
                className={`relative w-28 h-28 rounded-full bg-slate-950 border flex items-center justify-center transition-all cursor-pointer shadow-2xl active:scale-95 ${
                  nfcSuccess ? "border-emerald-500 bg-emerald-500/10 text-emerald-400" : "border-slate-800 hover:border-orange-500/40 text-orange-400"
                }`}
              >
                {nfcScanning ? (
                  <RotateCw className="w-12 h-12 text-orange-500 animate-spin" />
                ) : nfcSuccess ? (
                  <Check className="w-14 h-14 text-emerald-400 animate-bounce" />
                ) : (
                  <Nfc className="w-12 h-12 text-orange-400 animate-pulse" />
                )}
                
                {/* Simulated antenna waves */}
                {!nfcSuccess && (
                  <div className="absolute -inset-4 rounded-full border border-orange-500/10 animate-ping opacity-30 pointer-events-none"></div>
                )}
              </button>

              <h5 className="text-xs font-bold text-slate-200 mt-5 font-mono">
                {nfcSuccess ? "VERIFIED ✓" : t.holdNfc}
              </h5>
              <p className="text-[10px] text-slate-500 px-6 mt-1.5 leading-normal">
                {nfcSubText(t.nfcSub, selectedTruck?.plate)}
              </p>
            </div>
          </motion.div>
        )}

        {/* STEP 3: INPUT FUEL AMOUNT */}
        {step === 3 && (
          <motion.div 
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <span className="text-[10px] font-bold font-mono text-slate-400 uppercase tracking-widest pl-1">
              {t.step3}
            </span>

            <div className="space-y-3 bg-slate-950 p-4 rounded-2xl border border-slate-850">
              
              {/* Liters input */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono font-bold uppercase text-slate-400">{t.litersLabel}</label>
                <div className="relative">
                  <input
                    type="number"
                    value={liters}
                    onChange={(e) => setLiters(e.target.value)}
                    placeholder="Liters (e.g., 120)"
                    className="w-full bg-slate-900 border border-slate-800 focus:border-orange-500 rounded-xl p-3 text-sm text-white font-mono focus:outline-none"
                    required
                  />
                  <span className="absolute right-3.5 top-3 text-xs font-bold text-slate-500 font-mono">L</span>
                </div>
              </div>

              {/* Quick choices */}
              <div className="grid grid-cols-3 gap-2 pt-1.5">
                {["50", "120", "200"].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => handleQuickLiters(amt)}
                    className={`py-2 px-1 border rounded-lg text-[10px] font-mono font-bold transition-all active:scale-95 cursor-pointer ${
                      liters === amt 
                        ? "bg-orange-500 text-slate-950 border-orange-500 shadow-md" 
                        : "bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-750"
                    }`}
                  >
                    {amt}L
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => handleQuickLiters("450")}
                className={`w-full py-2.5 border rounded-lg text-[10px] font-mono font-bold transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1 bg-gradient-to-r ${
                  liters === "450"
                    ? "from-orange-500 to-amber-500 text-slate-950 border-orange-500 shadow-md"
                    : "from-slate-900 to-slate-950 border-slate-800 text-slate-300 hover:border-slate-750"
                }`}
              >
                <Truck className="w-3.5 h-3.5" />
                <span>{t.quickFill}</span>
              </button>

            </div>

            <button
              onClick={() => {
                if (liters) {
                  setStep(4);
                  speakText("Liters amount saved. Proceeding to odometer validation scans.");
                }
              }}
              disabled={!liters}
              className="w-full p-3 bg-orange-500 disabled:bg-slate-800 text-slate-950 disabled:text-slate-550 font-mono font-bold text-xs rounded-xl shadow-lg transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>CONTINUE</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {/* STEP 4: ODOMETER COMPLIANCE PHOTO */}
        {step === 4 && (
          <motion.div 
            key="step4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <span className="text-[10px] font-bold font-mono text-slate-400 uppercase tracking-widest pl-1">
              {t.step4}
            </span>

            <div className="space-y-3">
              <div className="space-y-1 bg-slate-950 p-3.5 rounded-xl border border-slate-850">
                <label className="text-[10px] text-slate-400 block font-mono font-bold uppercase">Manual Odometer Value (km)</label>
                <input
                  type="number"
                  value={odoReading}
                  onChange={(e) => setOdoReading(e.target.value)}
                  placeholder="e.g., 142855"
                  className="w-full bg-slate-900 border border-slate-800 focus:border-orange-500 rounded-xl p-3 text-xs text-white font-mono focus:outline-none"
                  required
                />
              </div>

              {/* CAMERA VIEWFINDER OVERLAY */}
              <div className="relative aspect-video rounded-2xl bg-slate-950 border border-slate-850 overflow-hidden shadow-inner flex items-center justify-center p-4">
                
                {/* Viewfinder crosshairs */}
                <div className="absolute inset-x-8 inset-y-5 border border-dashed border-emerald-500/20 rounded-xl pointer-events-none flex items-center justify-center">
                  <div className="w-40 h-10 border-2 border-emerald-500/60 rounded flex items-center justify-center animate-pulse">
                    <span className="text-[8px] font-mono text-emerald-400 font-bold uppercase tracking-widest">
                      {capturingPhoto ? "PROCESSING SCAN..." : "ALIGN ODO BOX"}
                    </span>
                  </div>
                </div>

                {/* Shutter Loading Ring */}
                {capturingPhoto ? (
                  <div className="flex flex-col items-center gap-2 z-10 text-emerald-400 font-mono text-[10px]">
                    <RotateCw className="w-8 h-8 animate-spin" />
                    <span>SECURE SHUTTER...</span>
                  </div>
                ) : (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center pointer-events-none">
                    <Camera className="w-8 h-8 text-slate-600 animate-pulse" />
                  </div>
                )}

                {/* Coordinates Watermark */}
                <span className="absolute bottom-2 left-3 font-mono text-[7px] text-slate-500 tracking-wider">
                  LAT: 21.4858° N | LNG: 39.1860° E | UTC 2026-07-20
                </span>
              </div>

              {/* Photo triggers */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleCapturePhoto("PRE")}
                  disabled={capturingPhoto}
                  className={`p-2.5 rounded-xl border text-[9px] font-mono font-bold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                    preOdoCaptured 
                      ? "bg-slate-950 border-emerald-500/50 text-emerald-400" 
                      : "bg-slate-950 border-slate-850 text-slate-400 hover:border-slate-800"
                  }`}
                >
                  <Camera className="w-4 h-4 text-orange-400" />
                  <span className="line-clamp-1">{preOdoCaptured ? "PRE-ODO CAPTURED ✓" : t.preOdoLabel}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleCapturePhoto("POST")}
                  disabled={capturingPhoto}
                  className={`p-2.5 rounded-xl border text-[9px] font-mono font-bold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                    postOdoCaptured 
                      ? "bg-slate-950 border-emerald-500/50 text-emerald-400" 
                      : "bg-slate-950 border-slate-850 text-slate-400 hover:border-slate-800"
                  }`}
                >
                  <Camera className="w-4 h-4 text-orange-400" />
                  <span className="line-clamp-1">{postOdoCaptured ? "POST-ODO CAPTURED ✓" : t.postOdoLabel}</span>
                </button>
              </div>

            </div>

            <button
              onClick={() => {
                if (odoReading && preOdoCaptured && postOdoCaptured) {
                  setStep(5);
                  speakText("Photos locked with coordinates metadata. Proceeding to final ledger checkout.");
                }
              }}
              disabled={!odoReading || !preOdoCaptured || !postOdoCaptured}
              className="w-full p-3 bg-orange-500 disabled:bg-slate-800 text-slate-950 disabled:text-slate-550 font-mono font-bold text-xs rounded-xl shadow-lg transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>CONTINUE</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {/* STEP 5: REVIEW AND COMMIT */}
        {step === 5 && (
          <motion.div 
            key="step5"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <span className="text-[10px] font-bold font-mono text-slate-400 uppercase tracking-widest pl-1">
              {t.step5}
            </span>

            <div className="bg-slate-950 border border-slate-850 rounded-2xl p-4 space-y-3 font-mono text-xs">
              
              <div className="flex justify-between items-center text-[10px] border-b border-slate-900 pb-2">
                <span className="text-slate-500">TRUCK REGISTRY</span>
                <span className="text-white font-bold">{selectedTruck?.name}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-sans">{t.reviewLiters}</span>
                <span className="text-orange-400 font-bold">{liters} L</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-sans">{t.reviewPrice}</span>
                <span className="text-slate-300">1.15 SAR / L</span>
              </div>

              <div className="flex justify-between items-center border-b border-slate-900 pb-2">
                <span className="text-slate-500 font-sans">{t.reviewStation}</span>
                <span className="text-slate-300">SASCO Highway Express</span>
              </div>

              <div className="flex justify-between items-center pt-1 text-sm">
                <span className="text-slate-400 font-sans font-bold">{t.reviewTotal}</span>
                <span className="text-emerald-400 font-extrabold">{(parseFloat(liters) * 1.15).toFixed(2)} SAR</span>
              </div>

              <div className="mt-3 bg-emerald-500/5 px-2.5 py-2 rounded-lg border border-emerald-500/10 flex items-center gap-1.5 text-[9px] text-emerald-400 font-bold uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>{t.preAuthOk}</span>
              </div>

            </div>

            <button
              onClick={handleSubmitFuelFlow}
              className="w-full p-3 bg-emerald-500 text-slate-950 font-mono font-bold text-xs rounded-xl shadow-lg transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <CheckCircle className="w-4 h-4" />
              <span>{t.btnSubmit}</span>
            </button>
          </motion.div>
        )}

        {/* STEP 6: FINAL CONFIRMATION */}
        {step === 6 && (
          <motion.div 
            key="step6"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-4 text-center py-2"
          >
            
            {/* INVOICE DESIGN */}
            <div className="bg-white text-slate-800 rounded-3xl p-4 shadow-2xl border-4 border-slate-100 flex flex-col items-center relative overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-orange-500 to-amber-500" />
              
              <div className="w-10 h-10 rounded-full bg-emerald-50 border-4 border-white flex items-center justify-center text-emerald-500 shadow-md mt-1 animate-bounce">
                <Check className="w-5 h-5 text-emerald-500" />
              </div>

              <h4 className="text-[11px] font-bold tracking-widest text-slate-400 font-mono mt-2.5 uppercase">{t.receiptTitle}</h4>
              <p className="text-[8px] font-mono text-slate-400 mt-0.5 uppercase tracking-wider font-extrabold">{t.receiptApproved}</p>

              {/* Receipt Body */}
              <div className="w-full space-y-2 mt-4 text-[10px] font-mono border-t border-dashed border-slate-200 pt-4 text-left">
                
                <div className="flex justify-between">
                  <span className="text-slate-450 font-sans">Voucher Ticket ID</span>
                  <span className="text-slate-800 font-bold font-mono">{ticketId || "FV-1284-A"}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-450 font-sans">Authorized Asset</span>
                  <span className="text-slate-800 font-semibold">{selectedTruck?.plate}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-450 font-sans">Volume Dispatched</span>
                  <span className="text-slate-800 font-bold">{liters} Liters</span>
                </div>

                <div className="flex justify-between border-b border-dashed border-slate-200 pb-2">
                  <span className="text-slate-450 font-sans">Dispatch Time</span>
                  <span className="text-slate-800">2026-07-20 10:42 UTC</span>
                </div>

                <div className="flex justify-between pt-1 text-xs">
                  <span className="text-slate-550 font-bold font-sans">Total Authorized</span>
                  <span className="text-slate-900 font-extrabold">{(parseFloat(liters) * 1.15).toFixed(2)} SAR</span>
                </div>

              </div>

              {/* QR CODE COUPLER */}
              <div className="bg-slate-50 border border-slate-200 p-3 rounded-2xl flex flex-col items-center gap-2 mt-4 w-full">
                <QrCode className="w-20 h-20 text-slate-800" />
                <p className="text-[8px] text-slate-500 leading-normal px-2 text-center font-sans">
                  {t.receiptQrDesc}
                </p>
              </div>

            </div>

            <button
              onClick={() => {
                setStep(1);
                setSelectedTruck(null);
                setLiters("");
                setPreOdoCaptured(false);
                setPostOdoCaptured(false);
                onNavigateHome();
                speakText("Process closed. Welcome back to Home screen.");
              }}
              className="w-full p-3 bg-slate-950 border border-slate-850 hover:border-slate-800 text-white font-mono font-bold text-xs rounded-xl transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>{t.btnHome}</span>
            </button>

          </motion.div>
        )}

      </AnimatePresence>

    </div>
  );
}

// Helper to render customized text safely
function nfcSubText(baseText: string, plate?: string) {
  if (!plate) return baseText;
  return baseText.replace("badge", plate);
}
