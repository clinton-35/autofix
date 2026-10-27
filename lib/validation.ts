import { z } from "zod";

export const enquirySchema = z.object({
  name: z.string().trim().min(2, "Please enter your name.").max(100),
  contact: z
    .string()
    .trim()
    .min(3, "Please enter a phone number or email.")
    .max(200),
  message: z.string().trim().min(5, "Please write a short message.").max(3000),
  website: z.string().optional(), // hidden spam trap, must stay empty
});

export const bookingSchema = z.object({
  customer_name: z.string().trim().min(2, "Please enter your name.").max(100),
  phone: z
    .string()
    .trim()
    .refine((v) => {
      const digits = v.replace(/\D/g, "");
      return digits.length >= 9 && digits.length <= 13;
    }, "Please enter a valid phone number."),
  email: z
    .union([
      z.literal(""),
      z.string().trim().email("Please enter a valid email.").max(200),
    ])
    .optional(),
  vehicle_make: z.string().trim().min(2, "Please enter the vehicle make.").max(50),
  vehicle_model: z.string().trim().min(1, "Please enter the vehicle model.").max(50),
  registration_number: z
    .string()
    .trim()
    .min(3, "Please enter the registration number.")
    .max(15),
  service_id: z.string().uuid("Please select a service."),
  appointment_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Please choose a date."),
  appointment_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, "Please choose a time."),
  problem_description: z.string().trim().max(2000).optional(),
  website: z.string().optional(), // spam trap
});