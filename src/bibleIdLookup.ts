// bibleLookup.ts
type BookId =
  | "GEN" | "EXO" | "LEV" | "NUM" | "DEU" | "JOS" | "JDG" | "RUT" | "1SA" | "2SA"
  | "1KI" | "2KI" | "1CH" | "2CH" | "EZR" | "NEH" | "EST" | "JOB" | "PSA" | "PRO"
  | "ECC" | "SNG" | "ISA" | "JER" | "LAM" | "EZK" | "DAN" | "HOS" | "JOL" | "AMO"
  | "OBA" | "JON" | "MIC" | "NAM" | "HAB" | "ZEP" | "HAG" | "ZEC" | "MAL" | "MAT"
  | "MRK" | "LUK" | "JHN" | "ACT" | "ROM" | "1CO" | "2CO" | "GAL" | "EPH" | "PHP"
  | "COL" | "1TH" | "2TH" | "1TI" | "2TI" | "TIT" | "PHM" | "HEB" | "JAS" | "1PE"
  | "2PE" | "1JN" | "2JN" | "3JN" | "JUD" | "REV";

export const bibleBookLookup: Record<string, BookId> = {
  // Pentateuch
  "gen": "GEN", "genesis": "GEN", "gen.": "GEN",
  "exo": "EXO", "exodus": "EXO", "ex.": "EXO", "ex": "EXO",
  "lev": "LEV", "leviticus": "LEV", "lev.": "LEV",
  "num": "NUM", "numbers": "NUM", "num.": "NUM",
  "deu": "DEU", "deut": "DEU", "deuteronomy": "DEU", "dt.": "DEU",

  // Historical books
  "jos": "JOS", "josh": "JOS", "joshua": "JOS", "josh.": "JOS",
  "jdg": "JDG", "judg": "JDG", "judges": "JDG", "judg.": "JDG",
  "rut": "RUT", "ruth": "RUT",
  "1sa": "1SA", "1 sam": "1SA", "1 samuel": "1SA", "1 s.": "1SA",
  "2sa": "2SA", "2 sam": "2SA", "2 samuel": "2SA", "2 s.": "2SA",
  "1ki": "1KI", "1 k": "1KI", "1 kings": "1KI",
  "2ki": "2KI", "2 k": "2KI", "2 kings": "2KI",
  "1ch": "1CH", "1 chr": "1CH", "1 chronicles": "1CH",
  "2ch": "2CH", "2 chr": "2CH", "2 chronicles": "2CH",
  "ezr": "EZR", "ezra": "EZR",
  "neh": "NEH", "nehemiah": "NEH",
  "est": "EST", "esth": "EST", "esther": "EST",

  // Wisdom
  "job": "JOB",
  "ps": "PSA", "psa": "PSA", "psalm": "PSA", "psalms": "PSA", "ps.": "PSA",
  "pro": "PRO", "prov": "PRO", "proverbs": "PRO", "prov.": "PRO",
  "ecc": "ECC", "eccl": "ECC", "ecclesiastes": "ECC", "eccl.": "ECC",
  "sng": "SNG", "song": "SNG", "song of solomon": "SNG", "song of songs": "SNG", "s. s.": "SNG",

  // Major prophets
  "isa": "ISA", "isaiah": "ISA", "is.": "ISA", "is": "ISA",
  "jer": "JER", "jeremiah": "JER", "jer.": "JER",
  "lam": "LAM", "lamentations": "LAM", "lam.": "LAM",
  "ezk": "EZK", "ezek": "EZK", "ezekiel": "EZK", "ezek.": "EZK",
  "dan": "DAN", "daniel": "DAN", "dan.": "DAN",

  // Minor prophets
  "hos": "HOS", "hosea": "HOS", "hos.": "HOS",
  "joel": "JOL", "jol": "JOL",
  "amo": "AMO", "amos": "AMO", "am.": "AMO",
  "oba": "OBA", "obad": "OBA", "obadiah": "OBA", "obad.": "OBA",
  "jon": "JON", "jonah": "JON", "jon.": "JON",
  "mic": "MIC", "micah": "MIC", "mic.": "MIC",
  "nah": "NAM", "nahum": "NAM", "nah.": "NAM",
  "hab": "HAB", "habakkuk": "HAB", "hab.": "HAB",
  "zep": "ZEP", "zeph": "ZEP", "zephaniah": "ZEP", "zeph.": "ZEP",
  "hag": "HAG", "haggai": "HAG", "hag.": "HAG",
  "zec": "ZEC", "zech": "ZEC", "zechariah": "ZEC", "zech.": "ZEC",
  "mal": "MAL", "malachi": "MAL", "mal.": "MAL",

  // Gospels & Acts
  "mat": "MAT", "matt": "MAT", "matthew": "MAT", "mt.": "MAT",
  "mrk": "MRK", "mark": "MRK", "mk.": "MRK",
  "luk": "LUK", "luke": "LUK", "lk.": "LUK",
  "jhn": "JHN", "john": "JHN", "jn.": "JHN",
  "act": "ACT", "acts": "ACT",

  // Paul’s letters
  "rom": "ROM", "romans": "ROM", "rom.": "ROM",
  "1co": "1CO", "1 cor": "1CO", "1 corinthians": "1CO",
  "2co": "2CO", "2 cor": "2CO", "2 corinthians": "2CO",
  "gal": "GAL", "galatians": "GAL", "gal.": "GAL",
  "eph": "EPH", "ephesians": "EPH", "eph.": "EPH",
  "php": "PHP", "phil": "PHP", "philippians": "PHP", "phil.": "PHP",
  "col": "COL", "colossians": "COL", "col.": "COL",
  "1th": "1TH", "1 thess": "1TH", "1 thessalonians": "1TH",
  "2th": "2TH", "2 thess": "2TH", "2 thessalonians": "2TH",
  "1ti": "1TI", "1 tim": "1TI", "1 timothy": "1TI",
  "2ti": "2TI", "2 tim": "2TI", "2 timothy": "2TI",
  "tit": "TIT", "titus": "TIT",
  "phm": "PHM", "philemon": "PHM", "philem.": "PHM",
  "heb": "HEB", "hebrews": "HEB", "heb.": "HEB",

  // General letters
  "jas": "JAS", "james": "JAS", "jas.": "JAS",
  "1pe": "1PE", "1 pet": "1PE", "1 peter": "1PE",
  "2pe": "2PE", "2 pet": "2PE", "2 peter": "2PE",
  "1jn": "1JN", "1 john": "1JN", "1 jn.": "1JN",
  "2jn": "2JN", "2 john": "2JN", "2 jn.": "2JN",
  "3jn": "3JN", "3 john": "3JN", "3 jn.": "3JN",
  "jud": "JUD", "jude": "JUD",

  // Revelation
  "rev": "REV", "revelation": "REV", "revelations": "REV", "rev.": "REV"
};

/**
 * Normalize and lookup a bible book name/abbreviation.
 * @param key Any string (case-insensitive).
 * @returns the 3-letter book ID or undefined.
 */
export function findBookId(key: string): BookId | undefined {
  return bibleBookLookup[key.trim().toLowerCase()];
}
