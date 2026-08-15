const sniffDelimiter = (line) => {
  const counts = [",", ";", "\t"].map((d) => [d, line.split(d).length - 1]);
  counts.sort((a, b) => b[1] - a[1]);
  return counts[0][1] > 0 ? counts[0][0] : ",";
};

const splitLine = (line, delimiter) => {
  const fields = [];
  let current = "";
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (quoted) {
      if (ch === '"' && line[i + 1] === '"') {
        current += '"';
        i++;
      } else if (ch === '"') quoted = false;
      else current += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === delimiter) {
      fields.push(current);
      current = "";
    } else current += ch;
  }
  fields.push(current);
  return fields.map((f) => f.trim());
};

/**
 * Parse CSV text into { headers, rows } — delimiter sniffed from the first
 * line (comma/semicolon/tab), quoted fields honored, blank lines skipped.
 * Rows are objects keyed by the lowercased headers.
 */
export const parseCsv = (text) => {
  const lines = String(text || "").split(/\r?\n/).filter((l) => l.trim().length);
  if (!lines.length) return { headers: [], rows: [] };
  const delimiter = sniffDelimiter(lines[0]);
  const headers = splitLine(lines[0], delimiter).map((h) => h.toLowerCase());
  const rows = lines.slice(1).map((line) => {
    const fields = splitLine(line, delimiter);
    return Object.fromEntries(headers.map((h, i) => [h, fields[i] ?? ""]));
  });
  return { headers, rows };
};

const HEADER_HINTS = {
  date: ["date", "data", "dia"],
  amount: ["amount", "valor", "value", "quantia"],
  note: ["note", "description", "descricao", "descrição", "memo", "histórico", "historico"],
  category: ["category", "categoria"],
};

/** Guess which parsed header feeds each transaction field; null when no hint matches. */
export const guessMapping = (headers) => {
  const mapping = {};
  for (const [field, hints] of Object.entries(HEADER_HINTS))
    mapping[field] = headers.find((h) => hints.some((hint) => h.includes(hint))) ?? null;
  return mapping;
};

const parseAmount = (raw) => {
  let s = String(raw || "").replace(/[^\d,.\-()]/g, "");
  const negative = /^\(.*\)$/.test(String(raw || "").trim()) || s.startsWith("-");
  s = s.replace(/[()]/g, "").replace(/^-/, "");
  if (s.includes(",") && s.includes(".")) {
    if (s.lastIndexOf(",") > s.lastIndexOf(".")) s = s.replace(/\./g, "").replace(",", ".");
    else s = s.replace(/,/g, "");
  } else if (s.includes(",")) s = s.replace(",", ".");
  const value = Number(s);
  if (!Number.isFinite(value)) return null;
  return negative ? -value : value;
};

const parseDate = (raw) => {
  const s = String(raw || "").trim();
  let m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return `${m[1]}-${m[2]}-${m[3]}`;
  m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (m) return `${m[3]}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`;
  return null;
};

/**
 * Turn parsed rows into transaction drafts through a column mapping
 * ({ date, amount, note, category } -> header names). Rows whose date or
 * amount cannot be read come back in `skipped` with the reason.
 */
export const rowsToTransactions = (rows, mapping) => {
  const drafts = [];
  const skipped = [];
  for (const row of rows) {
    const date = parseDate(row[mapping.date]);
    const amount = parseAmount(row[mapping.amount]);
    if (!date || amount === null) {
      skipped.push({ row, reason: !date ? "date" : "amount" });
      continue;
    }
    drafts.push({
      date,
      amount,
      note: mapping.note ? String(row[mapping.note] || "") : "",
      category: mapping.category ? String(row[mapping.category] || "").toLowerCase() || "other" : "other",
    });
  }
  return { drafts, skipped };
};
