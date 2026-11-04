
export const RESUME_UPLOAD = {
    maxBytes: 3 * 1024 * 1024,
    maxPages: 3,
    minTextChars: 200,
    maxTextChars: 30_000,
    mimeType: "application/pdf",
    extension: ".pdf",
} as const;
