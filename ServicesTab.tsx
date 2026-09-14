import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  format, addDays, startOfToday 
} from "date-fns";
import { 
  Settings, Sparkles, Shield, AlertTriangle, Play, ChevronRight, 
  MapPin, Calendar, Clock, Check, Star, X, Hammer, ShieldCheck, HeartPulse 
} from "lucide-react";

interface ServicesTabProps {
  lang: "en" | "ar" | "sd";
  isOnline: boolean;
  speakText: (text: string) => void;
  onAddTransaction: (tx: {
    type: "fuel" | "expense";
    details: string;
  }) => void;
}

const partnerServices = [
  {
    id: "serv-wash",
    title: { en: "Fleet Eco-Wash & Sanitizer", ar: "مغسلة الأسطول والتعقيم الصديقة للبيئة", sd: "غسيل ونظافة اللوري تب" },
    icon: Sparkles,
    color: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    rating: "4.9",
    category: { en: "Wash", ar: "مغسلة", sd: "غسيل" },
    desc: {
      en: "Full external diesel-grade wash, deep cab steam sanitization & chassis cleanup.",
      ar: "غسيل خارجي كامل لمركبات النقل الثقيل، تعقيم داخلي عميق بالبخار للمقصورة وتنظيف الهيكل السفلي.",
      sd: "غسيل كامل للوري من برة وجوة، تنظيف كابينة السواقة بالبخار ومسح الصدأ."
    }
  },
  {
    id: "serv-tire",
    title: { en: "Bridgestone Corridor Hub", ar: "مركز بريدجستون لمطابقة الإطارات", sd: "تبديل ورقع لساتك اللوري" },
    icon: Hammer,
    color: "text-orange-400 bg-orange-500/10 border-orange-500/20",
    rating: "4.8",
    category: { en: "Tires", ar: "إطارات", sd: "لستك" },
    desc: {
      en: "Tread depth audit, electronic wheel balance, custom heavy-duty tire replacements.",
      ar: "فحص عمق مداس الإطار، موازنة العجلات الإلكترونية، تبديل الإطارات المخصصة للمسافات البعيدة.",
      sd: "فحص ضغط اللساتك وتغيير اللستك الخربان بلستك جديد مخصص لسفريات الممر الطويلة."
    }
  },
  {
    id: "serv-engine",
    title: { en: "Al-Riyadh Diesel Repair", ar: "الرياض لصيانة محركات الديزل", sd: "ورشة الرياض لتصليح المكنات" },
    icon: Settings,
    color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    rating: "4.9",
    category: { en: "Maintenance", ar: "ميكانيكا", sd: "ميكانيكي" },
    desc: {
      en: "Preventive oil injector audit, thermal efficiency logs tuneup, fuel line diagnostics.",
      ar: "الصيانة الدورية الوقائية للبخاخات، تعديل كفاءة الاحتراق الحراري، وفحص نظام ضخ الوقود.",
      sd: "فحص مكنة الديزل، تنظيف بخاخات الجاز، وتصليح السيور عشان تمشي السفرية بدون عطل."
    }
  },
  {
    id: "serv-brake",
    title: { en: "Brembo Premium Brake Stop", ar: "مركز بريمبو لسلامة المكابح", sd: "مركز بريمبو لتصليح الفرامل" },
    icon: HeartPulse,
    color: "text-rose-400 bg-rose-500/10 border-rose-500/20",
    rating: "4.7",
    category: { en: "Brakes", ar: "فرامل", sd: "فرملة" },
    desc: {
      en: "Pneumatic cylinder inspection, heavy pad replacement & braking efficiency log audit.",
      ar: "مراقبة وفحص الأسطوانات الهوائية، تغيير الفحمات الثقيلة، والتحقق من كفاءة المكابح الرقمية.",
      sd: "تربيط وصيانة فرامل الهواء للوري الشاحنة الكبيرة وتغيير تيل الفرامل لحماية السفرية."
    }
  }
];

const mockSlots = [
  "08:30 AM", "10:00 AM", "11:30 AM", "01:00 PM", "02:30 PM", "04:00 PM"
];

const localization = {
  en: {
    header: "Authorized Fleet Services",
    sub: "Book preventative maintenance or cleaning services at vetted highway terminals.",
    rating: "Rating",
    btnBook: "Book Terminal Slot",
    bookingTitle: "Book Appointment",
    chooseDate: "1. Select Day",
    chooseSlot: "2. Choose Hours",
    confirmBtn: "Confirm Reservation",
    bookingSuccess: "Appointment Booked Successfully!",
    ticketId: "Appointment Pass ID",
    bClose: "Close Window",
    horizontalScroll: "Available Services",
  },
  ar: {
    header: "خدمات الأسطول المعتمدة",
    sub: "احجز خدمات الصيانة الوقائية أو الغسيل للأسطول في محطات الخدمة المعتمدة بالممر.",
    rating: "التقييم",
    btnBook: "حجز موعد الخدمة",
    bookingTitle: "حجز موعد جديد بالمركبة",
    chooseDate: "١. اختر اليوم المناسب",
    chooseSlot: "٢. حدد الساعة",
    confirmBtn: "تأكيد وإصدار التصريح",
    bookingSuccess: "تم حجز موعد الخدمة بنجاح!",
    ticketId: "رقم تصريح الخدمة",
    bClose: "إغلاق النافذة",
    horizontalScroll: "الخدمات المتاحة",
  },
  sd: {
    header: "ورش وتصليح اللواري المعتمدة",
    sub: "أحجز موعد نظافة أو تصليح للوري بتاعك في الورش المعتمدة على طول طريق السفر.",
    rating: "التقييم والنجوم",
    btnBook: "أحجز موعد طوالي",
    bookingTitle: "أحجز موعد مع الورشة",
    chooseDate: "١. أختار اليوم المناسب",
    chooseSlot: "٢. أختار زمن الحضور",
    confirmBtn: "أبصم وأكد الحجز",
    bookingSuccess: "تم حجز موعد التصليح بنجاح!",
    ticketId: "رقم بطاقة تصريح الورشة",
    bClose: "إغلاق النافذة",
    horizontalScroll: "الخدمات المتاحة",
  }
};

export default function ServicesTab({
  lang,
  isOnline,
  speakText,
  onAddTransaction
}: ServicesTabProps) {
  const t = localization[lang] || localization.en;
  const isRTL = lang === "ar" || lang === "sd";

  const [selectedService, setSelectedService] = useState<typeof partnerServices[0] | null>(null);
  const [bookingModal, setBookingModal] = useState(false);
  
  // date-fns operations to construct next 3 days
  const today = startOfToday();
  const dateOptions = [
    today,
    addDays(today, 1),
    addDays(today, 2)
  ];

  const [activeDate, setActiveDate] = useState(dateOptions[0]);
  const [activeSlot, setActiveSlot] = useState(mockSlots[0]);
  const [bookedReceipt, setBookedReceipt] = useState<any | null>(null);

  const handleOpenBooking = (service: typeof partnerServices[0]) => {
    setSelectedService(service);
    setBookingModal(true);
    setBookedReceipt(null);
    speakText(`Opening terminal schedule booking for ${service.title[lang]}. Choose your target day.`);
  };

  const handleConfirmBooking = () => {
    if (!selectedService) return;

    const formattedDate = format(activeDate, "eeee, MMM dd");
    speakText(`Confirming schedule reservation for ${formattedDate} at ${activeSlot}. Updating ledger.`);

    const receipt = {
      id: "SERV-PASS-" + Math.floor(100000 + Math.random() * 900000),
      serviceTitle: selectedService.title[lang],
      date: formattedDate,
      time: activeSlot,
      station: "SASCO MOKA Core Depot - Sawakin Highway Gate 2"
    };

    // Log to transaction center as local action
    onAddTransaction({
      type: "expense",
      details: `Booked: ${selectedService.title[lang]} - ${formattedDate} at ${activeSlot}`
    });

    setBookedReceipt(receipt);
    speakText("Terminal booking authorized! Digital pass coupon dispatched successfully.");
  };

  return (
    <div className="space-y-4 font-sans text-white text-left animate-fade-in" style={{ direction: isRTL ? "rtl" : "ltr" }}>
      
      {/* HEADER BANNERS */}
      <div className="space-y-1">
        <h4 className="text-sm font-bold text-slate-100">{t.header}</h4>
        <p className="text-[10px] text-slate-400 leading-normal">{t.sub}</p>
      </div>

      {/* HORIZONTAL SCROLL REEL */}
      <div className="space-y-1.5">
        <h5 className="text-[9px] font-bold font-mono text-slate-400 uppercase tracking-widest pl-1">{t.horizontalScroll}</h5>
        
        <div className="flex gap-3 overflow-x-auto pb-3 pt-0.5 snap-x scrollbar-thin">
          {partnerServices.map((service) => {
            const IconComp = service.icon;
            return (
              <div 
                key={service.id}
                onClick={() => handleOpenBooking(service)}
                className="bg-slate-950 border border-slate-850 hover:border-orange-500/30 p-3 rounded-2xl w-[200px] shrink-0 snap-start flex flex-col justify-between h-[165px] transition-all cursor-pointer shadow-md select-none"
              >
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className={`p-1.5 rounded-lg border text-[10px] font-mono ${service.color}`}>
                      <IconComp className="w-4 h-4" />
                    </span>
                    <span className="text-[9px] text-amber-400 font-bold font-mono flex items-center gap-0.5 bg-amber-500/5 px-1 rounded">
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                      {service.rating}
                    </span>
                  </div>
                  <h5 className="text-[10px] font-bold text-slate-200 line-clamp-1 font-sans">{service.title[lang]}</h5>
                  <p className="text-[9px] text-slate-500 leading-relaxed line-clamp-3 font-sans">
                    {service.desc[lang]}
                  </p>
                </div>

                <div className="flex justify-between items-center text-[8px] font-mono border-t border-slate-900 pt-2 mt-1 text-slate-400">
                  <span>{service.category[lang]}</span>
                  <span className="text-orange-400 font-bold flex items-center gap-0.5">
                    {t.btnBook} →
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* DETAILED BOOKING DIALOG MODAL */}
      <AnimatePresence>
        {bookingModal && selectedService && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 rounded-[30px] p-5 w-full max-w-[340px] shadow-2xl relative space-y-4 text-left text-white"
              style={{ direction: isRTL ? "rtl" : "ltr" }}
            >
              
              {/* Close Button */}
              <button 
                onClick={() => {
                  setBookingModal(false);
                  speakText("Booking menu closed.");
                }}
                className="absolute top-4 right-4 text-slate-400 hover:text-white"
              >
                <X className="w-4.5 h-4.5" />
              </button>

              {!bookedReceipt ? (
                <>
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold font-mono text-orange-400 uppercase tracking-widest">{t.bookingTitle}</span>
                    <h4 className="text-xs font-bold text-slate-100 font-sans leading-tight pr-6">{selectedService.title[lang]}</h4>
                  </div>

                  {/* Date selection row (date-fns powered) */}
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-mono font-bold uppercase text-slate-400">{t.chooseDate}</label>
                    <div className="grid grid-cols-3 gap-2">
                      {dateOptions.map((date, idx) => {
                        const isSelected = activeDate.getTime() === date.getTime();
                        return (
                          <button
                            key={idx}
                            onClick={() => {
                              setActiveDate(date);
                              speakText(`Date set to ${format(date, "eeee, MMM dd")}`);
                            }}
                            className={`py-2 px-1 rounded-xl border text-center transition-all cursor-pointer ${
                              isSelected 
                                ? "bg-orange-500 text-slate-950 border-orange-500 shadow-md scale-102" 
                                : "bg-slate-950 border-slate-850 text-slate-300 hover:border-slate-800"
                            }`}
                          >
                            <span className="text-[8px] font-bold block uppercase font-mono">{format(date, "eee")}</span>
                            <span className="text-[10px] font-extrabold block font-mono mt-0.5">{format(date, "d")}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Slot hours selection */}
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-mono font-bold uppercase text-slate-400">{t.chooseSlot}</label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {mockSlots.map((slot) => {
                        const isSelected = activeSlot === slot;
                        return (
                          <button
                            key={slot}
                            onClick={() => {
                              setActiveSlot(slot);
                              speakText(`Slot hour set to ${slot}`);
                            }}
                            className={`py-1 px-1 rounded-lg border text-[8px] font-mono font-bold transition-all cursor-pointer ${
                              isSelected 
                                ? "bg-orange-500 text-slate-950 border-orange-500" 
                                : "bg-slate-950 border-slate-850 text-slate-400 hover:border-slate-800"
                            }`}
                          >
                            {slot}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Confirm Button */}
                  <button
                    onClick={handleConfirmBooking}
                    className="w-full py-2.5 bg-emerald-500 text-slate-950 font-mono font-bold text-xs rounded-xl shadow-lg transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>{t.confirmBtn}</span>
                  </button>
                </>
              ) : (
                /* SUCCESS TICKET SCREEN */
                <div className="text-center space-y-4 py-2">
                  <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400 mx-auto animate-bounce">
                    <ShieldCheck className="w-6 h-6" />
                  </div>

                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-slate-200">{t.bookingSuccess}</h4>
                    <p className="text-[9px] text-slate-450 uppercase font-mono tracking-wider">{bookedReceipt.serviceTitle}</p>
                  </div>

                  <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-850 space-y-2 text-left font-mono text-[9px] text-slate-300">
                    <div className="flex justify-between">
                      <span className="text-slate-500">{t.ticketId}</span>
                      <span className="text-emerald-400 font-bold">{bookedReceipt.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Scheduled Date</span>
                      <span className="text-white font-bold">{bookedReceipt.date}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Scheduled Hour</span>
                      <span className="text-white font-bold">{bookedReceipt.time}</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-900 pt-2 mt-1">
                      <span className="text-slate-500">Terminal Address</span>
                      <span className="text-slate-300 font-sans text-right leading-normal truncate max-w-[120px]">{bookedReceipt.station}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setBookingModal(false);
                      speakText("Booking ticket window closed.");
                    }}
                    className="w-full py-2.5 bg-slate-950 border border-slate-800 text-white font-mono font-bold text-xs rounded-xl transition-all active:scale-95 cursor-pointer"
                  >
                    {t.bClose}
                  </button>
                </div>
              )}

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
