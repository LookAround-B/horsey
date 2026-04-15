import { redirect } from "next/navigation"

// Registration is handled via OTP at /login
export default function RegisterPage() {
  redirect("/login")
}
