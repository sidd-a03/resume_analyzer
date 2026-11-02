import { z } from "zod";

import { getCountryCallingCode, parsePhoneNumberFromString, type CountryCode } from "libphonenumber-js/mobile";

export const SUPPORTED_COUNTRIES = ["IN"] as const satisfies readonly CountryCode[];
export type SupportedCountry = (typeof SUPPORTED_COUNTRIES)[number];

export const countryOptions = SUPPORTED_COUNTRIES.map((code) => ({
    code,
    callingCode: `+${getCountryCallingCode(code)}`,
    flag: flagEmoji(code),
}));


function flagEmoji(code: string) {
    return String.fromCodePoint(...[...code].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65));
}

function isSupported(country: CountryCode | undefined): country is SupportedCountry {
    return SUPPORTED_COUNTRIES.includes(country as SupportedCountry);
}

const INVALID = "Enter a valid mobile number";

/**
 * A number already in E.164 ("+919876543210"), as the API receives it.
 * Rejects other spellings of the same number ("+91 98765 43210") so each number
 * is stored one way only, which the unique constraint on user.phoneNumber relies on.
 */
export const e164PhoneSchema = z.string().refine((value) => {
    const phone = parsePhoneNumberFromString(value);
    return !!phone && phone.isValid() && isSupported(phone.country) && phone.number === value;
}, INVALID);


export const nationalPhoneSchema = z
    .object({ country: z.enum(SUPPORTED_COUNTRIES), number: z.string().trim() })
    .transform(({ country, number }, ctx) => {
        const phone = parsePhoneNumberFromString(number, country);
        if (!phone?.isValid() || phone.country !== country) {
            ctx.addIssue({ code: "custom", message: INVALID, path: ["number"] });
            return z.NEVER;
        }
        return phone.number;
    });
