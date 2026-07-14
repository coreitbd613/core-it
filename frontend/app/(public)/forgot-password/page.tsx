import { DotFieldBackground } from "@/components/shared/dot-field-background"

import { ForgotPasswordForm } from "./_components/forgot-password-form"

export default function ForgotPasswordPage() {
  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-background p-6 md:p-10">
      <div className="absolute inset-0">
        <DotFieldBackground />
      </div>
      <div className="relative z-10 w-full max-w-sm">
        <ForgotPasswordForm />
      </div>
    </div>
  )
}
