import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  User, Shield, FileText, Settings, Volume2, Languages, Lock, 
  MapPin, Eye, X, CheckSquare, Sparkles, FileSpreadsheet, BadgeAlert 
} from "lucide-react";

interface ProfileTabProps {
  lang: "en" | "ar" | "sd";
  accessibilityMode: boolean;
  onToggleAccessibility: () => void;
  onLanguageChange: (lang: "en" | "ar" | "sd") => void;
  speakText: (text: string) => void;
}

const localization = {
  en: {
    badgeStatus: "ACTIVE ON DUTY",
    employeeId: "Driver ID: #MOKA-9942",
    docWallet: "SECURE DOCUMENT WALLET",
    settingsTitle: "SUPER APP PREFERENCES",
    voiceAssist: "Voice Narrator (TalkBack)",
    voiceAssistDesc: "Enable tactile safety audio synthesis.",
    biometricLock: "Biometric Login Bypass",
    biometricDesc: "Use FaceID or PIN for immediate startup.",
    docVisa: "Saudi Work Visa (Class C)",
    docLicense: "Sudanese Commercial License",
    docHealth: "Border Sanitary Pass",
    docInsurance: "Truck Carrier Insurance Policy",
    docExpiry: "Expires:",
    btnView: "View Doc",
    bClose: "Dismiss",
  },
  ar: {
    badgeStatus: "نشط بالخدمة حالياً",
    employeeId: "رقم السائق: #موكا-٩٩٤٢",
    docWallet: "محفظة الوثائق والمستندات المؤمنة",
    settingsTitle: "إعدادات التطبيق الفائقة",
    voiceAssist: "القارئ الصوتي (TalkBack)",
    voiceAssistDesc: "تفعيل النطق الصوتي التفاعلي للسلامة.",
    biometricLock: "الدخول السريع ببصمة الوجه",
    biometricDesc: "استخدم التعرف الحيوي لتخطي شاشة تسجيل الدخول.",
    docVisa: "تأشيرة العمل السعودية (فئة ج)",
    docLicense: "رخصة قيادة نقل ثقيل سودانية",
    docHealth: "التصريح الصحي للعبور الجمركي",
    docInsurance: "بوليصة تأمين ناقلات الشحن",
    docExpiry: "تاريخ الانتهاء:",
    btnView: "عرض الوثيقة",
    bClose: "إغلاق النافذة",
  },
  sd: {
    badgeStatus: "شغال ومسافر الليلة",
    employeeId: "رقم لوري موكا: #موكا-٩٩٤٢",
    docWallet: "جراب ورق اللوري والجمارك",
    settingsTitle: "إعدادات اللوري والتلفون",
    voiceAssist: "المرشد الصوتي للتلفون",
    voiceAssistDesc: "تشغيل النطق الآلي لمساعدتك أثناء القيادة.",
    biometricLock: "بصمة وش السائق طوالي",
    biometricDesc: "أفتح التلفون بوشك بدون كود وباسورد.",
    docVisa: "تأشيرة العمل في أراضي السعودية",
    docLicense: "رخصتك التجارية السودانية للنقل",
    docHealth: "شهادة الصحة والجمارك المؤمنة",
    docInsurance: "تأمين لوري النقل والشركة",
    docExpiry: "بينتهي في:",
    btnView: "أكشف الورقة",
    bClose: "إغلاق النافذة",
  }
};

const mockDocs = [
  { id: "doc-visa", key: "docVisa", code: "SA-VIS-1192", expiry: "2027-11-20", issuer: "KSA Ministry of Foreign Affairs", barcode: "||||||||||||||| 1192" },
  { id: "doc-license", key: "docLicense", code: "SUD-CL-8842", expiry: "2029-04-12", issuer: "Sudan Traffic Police Dept", barcode: "||||||||||||||| 8842" },
  { id: "doc-health", key: "docHealth", code: "BHP-PASS-44", expiry: "2026-12-30", issuer: "Sawakin Port Quarantine Agency", barcode: "||||||||||||||| BH44" },
  { id: "doc-insurance", key: "docInsurance", code: "INS-TRK-990", expiry: "2027-02-15", issuer: "Tawuniya Insurance Group", barcode: "||||||||||||||| IN99" }
];

export default function ProfileTab({
  lang,
  accessibilityMode,
  onToggleAccessibility,
  onLanguageChange,
  speakText
}: ProfileTabProps) {
  const t = localization[lang] || localization.en;
  const isRTL = lang === "ar" || lang === "sd";

  const [selectedDoc, setSelectedDoc] = useState<any | null>(null);
  const [docModal, setDocModal] = useState(false);
  const [biometricsEnabled, setBiometricsEnabled] = useState(true);

  const handleOpenDoc = (doc: any) => {
    setSelectedDoc(doc);
    setDocModal(true);
    speakText(`Opening digital secure copy of ${t[doc.key as keyof typeof t] || doc.id}. Verification status is authentic.`);
  };

  return (
    <div className="space-y-4 font-sans text-white text-left animate-fade-in" style={{ direction: isRTL ? "rtl" : "ltr" }}>
      
      {/* 1. DIGITAL DRIVER ID BADGE */}
      <div className="bg-slate-950 border border-slate-850 rounded-3xl p-4 flex gap-3.5 items-center relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 p-8 bg-gradient-to-bl from-orange-500/5 to-transparent pointer-events-none rounded-full" />
        
        {/* Avatar Image Placeholder */}
        <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-orange-600 to-amber-400 p-0.5 shrink-0 shadow-md">
          <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-white font-bold text-lg border border-slate-950">
            AH
          </div>
        </div>

        <div className="space-y-1">
          <span className="text-[7px] font-bold font-mono text-emerald-400 tracking-wider bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/15">
            {t.badgeStatus}
          </span>
          <h4 className="text-sm font-extrabold text-slate-100 font-sans mt-1">Ahmed Al-Sudani</h4>
          <span className="text-[9px] text-slate-500 font-mono block">{t.employeeId}</span>
        </div>
      </div>

      {/* 2. DOCUMENT SECURE WALLET */}
      <div className="space-y-1.5">
        <h5 className="text-[9px] font-bold font-mono text-slate-400 uppercase tracking-widest pl-1">
          {t.docWallet}
        </h5>

        <div className="grid grid-cols-2 gap-2">
          {mockDocs.map((doc) => {
            const labelText = t[doc.key as keyof typeof t] as string;
            return (
              <div 
                key={doc.id}
                onClick={() => handleOpenDoc(doc)}
                className="bg-slate-950 border border-slate-900 hover:border-orange-500/30 p-2.5 rounded-2xl flex flex-col justify-between h-[82px] cursor-pointer transition-all hover:scale-[1.01] shadow-md select-none"
              >
                <div className="flex justify-between items-start">
                  <FileText className="w-4 h-4 text-orange-400" />
                  <span className="text-[7px] font-mono text-slate-600">ID: {doc.code}</span>
                </div>
                <h6 className="text-[9px] font-bold text-slate-200 leading-tight line-clamp-2 pt-1 font-sans">{labelText}</h6>
                <div className="flex justify-between items-center text-[7px] font-mono text-slate-500 border-t border-slate-900 pt-1 mt-1">
                  <span>{t.docExpiry} {doc.expiry}</span>
                  <span className="text-orange-400 font-bold">{t.btnView}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. SETTINGS & PREFERENCES */}
      <div className="space-y-1.5">
        <h5 className="text-[9px] font-bold font-mono text-slate-400 uppercase tracking-widest pl-1">
          {t.settingsTitle}
        </h5>

        <div className="bg-slate-950 border border-slate-850 rounded-2xl p-3 space-y-3.5 shadow-md">
          
          {/* Narrator switch */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5 max-w-[210px]">
              <div className="flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-orange-400" />
                <span className="text-[10px] font-bold text-slate-200 font-sans">{t.voiceAssist}</span>
              </div>
              <p className="text-[8px] text-slate-500 leading-normal font-sans">{t.voiceAssistDesc}</p>
            </div>
            <button
              onClick={() => {
                onToggleAccessibility();
                speakText(`Narrator state modified: ${!accessibilityMode ? "activated" : "deactivated"}`);
              }}
              className={`w-10 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${
                accessibilityMode ? "bg-orange-500" : "bg-slate-800"
              }`}
            >
              <div className={`w-4 h-4 rounded-full bg-white transition-transform transform ${
                accessibilityMode ? (isRTL ? "-translate-x-5" : "translate-x-5") : "translate-x-0"
              }`} />
            </button>
          </div>

          {/* Biometrics switch */}
          <div className="flex items-center justify-between border-t border-slate-900 pt-3">
            <div className="space-y-0.5 max-w-[210px]">
              <div className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-orange-400" />
                <span className="text-[10px] font-bold text-slate-200 font-sans">{t.biometricLock}</span>
              </div>
              <p className="text-[8px] text-slate-500 leading-normal font-sans">{t.biometricDesc}</p>
            </div>
            <button
              onClick={() => {
                const nextBiometrics = !biometricsEnabled;
                setBiometricsEnabled(nextBiometrics);
                speakText(`Biometric unlock preference: ${nextBiometrics ? "active" : "disabled"}`);
              }}
              className={`w-10 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${
                biometricsEnabled ? "bg-orange-500" : "bg-slate-800"
              }`}
            >
              <div className={`w-4 h-4 rounded-full bg-white transition-transform transform ${
                biometricsEnabled ? (isRTL ? "-translate-x-5" : "translate-x-5") : "translate-x-0"
              }`} />
            </button>
          </div>

          {/* Language picker row */}
          <div className="flex items-center justify-between border-t border-slate-900 pt-3">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5">
                <Languages className="w-3.5 h-3.5 text-orange-400" />
                <span className="text-[10px] font-bold text-slate-200 font-sans">Super App Language</span>
              </div>
              <p className="text-[8px] text-slate-500 leading-normal font-sans">English, Standard Arabic, or Sudanese لهجة سودانية.</p>
            </div>

            <select
              value={lang}
              onChange={(e) => {
                onLanguageChange(e.target.value as any);
                speakText(`App interface translated to ${e.target.value === "sd" ? "Sudanese Dialect" : e.target.value === "ar" ? "Standard Arabic" : "English"}`);
              }}
              className="bg-slate-900 border border-slate-800 text-white font-mono text-[9px] font-bold p-1 rounded-md focus:outline-none cursor-pointer"
            >
              <option value="en">English</option>
              <option value="ar">العربية</option>
              <option value="sd">سودانية</option>
            </select>
          </div>

        </div>
      </div>

      {/* DOCUMENT PREVIEW DIALOG MODAL */}
      <AnimatePresence>
        {docModal && selectedDoc && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 rounded-[30px] p-5 w-full max-w-[340px] shadow-2xl relative space-y-4 text-center text-white"
              style={{ direction: isRTL ? "rtl" : "ltr" }}
            >
              <button 
                onClick={() => setDocModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white"
              >
                <X className="w-4.5 h-4.5" />
              </button>

              <div className="space-y-1 text-center">
                <Shield className="w-10 h-10 text-orange-400 mx-auto animate-pulse" />
                <h4 className="text-xs font-bold text-slate-100 font-sans pt-1.5">{t[selectedDoc.key as keyof typeof t] as string}</h4>
                <p className="text-[9px] font-mono text-slate-500 uppercase">{selectedDoc.issuer}</p>
              </div>

              {/* Secure hologram card frame */}
              <div className="bg-white text-slate-800 p-4 rounded-2xl text-left font-mono text-[9px] border-4 border-slate-150 space-y-2.5 relative">
                <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-emerald-500 text-white text-[7px] font-bold rounded uppercase tracking-wider">
                  VERIFIED ✓
                </div>
                <div>
                  <span className="text-slate-400 text-[8px] font-sans">DOCUMENT REGISTRY CODE</span>
                  <p className="text-slate-800 font-bold">{selectedDoc.code}</p>
                </div>
                <div>
                  <span className="text-slate-400 text-[8px] font-sans">EXPIRY DATE TIMESTEP</span>
                  <p className="text-slate-800 font-bold">{selectedDoc.expiry}</p>
                </div>
                <div className="pt-2 border-t border-dashed border-slate-200 flex flex-col items-center">
                  <span className="text-slate-600 font-sans text-[7px] tracking-widest">{selectedDoc.barcode}</span>
                  <span className="text-[7px] text-slate-400 mt-1 uppercase">MOKA BORDER GATEPASS CONVENANT</span>
                </div>
              </div>

              <button
                onClick={() => setDocModal(false)}
                className="w-full py-2.5 bg-slate-950 border border-slate-800 text-white font-mono font-bold text-xs rounded-xl transition-all active:scale-95 cursor-pointer"
              >
                {t.bClose}
              </button>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
