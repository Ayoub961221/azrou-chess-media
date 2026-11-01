import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import PageShell from "@/components/common/PageShell";
import { Card, PageBody, SectionHeading } from "@/components/common/Section";
import { ChevronLeftIcon, InfoIcon, KnightIcon, PawnIcon } from "@/components/icons";
import {
  LEVELS,
  looksMinor,
  remainingCooldown,
  submitRegistration,
  validateRegistration,
  type FieldErrors,
  type Level,
  type RegistrationInput,
} from "@/lib/registrations";
import { toArabicDigits } from "@/lib/format";
import { cn } from "@/utils/cn";

const EMPTY: RegistrationInput = {
  fullName: "",
  birthInfo: "",
  guardianName: "",
  phone: "",
  email: "",
  level: "مبتدئ",
  notes: "",
};

export default function RegistrationPage() {
  const [form, setForm] = useState<RegistrationInput>(EMPTY);
  const [honeypot, setHoneypot] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const minor = useMemo(() => looksMinor(form.birthInfo), [form.birthInfo]);
  const set = (patch: Partial<RegistrationInput>) => {
    setForm((f) => ({ ...f, ...patch }));
    setGlobalError(null);
  };

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setGlobalError(null);

    // فخّ البوتات: الحقل المخفي يجب أن يبقى فارغاً
    if (honeypot.trim()) {
      setDone(true);
      return;
    }

    const found = validateRegistration(form);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      setGlobalError("يرجى تصحيح الحقول المظللة بالأحمر.");
      return;
    }

    const cooldown = remainingCooldown();
    if (cooldown > 0) {
      setGlobalError(
        `أرسلتَ طلباً قبل قليل. انتظر ${toArabicDigits(Math.ceil(cooldown / 1000))} ثانية.`
      );
      return;
    }

    setBusy(true);
    try {
      await submitRegistration(form);
      setDone(true);
      setForm(EMPTY);
      setErrors({});
    } catch (error) {
      setGlobalError(error instanceof Error ? error.message : "تعذّر إرسال الطلب.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <PageShell
      eyebrow="انضم إلى النادي"
      titleAr="التسجيل في النادي"
      titleFr="Inscription au club"
      intro="املأ الاستمارة وسيتواصل معك النادي لاستكمال إجراءات الانخراط."
      crumbs={[{ label: "التسجيل" }]}
      bannerExtra={
        <div aria-hidden="true" className="mt-5 flex items-center justify-center gap-2.5">
          <span className="h-px w-10 bg-gradient-to-l from-transparent to-gold/60 sm:w-16" />
          <KnightIcon className="h-[18px] w-[18px] text-gold sm:h-5 sm:w-5" />
          <span className="h-px w-10 bg-gradient-to-r from-transparent to-gold/60 sm:w-16" />
        </div>
      }
    >
      <PageBody>
        {done ? (
          <Card className="mx-auto max-w-2xl p-7 text-center sm:p-9">
            <span className="mx-auto grid h-16 w-16 place-items-center rounded-full border border-emerald-300 bg-emerald-50 text-[26px] text-emerald-700">
              ✓
            </span>
            <h2 className="mt-4 font-arabic text-[1.15rem] font-bold text-royal-ink sm:text-[1.25rem]">
              تم إرسال طلبك بنجاح
            </h2>
            <p className="mx-auto mt-3 max-w-md font-arabic text-[13px] leading-[2] text-royal-ink/70">
              شكراً لك. استُلم طلب التسجيل وسيتواصل معك النادي عبر رقم الهاتف الذي
              أدخلته لاستكمال الإجراءات.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2.5">
              <a
                href="#accueil"
                className="inline-flex h-[44px] items-center justify-center rounded-full bg-royal px-5 font-arabic text-[12.5px] font-semibold text-white transition-all duration-300 hover:-translate-y-px hover:bg-royal-deep"
              >
                العودة إلى الرئيسية
              </a>
              <button
                type="button"
                onClick={() => setDone(false)}
                className="inline-flex h-[44px] items-center justify-center rounded-full border border-royal/15 bg-white px-5 font-arabic text-[12.5px] font-semibold text-royal transition-all duration-300 hover:border-gold/70 hover:bg-[#fffdf8]"
              >
                إرسال طلب آخر
              </button>
            </div>
          </Card>
        ) : (
          <>
            <SectionHeading titleAr="استمارة التسجيل" titleFr="Formulaire d’inscription" />

            <div className="mt-6 grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:gap-7">
              <Card className="p-5 sm:p-6 lg:p-7">
                <form onSubmit={handleSubmit} noValidate>
                  {/* فخّ البوتات — مخفي عن المستخدمين وقارئات الشاشة */}
                  <div aria-hidden="true" className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden">
                    <label htmlFor="reg-website">الموقع (اتركه فارغاً)</label>
                    <input
                      id="reg-website"
                      name="website"
                      type="text"
                      tabIndex={-1}
                      autoComplete="off"
                      value={honeypot}
                      onChange={(e) => setHoneypot(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field id="reg-name" label="الاسم الكامل" required error={errors.fullName}>
                      <input
                        id="reg-name"
                        type="text"
                        autoComplete="name"
                        value={form.fullName}
                        onChange={(e) => set({ fullName: e.target.value })}
                        placeholder="الاسم والنسب"
                        className={inputCls(errors.fullName)}
                      />
                    </Field>

                    <Field
                      id="reg-birth"
                      label="تاريخ الميلاد أو السن"
                      hint="مثال: ٢٠١٢ أو 14 أو 2012-05-20"
                      error={errors.birthInfo}
                    >
                      <input
                        id="reg-birth"
                        type="text"
                        inputMode="numeric"
                        value={form.birthInfo}
                        onChange={(e) => set({ birthInfo: e.target.value })}
                        placeholder="السنة أو السن"
                        className={inputCls(errors.birthInfo)}
                      />
                    </Field>
                  </div>

                  {/* يظهر فقط لمن هم دون ١٨ */}
                  {minor ? (
                    <div className="mt-4">
                      <Field
                        id="reg-guardian"
                        label="اسم ولي الأمر"
                        required
                        hint="مطلوب لمن هم دون ١٨ سنة."
                        error={errors.guardianName}
                      >
                        <input
                          id="reg-guardian"
                          type="text"
                          value={form.guardianName}
                          onChange={(e) => set({ guardianName: e.target.value })}
                          placeholder="اسم الأب أو الأم أو الوصي"
                          className={inputCls(errors.guardianName)}
                        />
                      </Field>
                    </div>
                  ) : null}

                  <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field
                      id="reg-phone"
                      label="رقم الهاتف"
                      required
                      hint="رقم مغربي يبدأ بـ 06 أو 07 أو 05"
                      error={errors.phone}
                    >
                      <input
                        id="reg-phone"
                        type="tel"
                        dir="ltr"
                        inputMode="tel"
                        autoComplete="tel"
                        value={form.phone}
                        onChange={(e) => set({ phone: e.target.value })}
                        placeholder="06XXXXXXXX"
                        className={cn(inputCls(errors.phone), "text-left font-sans")}
                      />
                    </Field>

                    <Field id="reg-email" label="البريد الإلكتروني" error={errors.email}>
                      <input
                        id="reg-email"
                        type="email"
                        dir="ltr"
                        autoComplete="email"
                        value={form.email}
                        onChange={(e) => set({ email: e.target.value })}
                        placeholder="exemple@email.com (اختياري)"
                        className={cn(inputCls(errors.email), "text-left font-sans")}
                      />
                    </Field>
                  </div>

                  <div className="mt-4">
                    <span className="mb-2 block font-arabic text-[12.5px] font-semibold text-royal-ink/85">
                      المستوى
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {LEVELS.map((level) => (
                        <button
                          key={level}
                          type="button"
                          onClick={() => set({ level: level as Level })}
                          aria-pressed={form.level === level}
                          className={cn(
                            "inline-flex h-[42px] items-center gap-2 rounded-full border px-4 font-arabic text-[12.5px] font-semibold transition-all duration-300",
                            form.level === level
                              ? "border-royal bg-royal text-white shadow-[0_12px_26px_-18px_rgba(7,31,66,0.95)]"
                              : "border-royal/15 bg-white text-royal-ink/70 hover:border-gold/60 hover:bg-[#fffdf8]"
                          )}
                        >
                          <PawnIcon
                            className={cn(
                              "h-4 w-4",
                              form.level === level ? "text-gold-light" : "text-gold"
                            )}
                          />
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4">
                    <Field
                      id="reg-notes"
                      label="ملاحظات"
                      hint={`اختياري — ${toArabicDigits(form.notes.length)} / ${toArabicDigits(500)}`}
                      error={errors.notes}
                    >
                      <textarea
                        id="reg-notes"
                        rows={4}
                        maxLength={500}
                        value={form.notes}
                        onChange={(e) => set({ notes: e.target.value })}
                        placeholder="أي معلومة تودّ إضافتها…"
                        className={cn(inputCls(errors.notes), "resize-y leading-[1.9]")}
                      />
                    </Field>
                  </div>

                  {globalError ? (
                    <p
                      role="alert"
                      className="mt-5 rounded-xl border border-red-300 bg-red-50 px-3.5 py-2.5 font-arabic text-[12px] leading-[1.9] text-red-700"
                    >
                      {globalError}
                    </p>
                  ) : null}

                  <button
                    type="submit"
                    disabled={busy}
                    className="mt-5 inline-flex h-[48px] w-full items-center justify-center gap-2.5 rounded-full bg-royal px-6 font-arabic text-[13.5px] font-bold text-white shadow-[0_16px_32px_-20px_rgba(7,31,66,0.95)] transition-all duration-300 hover:-translate-y-px hover:bg-royal-deep disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                  >
                    {busy ? "جاري الإرسال…" : "إرسال طلب التسجيل"}
                    {!busy ? (
                      <span
                        aria-hidden="true"
                        className="grid h-[22px] w-[22px] place-items-center rounded-full bg-white/[0.1] text-gold-light ring-1 ring-gold-light/30"
                      >
                        <ChevronLeftIcon className="h-3.5 w-3.5" />
                      </span>
                    ) : null}
                  </button>
                </form>
              </Card>

              {/* جانب توضيحي */}
              <div className="flex flex-col gap-5">
                <Card className="p-5 sm:p-6">
                  <h3 className="font-arabic text-[14px] font-bold text-royal-ink sm:text-[15px]">
                    ماذا بعد الإرسال؟
                  </h3>
                  <ol className="mt-3.5 space-y-3">
                    {[
                      "يصل طلبك مباشرة إلى إدارة النادي.",
                      "يتواصل معك النادي عبر الهاتف لتأكيد المعلومات.",
                      "تستكمل إجراءات الانخراط في مقر النادي.",
                    ].map((step, i) => (
                      <li key={step} className="flex gap-2.5">
                        <span className="font-display text-[1.1rem] font-semibold leading-none text-royal/30">
                          {toArabicDigits(i + 1)}
                        </span>
                        <span className="font-arabic text-[12.5px] leading-[1.9] text-royal-ink/70">
                          {step}
                        </span>
                      </li>
                    ))}
                  </ol>
                </Card>

                <div className="flex items-start gap-3 rounded-[18px] border border-gold/35 bg-[#fdf8ec] p-4 sm:p-5">
                  <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gold/20 text-[#8a6d26]">
                    <InfoIcon className="h-[18px] w-[18px]" />
                  </span>
                  <p className="font-arabic text-[12px] font-medium leading-[2] text-[#6f5720] sm:text-[12.5px]">
                    إرسال الاستمارة طلبُ تسجيل فقط ولا يعني تأكيد الانخراط. تبقى
                    شروط الانخراط ووثائقه رهينة بإعلان النادي عنها.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </PageBody>
    </PageShell>
  );
}

/* ---------------- عناصر مساعدة ---------------- */

function inputCls(error?: string) {
  return cn(
    "w-full rounded-xl border bg-[#fbfcfe] px-3.5 py-2.5 font-arabic text-[13px] text-royal-ink outline-none transition focus:bg-white focus:ring-2",
    error
      ? "border-red-300 focus:border-red-400 focus:ring-red-200"
      : "border-royal/15 focus:border-gold/70 focus:ring-gold/20"
  );
}

function Field({
  id,
  label,
  hint,
  required,
  error,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 flex items-baseline gap-1.5">
        <span className="font-arabic text-[12.5px] font-semibold text-royal-ink/85">
          {label}
        </span>
        {required ? (
          <span aria-hidden="true" className="font-arabic text-[12px] text-red-500">
            *
          </span>
        ) : (
          <span className="font-arabic text-[10px] text-royal-ink/40">(اختياري)</span>
        )}
      </label>
      {children}
      {error ? (
        <p role="alert" className="mt-1 font-arabic text-[11px] font-medium text-red-600">
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1 font-arabic text-[10.5px] leading-relaxed text-royal-ink/45">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
