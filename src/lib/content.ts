import { useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from "firebase/auth";
import { get, onValue, ref, serverTimestamp, update } from "firebase/database";
import { ADMIN_UIDS, ADMINS_PATH, auth, database } from "@/lib/firebase";
import { defaultContent, mergeContent, type SiteContent } from "@/lib/content-model";

/** جذر محتوى الموقع داخل Realtime Database */
export const CONTENT_ROOT = "content";

/* ════════════════ قراءة المحتوى ════════════════ */

export type ContentState = {
  content: SiteContent;
  loading: boolean;
  /** خطأ القراءة (مثلاً قواعد الأمان أو انقطاع الاتصال) */
  error: string | null;
  /** هل وصلت بيانات فعلية من Firebase؟ */
  fromRemote: boolean;
};

/**
 * يشترك في محتوى الموقع ويحدّث الواجهة مباشرة عند أي تعديل.
 * لا يُفرّغ المحتوى أثناء التحميل: يبقى المحتوى الافتراضي ظاهراً
 * حتى تصل البيانات، تفادياً لوميض الصفحة الفارغة.
 */
export function useSiteContent(): ContentState {
  const [state, setState] = useState<ContentState>({
    content: defaultContent,
    loading: true,
    error: null,
    fromRemote: false,
  });

  useEffect(() => {
    const contentRef = ref(database, CONTENT_ROOT);

    const unsubscribe = onValue(
      contentRef,
      (snapshot) => {
        const value = snapshot.val();
        setState({
          content: value ? mergeContent(value) : defaultContent,
          loading: false,
          error: null,
          fromRemote: Boolean(value),
        });
      },
      (error) => {
        // عند تعذّر القراءة نُبقي المحتوى الافتراضي بدل تفريغ الصفحة.
        setState({
          content: defaultContent,
          loading: false,
          error: error.message,
          fromRemote: false,
        });
      }
    );

    return () => unsubscribe();
  }, []);

  return state;
}

/* ════════════════ الكتابة ════════════════ */

/**
 * يحفظ قسماً من المحتوى. يتحقق أولاً من أن المستخدم مسجّل الدخول،
 * ثم تتكفل قواعد Firebase بفرض الصلاحية فعلياً على الخادم.
 */
export async function saveSection(
  sectionPath: string,
  value: unknown
): Promise<void> {
  if (!auth.currentUser) {
    throw new Error("يجب تسجيل الدخول قبل الحفظ.");
  }

  await update(ref(database), {
    [`${CONTENT_ROOT}/${sectionPath}`]: value,
    [`meta/updatedAt`]: serverTimestamp(),
    [`meta/updatedBy`]: auth.currentUser.uid,
  });
}

/* ════════════════ المصادقة ════════════════ */

export type AuthState = {
  user: User | null;
  isAdmin: boolean;
  /** جاري التحقق من الجلسة أو من الصلاحيات */
  checking: boolean;
  /** سبب رفض الصلاحية إن وُجد */
  adminError: string | null;
};

export function useAuthState(): AuthState {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAdmin: false,
    checking: true,
    adminError: null,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setState({ user: null, isAdmin: false, checking: false, adminError: null });
        return;
      }

      setState((prev) => ({ ...prev, user, checking: true }));

      const inAllowlist = ADMIN_UIDS.includes(user.uid);

      try {
        const snap = await get(ref(database, `${ADMINS_PATH}/${user.uid}`));
        const allowed = (snap.exists() && snap.val() === true) || inAllowlist;
        setState({
          user,
          isAdmin: allowed,
          checking: false,
          adminError: allowed
            ? null
            : `هذا الحساب غير مُخوَّل. أضف المعرّف التالي إلى المسار ${ADMINS_PATH} في قاعدة البيانات بالقيمة true.`,
        });
      } catch (error) {
        // تعذّرت القراءة: نعتمد على اللائحة الاحتياطية في الواجهة،
        // وتبقى Security Rules هي الفاصل عند أي عملية كتابة.
        setState({
          user,
          isAdmin: inAllowlist,
          checking: false,
          adminError: inAllowlist
            ? null
            : "تعذّر التحقق من الصلاحيات. تأكد من قواعد قاعدة البيانات ومن وجود المسار admins. " +
              (error instanceof Error ? error.message : ""),
        });
      }
    });

    return () => unsubscribe();
  }, []);

  return state;
}

export async function adminSignIn(email: string, password: string) {
  await signInWithEmailAndPassword(auth, email.trim(), password);
}

export async function adminSignOut() {
  await signOut(auth);
}

/** رسائل أخطاء Firebase بالعربية */
export function translateAuthError(error: unknown): string {
  const code = (error as { code?: string })?.code ?? "";
  const map: Record<string, string> = {
    "auth/invalid-email": "صيغة البريد الإلكتروني غير صحيحة.",
    "auth/user-disabled": "هذا الحساب معطّل.",
    "auth/user-not-found": "لا يوجد حساب بهذا البريد الإلكتروني.",
    "auth/wrong-password": "كلمة المرور غير صحيحة.",
    "auth/invalid-credential": "بيانات الدخول غير صحيحة.",
    "auth/too-many-requests": "محاولات كثيرة. حاول لاحقاً.",
    "auth/network-request-failed": "تعذّر الاتصال بالشبكة.",
    "auth/operation-not-allowed":
      "طريقة الدخول بالبريد وكلمة المرور غير مُفعّلة في Firebase Console.",
  };
  if (map[code]) return map[code];
  return error instanceof Error ? error.message : "حدث خطأ غير متوقع.";
}

/** معرّف فريد مستقر للعناصر الجديدة */
export function createId(prefix = "item"): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}
