import { useState, type FormEvent, type ReactNode } from "react";
import PageShell from "@/components/common/PageShell";
import { Card, Notice, PageBody, SectionHeading } from "@/components/common/Section";
import {
  BuildingIcon,
  InfoIcon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
} from "@/components/icons";
import {
  defaultContent,
  type ContactContent,
  type SiteSettings,
} from "@/lib/content-model";
import { HoursCard, MapCard, OpenBadge, useOpenState } from "@/components/contact/OpeningHours";

export default function ContactPage({
  contact,
  settings,
}: {
  contact?: ContactContent;
  settings?: SiteSettings;
} = {}) {
  const c = contact ?? defaultContent.contact;
  const s = settings ?? defaultContent.siteSettings;
  const [attempted, setAttempted] = useState(false);
  const openState = useOpenState(c);

  const hasHours = (c.hours ?? []).length > 0;
  const hasMap = Boolean(c.mapEmbedUrl || c.mapLinkUrl || c.addressDetails);

  const entries = [
    { icon: MapPinIcon, labelAr: "المدينة", labelFr: "Ville", value: c.city },
    { icon: BuildingIcon, labelAr: "العنوان", labelFr: "Adresse", value: c.address },
    { icon: PhoneIcon, labelAr: "الهاتف", labelFr: "Téléphone", value: c.phone, href: c.phone ? `tel:${c.phone.replace(/\s/g, "")}` : undefined },
    { icon: MailIcon, labelAr: "البريد الإلكتروني", labelFr: "E-mail", value: c.email, href: c.email ? `mailto:${c.email}` : undefined },
  ];

  const socials = c.socials.filter((social) => social.url.trim());

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAttempted(true);
  }

  return (
    <PageShell
      eyebrow={c.header.eyebrow}
      titleAr={c.header.titleAr}
      titleFr={c.header.titleFr}
      intro={c.header.intro}
      crumbs={[{ label: "اتصل بنا" }]}
    >
      <PageBody>
        {/* ---------- Contact info ---------- */}
        <section aria-labelledby="contact-info">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div className="min-w-0 flex-1">
              <SectionHeading id="contact-info" titleAr="معلومات التواصل" titleFr="Coordonnées" />
            </div>
            {openState !== "unknown" ? (
              <div className="pb-3.5">
                <OpenBadge state={openState} />
              </div>
            ) : null}
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
            {entries.map((item) => {
              const Icon = item.icon;
              const available = Boolean(item.value?.trim());
              return (
                <Card
                  key={item.labelAr}
                  hover={available}
                  className={available ? "p-5" : "border-dashed border-royal/20 bg-white/70 p-5"}
                >
                  <span
                    className={`grid h-11 w-11 place-items-center rounded-full border ${
                      available
                        ? "border-gold/30 bg-[#fdf8ec] text-royal"
                        : "border-royal/15 bg-[#f4f6f9] text-royal-ink/40"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </span>

                  <h3 className="mt-3.5 font-arabic text-[13.5px] font-bold text-royal-ink sm:text-[14.5px]">
                    {item.labelAr}
                  </h3>
                  <p
                    lang="fr"
                    dir="ltr"
                    className="mt-0.5 font-sans text-[8.5px] font-semibold uppercase tracking-[0.18em] text-royal-ink/35"
                  >
                    {item.labelFr}
                  </p>

                  {available ? (
                    item.href ? (
                      <a
                        href={item.href}
                        dir="ltr"
                        className="mt-2.5 block text-right font-arabic text-[12.5px] font-semibold text-royal underline decoration-gold/50 underline-offset-2"
                      >
                        {item.value}
                      </a>
                    ) : (
                      <p className="mt-2.5 font-arabic text-[12.5px] font-semibold text-royal">
                        {item.value}
                      </p>
                    )
                  ) : (
                    <p className="mt-2.5 font-arabic text-[12.5px] text-royal-ink/45">
                      غير متوفر حالياً
                    </p>
                  )}
                </Card>
              );
            })}
          </div>

          {entries.some((e) => !e.value?.trim()) ? (
            <div className="mt-5">
              <Notice>
                لا يعرض الموقع أي معلومة تواصل قبل اعتمادها رسمياً من النادي، تفادياً
                لنشر معطيات غير صحيحة.
              </Notice>
            </div>
          ) : null}
        </section>

        {/* ---------- أوقات ومكان النادي ---------- */}
        {hasHours || hasMap ? (
          <section aria-labelledby="contact-hours" className="mt-12 sm:mt-14">
            <SectionHeading
              id="contact-hours"
              titleAr="أوقات الفتح والمكان"
              titleFr="Horaires & Accès"
            />

            <div className="mt-6 grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)] lg:gap-7">
              {hasHours ? <HoursCard contact={c} /> : null}
              {hasMap ? <MapCard contact={c} /> : null}
            </div>
          </section>
        ) : null}

        {/* ---------- Form + social ---------- */}
        <section aria-labelledby="contact-form" className="mt-12 sm:mt-14">
          <SectionHeading
            id="contact-form"
            titleAr="نموذج المراسلة"
            titleFr="Formulaire"
            note={c.formEnabled ? undefined : "غير مفعّل"}
          />

          <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:gap-7">
            <Card className="p-5 sm:p-6 lg:p-7">
              {!c.formEnabled ? (
                <div className="mb-5 flex items-start gap-3 rounded-[16px] border border-gold/40 bg-[#fdf8ec] p-3.5">
                  <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-gold/20 text-[#8a6d26]">
                    <InfoIcon className="h-4 w-4" />
                  </span>
                  <p className="font-arabic text-[11.5px] font-medium leading-[1.9] text-[#6f5720] sm:text-[12.5px]">
                    {c.formNotice}
                  </p>
                </div>
              ) : null}

              <form onSubmit={handleSubmit} noValidate>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField id="cf-name" label="الاسم الكامل" labelFr="Nom complet">
                    <input
                      id="cf-name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      placeholder="اكتب اسمك"
                      className="h-[46px] w-full rounded-xl border border-royal/15 bg-[#fbfcfe] px-3.5 font-arabic text-[13px] text-royal-ink outline-none transition focus:border-gold/70 focus:bg-white focus:ring-2 focus:ring-gold/20"
                    />
                  </FormField>

                  <FormField id="cf-mail" label="البريد الإلكتروني" labelFr="E-mail">
                    <input
                      id="cf-mail"
                      name="email"
                      type="email"
                      dir="ltr"
                      autoComplete="email"
                      placeholder="exemple@email.com"
                      className="h-[46px] w-full rounded-xl border border-royal/15 bg-[#fbfcfe] px-3.5 text-left font-sans text-[13px] text-royal-ink outline-none transition focus:border-gold/70 focus:bg-white focus:ring-2 focus:ring-gold/20"
                    />
                  </FormField>
                </div>

                <div className="mt-4">
                  <FormField id="cf-subject" label="الموضوع" labelFr="Objet">
                    <input
                      id="cf-subject"
                      name="subject"
                      type="text"
                      placeholder="موضوع الرسالة"
                      className="h-[46px] w-full rounded-xl border border-royal/15 bg-[#fbfcfe] px-3.5 font-arabic text-[13px] text-royal-ink outline-none transition focus:border-gold/70 focus:bg-white focus:ring-2 focus:ring-gold/20"
                    />
                  </FormField>
                </div>

                <div className="mt-4">
                  <FormField id="cf-message" label="الرسالة" labelFr="Message">
                    <textarea
                      id="cf-message"
                      name="message"
                      rows={5}
                      placeholder="اكتب رسالتك هنا…"
                      className="w-full resize-y rounded-xl border border-royal/15 bg-[#fbfcfe] p-3.5 font-arabic text-[13px] leading-[1.9] text-royal-ink outline-none transition focus:border-gold/70 focus:bg-white focus:ring-2 focus:ring-gold/20"
                    />
                  </FormField>
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <button
                    type="submit"
                    className="inline-flex h-[46px] items-center justify-center gap-2.5 rounded-full bg-royal px-5 text-[13px] font-semibold text-white transition-all duration-300 hover:-translate-y-px hover:bg-royal-deep active:translate-y-0"
                  >
                    {c.formEnabled ? "إرسال" : "إرسال (غير مفعّل)"}
                  </button>
                  {!c.formEnabled ? (
                    <span className="font-arabic text-[11px] text-royal-ink/50">
                      الزر لا يرسل أي بيانات في هذه المرحلة.
                    </span>
                  ) : null}
                </div>

                <p
                  role="status"
                  aria-live="polite"
                  className={
                    attempted
                      ? "mt-4 rounded-xl border border-royal/15 bg-[#f4f7fb] px-3.5 py-3 font-arabic text-[12px] leading-[1.9] text-royal"
                      : "sr-only"
                  }
                >
                  {attempted
                    ? "لم تُرسَل أي رسالة: نموذج التواصل لم يُربط بعد بخدمة بريد أو خادم."
                    : ""}
                </p>
              </form>
            </Card>

            <div className="flex flex-col gap-5">
              <Card className="p-5 sm:p-6">
                <h3 className="font-arabic text-[14px] font-bold text-royal-ink sm:text-[15px]">
                  {s.nameAr}
                </h3>
                <p lang="fr" dir="ltr" className="mt-1 font-display text-[13px] text-royal/75">
                  {s.nameFr}
                </p>
                <p className="mt-3 font-arabic text-[12.5px] leading-[1.95] text-royal-ink/70">
                  {c.aboutText}
                </p>
                <span className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-royal/12 bg-[#f7f9fc] px-3 py-1.5 font-arabic text-[11px] font-medium text-royal/80">
                  <MapPinIcon className="h-3.5 w-3.5 text-gold" />
                  {s.locationAr}
                </span>

                <a
                  href="#inscription"
                  className="mt-4 flex h-[44px] w-full items-center justify-center gap-2 rounded-full bg-royal px-5 font-arabic text-[12.5px] font-bold text-white shadow-[0_14px_28px_-18px_rgba(7,31,66,0.95)] transition-all duration-300 hover:-translate-y-px hover:bg-royal-deep"
                >
                  <span aria-hidden="true" className="h-[6px] w-[6px] rotate-45 bg-gold" />
                  سجّل الآن في النادي
                </a>
              </Card>

              <Card className="p-5 sm:p-6">
                <h3 className="font-arabic text-[14px] font-bold text-royal-ink sm:text-[15px]">
                  شبكات التواصل
                </h3>

                {socials.length === 0 ? (
                  <p className="mt-3 rounded-xl border border-dashed border-royal/20 bg-[#f9fafc] px-3.5 py-4 text-center font-arabic text-[11.5px] leading-[1.9] text-royal-ink/55">
                    لم تُربط بعد أي صفحات رسمية للنادي.
                  </p>
                ) : (
                  <ul className="mt-4 space-y-2.5">
                    {socials.map((social) => (
                      <li key={social.id}>
                        <a
                          href={social.url}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="flex items-center justify-between gap-3 rounded-xl border border-royal/12 bg-[#f9fafc] px-3.5 py-2.5 transition hover:border-gold/60 hover:bg-[#fffdf8]"
                        >
                          <span className="min-w-0">
                            <span className="block font-arabic text-[12.5px] font-medium text-royal-ink/80">
                              {social.labelAr}
                            </span>
                            <span
                              lang="fr"
                              dir="ltr"
                              className="block font-sans text-[8.5px] uppercase tracking-[0.16em] text-royal-ink/35"
                            >
                              {social.labelFr}
                            </span>
                          </span>
                          <span aria-hidden="true" className="shrink-0 text-gold">↗</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            </div>
          </div>
        </section>
      </PageBody>
    </PageShell>
  );
}

function FormField({
  id,
  label,
  labelFr,
  children,
}: {
  id: string;
  label: string;
  labelFr: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 flex items-baseline gap-2">
        <span className="font-arabic text-[12.5px] font-semibold text-royal-ink/85">{label}</span>
        <span
          lang="fr"
          dir="ltr"
          className="font-sans text-[8.5px] uppercase tracking-[0.16em] text-royal-ink/35"
        >
          {labelFr}
        </span>
      </label>
      {children}
    </div>
  );
}
