import { DotFieldBackground } from "@/components/shared/dot-field-background"

import { LoginForm } from "./_components/login-form"

export default function LoginPage() {
  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-background p-6 md:p-10">
      <div className="absolute inset-0">
        <DotFieldBackground />
      </div>
      <div className="relative z-10 w-full max-w-sm md:max-w-4xl">
        <LoginForm />
      </div>
    </div>
  )
}
