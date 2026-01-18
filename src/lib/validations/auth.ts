import { z } from "zod"

// Login validation schema
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email ist erforderlich")
    .email("Ungültige E-Mail-Adresse"),
  password: z
    .string()
    .min(1, "Passwort ist erforderlich")
    .min(8, "Passwort muss mindestens 8 Zeichen lang sein"),
})

// Signup validation schema
export const signupSchema = z.object({
  email: z
    .string()
    .min(1, "Email ist erforderlich")
    .email("Ungültige E-Mail-Adresse"),
  password: z
    .string()
    .min(8, "Passwort muss mindestens 8 Zeichen lang sein")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Passwort muss Groß- und Kleinbuchstaben sowie Zahlen enthalten"
    ),
  confirmPassword: z.string().min(1, "Passwort-Bestätigung ist erforderlich"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwörter stimmen nicht überein",
  path: ["confirmPassword"],
})

// Password reset request schema
export const resetPasswordRequestSchema = z.object({
  email: z
    .string()
    .min(1, "Email ist erforderlich")
    .email("Ungültige E-Mail-Adresse"),
})

// Password reset schema
export const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(8, "Passwort muss mindestens 8 Zeichen lang sein")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Passwort muss Groß- und Kleinbuchstaben sowie Zahlen enthalten"
    ),
  confirmPassword: z.string().min(1, "Passwort-Bestätigung ist erforderlich"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwörter stimmen nicht überein",
  path: ["confirmPassword"],
})

// Type exports
export type LoginInput = z.infer<typeof loginSchema>
export type SignupInput = z.infer<typeof signupSchema>
export type ResetPasswordRequestInput = z.infer<typeof resetPasswordRequestSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
