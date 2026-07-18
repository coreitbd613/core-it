import type { Metadata } from "next"
import { DotFieldBackground } from "@/components/shared/dot-field-background"

import { SignupForm } from "./_components/signup-form"

export const metadata: Metadata = {
  title: "Sign Up",
  description:
    "Create your CORE IT account and get your own CRM & ERP company profile in minutes.",
  alternates: { canonical: "/signup" },
}

export default function SignupPage() {
  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-background p-6 md:p-10">
      <div className="absolute inset-0">
        <DotFieldBackground />
      </div>
      <div className="relative z-10 w-full max-w-sm md:max-w-4xl">
        <SignupForm />
      </div>
    </div>
  )
}
