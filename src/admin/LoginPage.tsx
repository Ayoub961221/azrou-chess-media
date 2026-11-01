import { useState, type FormEvent } from "react";
import clubLogo from "@/assets/clubLogo";
import { adminSignIn, translateAuthError } from "@/lib/content";
import { Button, Field, TextInput } from "@/admin/ui";

export default function LoginPage({ notice }: { notice?: string | null }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await adminSignIn(email, password);
    } catch (err) {
      setError(translateAuthError(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      dir="rtl"
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-royal-deep p-4 font-arabic"
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(158deg,#0d3570_0%,#09264f_48%,#061c3b_100%)]" />
        <div className="drawer-chess-surface absolute -left-20 bottom-0 h-[320px] w-[420px] opacity-45 [mask-image:linear-gradient(to_top_right,black,transparent_72%)]" />
        <div className="absolute -right-24 -top-24 h-[320px] w-[320px] rounded-full border border-gold/20" />
      </div>

      <div className="relative w-full max-w-[420px] rounded-[24px] border border-white/10 bg-white p-6 shadow-[0_40px_80px_-40px_rgba(0,0,0,0.75)] sm:p-7">
        <div className="flex flex-col items-center text-center">
          <img
            src={clubLogo}
            alt="شعار النادي الرياضي لأزرو للشطرنج"
            width={72}
            height={89}
            className="h-[72px] w-auto object-contain"
          />
          <h1 className="mt-3 font-arabic text-[1.15rem] font-bold text-royal-ink">
            لوحة إدارة الموقع
          </h1>
          <p lang="fr" dir="ltr" className="mt-1 font-display text-[13px] text-royal/70">
            Administration — Club Azrou Sportif d’Échecs
          </p>
        </div>

        <div aria-hidden="true" className="my-5 h-px bg-gradient-to-l from-transparent via-gold/40 to-transparent" />

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="البريد الإلكتروني">
            <TextInput
              type="email"
              value={email}
              onChange={setEmail}
              dir="ltr"
              placeholder="admin@example.com"
            />
          </Field>

          <Field label="كلمة المرور">
            <TextInput type="password" value={password} onChange={setPassword} dir="ltr" />
          </Field>

          {error ? (
            <p
              role="alert"
              className="rounded-xl border border-red-300 bg-red-50 px-3.5 py-2.5 font-arabic text-[12px] leading-[1.8] text-red-700"
            >
              {error}
            </p>
          ) : null}

          {notice ? (
            <p className="rounded-xl border border-gold/40 bg-[#fdf8ec] px-3.5 py-2.5 font-arabic text-[11.5px] leading-[1.9] text-[#6f5720]">
              {notice}
            </p>
          ) : null}

          <Button type="submit" disabled={busy || !email || !password}>
            {busy ? "جاري التحقق…" : "تسجيل الدخول"}
          </Button>
        </form>

        <p className="mt-5 border-t border-royal/[0.08] pt-4 font-arabic text-[11px] leading-[1.9] text-royal-ink/50">
          الدخول محصور في حسابات المدراء المُسجَّلة في Firebase Authentication
          والمُضافة إلى قائمة <span dir="ltr" className="font-sans">admins</span> في قاعدة
          البيانات.
        </p>

        <a
          href="#accueil"
          onClick={() => {
            if (window.location.pathname.replace(/\/+$/, "").endsWith("/admin")) {
              window.history.replaceState(null, "", "./");
            }
            window.location.hash = "#accueil";
            window.location.reload();
          }}
          className="mt-3 inline-block font-arabic text-[11.5px] font-semibold text-royal underline decoration-gold/60 underline-offset-2"
        >
          ← العودة إلى الموقع
        </a>
      </div>
    </div>
  );
}
