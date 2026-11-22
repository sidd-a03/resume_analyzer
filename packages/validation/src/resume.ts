
export const RESUME_UPLOAD = {
    maxBytes: 3 * 1024 * 1024,
    maxPages: 3,
    minTextChars: 200,
    maxTextChars: 30_000,
    mimeType: "application/pdf",
    extension: ".pdf",
} as const;

/**
 * new rtlo concept learned from isntagram
 */
const BIDI_CONTROLS = /[\u202A-\u202E\u2066-\u2069]/u

export const hasBidiControls = (fileName: string) => BIDI_CONTROLS.test(fileName)
