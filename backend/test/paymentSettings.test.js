import test from "node:test";
import assert from "node:assert/strict";
import { normalizePaymentQrImage, normalizePaymentUpiId, PaymentSettingsError } from "../src/utils/paymentSettings.js";

test("accepts a small PNG QR and rejects disguised or oversized files", () => {
    const png = Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), Buffer.alloc(100)]);
    const valid = `data:image/png;base64,${png.toString("base64")}`;
    assert.equal(normalizePaymentQrImage(valid), valid);
    assert.throws(() => normalizePaymentQrImage(`data:image/png;base64,${Buffer.from("not a PNG").toString("base64")}`), PaymentSettingsError);
    assert.throws(() => normalizePaymentQrImage(`data:image/png;base64,${Buffer.concat([png, Buffer.alloc(1024 * 1024)]).toString("base64")}`), PaymentSettingsError);
    assert.throws(() => normalizePaymentQrImage("data:image/svg+xml;base64,PHN2Zz4="), PaymentSettingsError);
    assert.equal(normalizePaymentQrImage(""), "");
});

test("normalizes a lobby UPI ID and rejects malformed IDs", () => {
    assert.equal(normalizePaymentUpiId("  player@bank  "), "player@bank");
    assert.equal(normalizePaymentUpiId(""), "");
    assert.throws(() => normalizePaymentUpiId("not-an-id"), PaymentSettingsError);
});
