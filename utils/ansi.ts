    // untuk menghapus atau menfilter kode ansi warna

// utils/ansi.ts
export function stripAnsiCodes(str: string | undefined | null): string {
  if (typeof str !== "string") return "";
  return str.replace(
    /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,
    ""
  );
}