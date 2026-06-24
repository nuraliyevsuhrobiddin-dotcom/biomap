import { Observation, PdfDocument, User, NewsArticle } from "../types";
import { supabase } from "./supabase";

type TableName = "observations" | "users" | "documents" | "news";
type Entity = Observation | User | PdfDocument | NewsArticle;

const tableNames: Record<TableName, string> = {
  observations: "biomap_observations",
  users: "biomap_users",
  documents: "biomap_documents",
  news: "biomap_news",
};

const localKeys: Record<TableName, string> = {
  observations: "biomap_observations",
  users: "biomap_users",
  documents: "biomap_documents",
  news: "biomap_news",
};

// Entity'dan is_approved maydonini olish uchun helper
function getIsApproved(entity: Entity): boolean {
  if ("isApproved" in entity) return Boolean((entity as any).isApproved);
  return false;
}

export function readLocal<T>(table: TableName, fallback: T[]): T[] {
  try {
    const saved = localStorage.getItem(localKeys[table]);
    return saved ? JSON.parse(saved) : fallback;
  } catch (error) {
    console.error(`Failed reading ${table} from localStorage`, error);
    return fallback;
  }
}

export function writeLocal<T>(table: TableName, value: T[]) {
  try {
    localStorage.setItem(localKeys[table], JSON.stringify(value));
  } catch (error) {
    console.error(`Failed writing ${table} to localStorage`, error);
  }
}

/**
 * Supabase'dan tasdiqlangan yozuvlarni oladi va local'dagi
 * tasdiqlanmagan (pending) yozuvlar bilan birlashtiradi.
 *
 * Muammo: Supabase RLS faqat is_approved=true bo'lgan yozuvlarni qaytaradi.
 * Shuning uchun local'da saqlangan pending yozuvlarni yo'qotmaslik uchun
 * ikki manbani merge qilamiz:
 *   - Supabase: tasdiqlangan yozuvlar (boshqa qurilmalarda ham ko'rinadi)
 *   - Local: tasdiqlanmagan yozuvlar (faqat shu brauzerda saqlanadi)
 */
export async function fetchTable<T>(table: TableName, fallback: T[]): Promise<T[]> {
  if (!supabase) return readLocal<T>(table, fallback);

  const { data, error } = await supabase
    .from(tableNames[table])
    .select("data")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(`Supabase fetch failed for ${table}`, error);
    return readLocal<T>(table, fallback);
  }

  const remoteApproved = (data || []).map((row: { data: T }) => row.data);

  // Local'dan faqat tasdiqlanmagan (pending) yozuvlarni olish
  const localAll = readLocal<any>(table, []);
  const localPending = localAll.filter((item: any) => {
    const isApproved = item.isApproved ?? item.is_approved ?? false;
    return !isApproved;
  });

  // Remote'da bor bo'lgan pending yozuvlarni olib tashlash (duplicate oldini olish)
  const remoteIds = new Set(remoteApproved.map((item: any) => item.id));
  const uniqueLocalPending = localPending.filter((item: any) => !remoteIds.has(item.id));

  // Birlashtirish: yangi pending + tasdiqlangan (remote)
  const merged = [...uniqueLocalPending, ...remoteApproved];

  // Merged natijani local'ga saqlash
  writeLocal(table, merged);

  return merged.length > 0 ? merged : fallback;
}

/**
 * Entity'ni ham local'ga ham Supabase'ga yozadi.
 * MUHIM: is_approved ustunini ham jadval kolonkasiga yozadi,
 * chunki Supabase RLS shu kolonnaga qarab filtrlaydi.
 */
export async function upsertEntity<T extends Entity>(table: TableName, entity: T) {
  writeEntityLocal(table, entity);
  if (!supabase) return;

  const isApproved = getIsApproved(entity);

  // Jadval uchun qo'shimcha ustunlarni to'ldirish
  const rowData: Record<string, any> = {
    id: entity.id,
    data: entity,
    updated_at: new Date().toISOString(),
  };

  // is_approved ustuni: observations, documents, news jadvallarida mavjud
  if (table === "observations" || table === "documents" || table === "news") {
    rowData.is_approved = isApproved;
  }

  // user_id ustuni: barcha jadvallarda mavjud
  if ("userId" in entity && (entity as any).userId) {
    rowData.user_id = (entity as any).userId;
  }

  const { error } = await supabase.from(tableNames[table]).upsert(rowData);

  if (error) {
    console.error(`Supabase upsert failed for ${table}`, error);
  }
}

export async function deleteEntity(table: TableName, id: string) {
  deleteEntityLocal(table, id);
  if (!supabase) return;

  const { error } = await supabase.from(tableNames[table]).delete().eq("id", id);
  if (error) {
    console.error(`Supabase delete failed for ${table}`, error);
  }
}

function writeEntityLocal<T extends Entity>(table: TableName, entity: T) {
  const current = readLocal<T>(table, []);
  const exists = current.some((item) => item.id === entity.id);
  const next = exists
    ? current.map((item) => (item.id === entity.id ? entity : item))
    : [entity, ...current];
  writeLocal(table, next);
}

function deleteEntityLocal<T extends Entity>(table: TableName, id: string) {
  const current = readLocal<T>(table, []);
  writeLocal(
    table,
    current.filter((item) => item.id !== id),
  );
}
