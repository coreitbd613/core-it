import { ProfileForm } from "@/components/shared/profile/profile-form"

export default function AdminProfilePage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Profile</h1>
        <p className="text-muted-foreground">
          Manage your personal information and contact details.
        </p>
      </div>

      <ProfileForm />
    </div>
  )
}
