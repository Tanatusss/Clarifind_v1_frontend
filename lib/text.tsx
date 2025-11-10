/** ล้างตัวอักษรล่องหน/ช่องว่างพิเศษ + บีบช่องว่างซ้อน */
export function sanitizeForDisplay(s?: string | null) {
  if (!s) return "";
  return s
    .replace(/[\u200B\u200C\u200D\uFEFF\u00A0]/g, " ") // ZW*, NBSP → space
    .replace(/\u3000/g, " ")                           // full-width space → space
    .replace(/\s+/g, " ")                              // บีบช่องว่างซ้อน
    .trim();
}

/** ใช้ไฮไลต์หลัง sanitize เพื่อให้ตำแหน่งตัวอักษรตรง */
export function highlightSanitized(text?: string | null, rawQuery?: string | null) {
  const t = sanitizeForDisplay(text);
  const q = sanitizeForDisplay(rawQuery);
  if (!q) return t;
  const safe = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const m = t.match(new RegExp(safe, "i"));
  if (!m) return t;
  const start = m.index ?? 0;
  const end = start + m[0].length;
  return (
    <>
      {t.slice(0, start)}
      <mark className="bg-yellow-200/60 rounded px-0.5">{t.slice(start, end)}</mark>
      {t.slice(end)}
    </>
  );
}
