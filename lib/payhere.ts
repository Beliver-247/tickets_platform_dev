import { createHash } from "crypto";

export const payHereCheckoutUrl = process.env.PAYHERE_SANDBOX === "true"
  ? "https://sandbox.payhere.lk/pay/checkout"
  : "https://www.payhere.lk/pay/checkout";

export function payHereHash(merchantId: string, orderId: string, amount: string, currency: string, merchantSecret: string) {
  const secretHash = createHash("md5").update(merchantSecret).digest("hex").toUpperCase();
  return createHash("md5").update(`${merchantId}${orderId}${amount}${currency}${secretHash}`).digest("hex").toUpperCase();
}

export function payHereNotificationHash(merchantId: string, orderId: string, amount: string, currency: string, statusCode: string, merchantSecret: string) {
  const secretHash = createHash("md5").update(merchantSecret).digest("hex").toUpperCase();
  return createHash("md5").update(`${merchantId}${orderId}${amount}${currency}${statusCode}${secretHash}`).digest("hex").toUpperCase();
}
