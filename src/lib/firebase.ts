import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getDatabase, type Database } from "firebase/database";

/**
 * نسخة واحدة مشتركة من Firebase لكل الموقع ولوحة الإدارة.
 * يُمنع تهيئة التطبيق أكثر من مرة.
 */
const firebaseConfig = {
  apiKey: "AIzaSyAvZTkX0dG-p5uHAO6IaU17Inl2GnLHY3E",
  authDomain: "azrou-chess-club.firebaseapp.com",
  databaseURL: "https://azrou-chess-club-default-rtdb.firebaseio.com",
  projectId: "azrou-chess-club",
  storageBucket: "azrou-chess-club.firebasestorage.app",
  messagingSenderId: "820274804123",
  appId: "1:820274804123:web:cb23be5fbe6c6217651d3e",
  measurementId: "G-MEJZFGQQNT",
};

export const app: FirebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth: Auth = getAuth(app);
export const database: Database = getDatabase(app);


/**
 * ملاحظة: Firebase Storage غير مستعمل في هذا المشروع.
 * رفع الصور يتم إلى مستودع GitHub (انظر src/lib/media.ts)،
 * وتُحفظ الروابط فقط في Realtime Database.
 */

/**
 * Analytics اختياري: يُفعَّل فقط في المتصفح وعند دعم البيئة له،
 * ولا يُعطّل الموقع إذا فشل (مثلاً بسبب مانع الإعلانات).
 */
export async function initAnalytics() {
  if (typeof window === "undefined") return null;
  try {
    const { getAnalytics, isSupported } = await import("firebase/analytics");
    if (!(await isSupported())) return null;
    return getAnalytics(app);
  } catch {
    return null;
  }
}

/** مسار قائمة المدراء في قاعدة البيانات: admins/{uid} === true */
export const ADMINS_PATH = "admins";

/**
 * لائحة احتياطية بمعرّفات المدراء.
 * تُستعمل فقط إذا تعذّرت قراءة مسار `admins` من قاعدة البيانات
 * (مثلاً بسبب قواعد صارمة على مسار admins).
 *
 * ⚠️ هذه اللائحة للواجهة فقط ولا تُغني عن Security Rules:
 * الحماية الحقيقية مفروضة من Firebase على الخادم.
 */
export const ADMIN_UIDS: string[] = ["NgL0Ahmn5KbfUCaUZaDpuVKp5uN2"];
