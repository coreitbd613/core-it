import { Suspense } from "react"
import { DotFieldBackground } from "@/components/shared/dot-field-background"

import { ResetPasswordForm } from "./_components/reset-password-form"

export default function ResetPasswordPage() {
  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-background p-6 md:p-10">
      <div className="absolute inset-0">
        <DotFieldBackground />
      </div>
      <div className="relative z-10 w-full max-w-sm">
        <Suspense>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  )
}
