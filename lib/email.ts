import nodemailer from "nodemailer";
import { eventConfig } from "@/config/event";
import { formatDate } from "@/lib/format";

function transporter() {
  return nodemailer.createTransport({ service: "gmail", auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD } });
}
export async function sendTicketEmail(order: { email: string; name: string; qty: number; ticket_number: string }) {
  const subject = eventConfig.emailSubject.replace("REPLACE_ME_EMAIL_SUBJECT", `${eventConfig.eventName} ticket confirmation`);
  const html = `<div style="font-family:Arial,sans-serif;background:#09090b;color:#f4f4f5;padding:32px"><h1>${eventConfig.eventName}</h1><p>Hi ${order.name},</p><p>Your payment has been verified.</p><div style="font-size:36px;font-weight:bold;color:${eventConfig.theme.primary};padding:24px 0">${order.ticket_number}</div><p><b>${order.qty} ticket(s)</b><br>${formatDate(eventConfig.date)}<br>Doors: ${eventConfig.doorsOpenTime}<br>${eventConfig.venueName}, ${eventConfig.venueAddress}</p><p><b>Show this email at the entrance.</b></p><p>Support: ${eventConfig.contact.supportEmail} · ${eventConfig.contact.supportPhone}</p><hr><small>${eventConfig.emailFooterNote}</small></div>`;
  const text = `Hi ${order.name},\n\nYour payment for ${eventConfig.eventName} has been verified.\nTicket: ${order.ticket_number}\nQuantity: ${order.qty}\n${formatDate(eventConfig.date)}\nDoors: ${eventConfig.doorsOpenTime}\nVenue: ${eventConfig.venueName}, ${eventConfig.venueAddress}\n\nShow this email at the entrance.\nSupport: ${eventConfig.contact.supportEmail} · ${eventConfig.contact.supportPhone}\n\n${eventConfig.emailFooterNote}`;
  await transporter().sendMail({ from: process.env.GMAIL_USER, to: order.email, subject, html, text });
}
export async function sendRejectionEmail(order: { email: string; name: string }, reason: string) {
  await transporter().sendMail({ from: process.env.GMAIL_USER, to: order.email, subject: `${eventConfig.eventName}: payment update`, text: `Hi ${order.name},\n\nWe could not verify your payment for ${eventConfig.eventName}.\nReason: ${reason}\n\nPlease contact ${eventConfig.contact.supportEmail}.` });
}
