import { useEffect, useState } from "react";
import {
  onValue,
  push,
  ref,
  remove,
  serverTimestamp,
  update,
} from "firebase/database";
import { auth, database } from "@/lib/firebase";

export const REGISTRATIONS_PATH = "registrations";

export const LEVELS = ["مبتدئ", "متوسط", "متقدم"] as const;
export type Level = (typeof LEVELS)[number];

export type RegistrationInput = {
  fullName: string;
  birthInfo: string;
  guardianName: string;
  phone: string;
  email: string;
  level: Level;
  notes: string;
};

export type Registration = RegistrationInput & {
  id: string;
  status: "new" | "done";
  createdAt: number | null;
};

/* ════════════ التحقق ════════════ */

/**
 * أرقام الهاتف المغربية:
 *  06XXXXXXXX / 07XXXXXXXX / 05XXXXXXXX
 *  +2126XXXXXXXX أو 002126XXXXXXXX
 */
export function normalizePhone(raw: string): string | null {
  const digits = raw.replace(/[\s\-().]/g, "");
  const m =
    /^(?:\+212|00212|212)?0?([5-7]\d{8})$/.exec(digits) ??
    /^0([5-7]\d{8})$/.exec(digits);
  return m ? `0${m[1]}` : null;
}

/** يحوّل إلى صيغة دولية لواتساب: 212XXXXXXXXX */
export function toInternational(phone: string): string | null {
  const local = normalizePhone(phone);
  return local ? `212${local.slice(1)}` : null;
}

export type FieldErrors = Partial<Record<keyof RegistrationInput, string>>;

/** هل يبدو صاحب الطلب قاصراً؟ يقبل سنة ميلاد، أو تاريخاً، أو سناً مباشراً. */
export function looksMinor(birthInfo: string): boolean {
  const value = birthInfo.trim();
  if (!value) return false;

  // سن مباشر: رقم من 1 إلى 2 خانة
  const age = /^\d{1,2}$/.exec(value);
  if (age) return Number(age[0]) < 18;

  // تاريخ كامل YYYY-MM-DD
  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime()) && value.includes("-")) {
    const years = (Date.now() - parsed.getTime()) / (365.25 * 24 * 3600 * 1000);
    return years < 18;
  }

  // سنة ميلاد
  const year = /^(19|20)\d{2}$/.exec(value);
  if (year) return new Date().getFullYear() - Number(year[0]) < 18;

  return false;
}

export function validateRegistration(input: RegistrationInput): FieldErrors {
  const errors: FieldErrors = {};

  const name = input.fullName.trim();
  if (!name) errors.fullName = "الاسم الكامل مطلوب.";
  else if (name.length < 2) errors.fullName = "الاسم قصير جداً.";
  else if (name.length > 100) errors.fullName = "الاسم طويل جداً (الحد ١٠٠ حرف).";

  if (!input.phone.trim()) {
    errors.phone = "رقم الهاتف مطلوب.";
  } else if (!normalizePhone(input.phone)) {
    errors.phone = "رقم هاتف مغربي غير صالح. مثال: 0612345678";
  }

  if (input.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(input.email.trim())) {
    errors.email = "صيغة البريد الإلكتروني غير صحيحة.";
  }

  if (looksMinor(input.birthInfo) && !input.guardianName.trim()) {
    errors.guardianName = "اسم ولي الأمر مطلوب لمن هم دون ١٨ سنة.";
  }

  if (input.notes.length > 500) {
    errors.notes = "الملاحظات تتجاوز ٥٠٠ حرف.";
  }

  if (!LEVELS.includes(input.level)) {
    errors.level = "اختر مستوى صالحاً.";
  }

  return errors;
}

/* ════════════ منع الإرسال المتكرر ════════════ */

const THROTTLE_KEY = "casa_last_registration";
export const THROTTLE_MS = 60_000;

export function remainingCooldown(): number {
  try {
    const last = Number(localStorage.getItem(THROTTLE_KEY) ?? 0);
    const left = THROTTLE_MS - (Date.now() - last);
    return left > 0 ? left : 0;
  } catch {
    return 0;
  }
}

function markSubmitted() {
  try {
    localStorage.setItem(THROTTLE_KEY, String(Date.now()));
  } catch {
    /* التخزين غير متاح — نتجاهل */
  }
}

/* ════════════ الإرسال ════════════ */

/**
 * يُنشئ طلب تسجيل جديد. الزوار مسموح لهم بالإنشاء فقط،
 * والقواعد في Firebase هي التي تفرض ذلك فعلياً.
 */
export async function submitRegistration(input: RegistrationInput): Promise<void> {
  const left = remainingCooldown();
  if (left > 0) {
    throw new Error(
      `أرسلتَ طلباً قبل قليل. انتظر ${Math.ceil(left / 1000)} ثانية قبل المحاولة من جديد.`
    );
  }

  const errors = validateRegistration(input);
  if (Object.keys(errors).length > 0) {
    throw new Error("تحقّق من الحقول المطلوبة.");
  }

  const phone = normalizePhone(input.phone);
  const minor = looksMinor(input.birthInfo);

  // الحقول مطابقة تماماً لما تسمح به قواعد Firebase.
  const payload = {
    fullName: input.fullName.trim().slice(0, 100),
    birthInfo: input.birthInfo.trim().slice(0, 40),
    guardianName: minor ? input.guardianName.trim().slice(0, 100) : "",
    phone: phone ?? input.phone.trim(),
    email: input.email.trim().slice(0, 120),
    level: input.level,
    notes: input.notes.trim().slice(0, 500),
    status: "new" as const,
    createdAt: serverTimestamp(),
  };

  try {
    await push(ref(database, REGISTRATIONS_PATH), payload);
    markSubmitted();
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (/permission|denied/i.test(message)) {
      throw new Error(
        "تعذّر إرسال الطلب: قواعد قاعدة البيانات لا تسمح بذلك بعد. يرجى إبلاغ النادي."
      );
    }
    throw new Error("تعذّر إرسال الطلب. تحقّق من اتصال الإنترنت وحاول مجدداً.");
  }
}

/* ════════════ لوحة الإدارة ════════════ */

export type RegistrationsState = {
  items: Registration[];
  loading: boolean;
  error: string | null;
};

/** يشترك في الطلبات ويرتّبها من الأحدث إلى الأقدم. */
export function useRegistrations(enabled = true): RegistrationsState {
  const [state, setState] = useState<RegistrationsState>({
    items: [],
    loading: enabled,
    error: null,
  });

  useEffect(() => {
    if (!enabled) {
      setState({ items: [], loading: false, error: null });
      return;
    }

    const unsubscribe = onValue(
      ref(database, REGISTRATIONS_PATH),
      (snapshot) => {
        const value = snapshot.val() as Record<string, Omit<Registration, "id">> | null;
        const items = value
          ? Object.entries(value)
              .map(([id, row]) => ({ id, ...row }))
              .sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0))
          : [];
        setState({ items, loading: false, error: null });
      },
      (error) => setState({ items: [], loading: false, error: error.message })
    );

    return () => unsubscribe();
  }, [enabled]);

  return state;
}

export async function setRegistrationStatus(
  id: string,
  status: Registration["status"]
): Promise<void> {
  if (!auth.currentUser) throw new Error("يجب تسجيل الدخول.");
  await update(ref(database, `${REGISTRATIONS_PATH}/${id}`), { status });
}

export async function deleteRegistration(id: string): Promise<void> {
  if (!auth.currentUser) throw new Error("يجب تسجيل الدخول.");
  await remove(ref(database, `${REGISTRATIONS_PATH}/${id}`));
}
