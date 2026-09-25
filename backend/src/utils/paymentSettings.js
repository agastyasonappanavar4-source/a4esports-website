export class PaymentSettingsError extends Error {}

const MAX_QR_BYTES = 1024 * 1024;

export function normalizePaymentQrImage(value) {
    if (value == null) return null;
    if (value === "") return "";
    if (typeof value !== "string") throw new PaymentSettingsError("Upload a PNG, JPEG or WebP QR image.");

    const match = /^data:image\/(png|jpeg|webp);base64,([A-Za-z0-9+/]+={0,2})$/.exec(value);
    if (!match) throw new PaymentSettingsError("Upload a PNG, JPEG or WebP QR image.");

    const [, format, encoded] = match;
    const bytes = Buffer.from(encoded, "base64");
    if (!bytes.length || bytes.length > MAX_QR_BYTES || bytes.toString("base64") !== encoded) {
        throw new PaymentSettingsError("QR image must be a valid file smaller than 1 MB.");
    }
    const valid = format === "png"
        ? bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
        : format === "jpeg"
            ? bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255
            : bytes.toString("ascii", 0, 4) === "RIFF" && bytes.toString("ascii", 8, 12) === "WEBP";
    if (!valid) throw new PaymentSettingsError("QR image format does not match its file contents.");
    return value;
}

export function normalizePaymentUpiId(value) {
    if (value == null) return null;
    if (typeof value !== "string") throw new PaymentSettingsError("Enter a valid UPI ID.");
    const id = value.trim();
    if (id && (id.length > 191 || !/^[a-zA-Z0-9._-]{2,}@[a-zA-Z0-9.-]{2,}$/.test(id))) {
        throw new PaymentSettingsError("Enter a valid UPI ID, such as name@bank.");
    }
    return id;
}
