"use client"

import * as React from "react"
import { useRef, useState } from "react"
import { BriefcaseBusiness, Camera, Mail, User } from "lucide-react"
import { toast } from "sonner"

import {
  useCurrentUser,
  useUpdateProfile,
  useUploadAvatar,
} from "@/hooks/use-current-user"
import type { AuthScope, CurrentUser } from "@/lib/auth"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import { PhoneNumberInput } from "@/components/shared/phone-number-input"

const MAX_AVATAR_SIZE_BYTES = 5 * 1024 * 1024

function getInitials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean)
  if (!words.length) return "U"
  return words.slice(0, 2).map((word) => word[0]?.toUpperCase()).join("")
}

export function ProfileForm({ scope = "client" }: { scope?: AuthScope }) {
  const { data: user, isPending } = useCurrentUser(scope)

  if (isPending) {
    return <ProfileFormSkeleton />
  }

  if (!user) {
    return (
      <Card className="max-w-2xl">
        <CardContent className="py-10 text-center text-muted-foreground">
          Couldn&apos;t load your profile. Please refresh the page.
        </CardContent>
      </Card>
    )
  }

  return <LoadedProfileForm scope={scope} user={user} />
}

function LoadedProfileForm({
  scope,
  user,
}: {
  scope: AuthScope
  user: CurrentUser
}) {
  const updateProfile = useUpdateProfile(scope)
  const uploadAvatar = useUploadAvatar(scope)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [name, setName] = useState(user.name ?? "")
  const [jobTitle, setJobTitle] = useState("")
  const [savedJobTitle, setSavedJobTitle] = useState("")
  const [contactNumber, setContactNumber] = useState(user.contactNumber ?? "")

  const isDirty =
    name !== (user.name ?? "") ||
    jobTitle !== savedJobTitle ||
    contactNumber !== (user.contactNumber ?? "")

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    updateProfile.mutate(
      {
        name: name.trim() || undefined,
        contactNumber: contactNumber.trim() || undefined,
      },
      {
        onSuccess: () => {
          setSavedJobTitle(jobTitle)
          toast.success("Profile updated.")
        },
        onError: (error) => toast.error(error.message),
      },
    )
  }

  function handleAvatarSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (!file) return

    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file.")
      return
    }
    if (file.size > MAX_AVATAR_SIZE_BYTES) {
      toast.error("Image must be smaller than 5MB.")
      return
    }

    uploadAvatar.mutate(file, {
      onSuccess: () => toast.success("Profile photo updated."),
      onError: (error) => toast.error(error.message),
    })
  }

  const initials = getInitials(user.name ?? user.email)

  return (
    <form onSubmit={handleSubmit}>
      <Card className="max-w-5xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <User className="size-5 text-muted-foreground" />
            Personal details
          </CardTitle>
          <CardDescription>
            This profile belongs to your login account.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="grid gap-6 lg:grid-cols-[180px_1fr]">
            <div className="flex flex-col gap-3">
              <FieldLabel>Profile photo</FieldLabel>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadAvatar.isPending}
                className="group relative size-36 overflow-hidden rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-70"
                aria-label="Change profile photo"
              >
                <Avatar className="size-full">
                  {user.avatarUrl ? (
                    <AvatarImage src={user.avatarUrl} alt={user.name ?? user.email} className="object-cover" />
                  ) : null}
                  <AvatarFallback className="text-3xl">{initials}</AvatarFallback>
                </Avatar>
                <span className="absolute inset-x-0 bottom-0 flex h-12 items-center justify-center gap-1.5 bg-black/55 text-xs font-medium text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                  {uploadAvatar.isPending ? (
                    <Spinner className="size-4 text-white" />
                  ) : (
                    <>
                      <Camera className="size-4" />
                      Upload
                    </>
                  )}
                </span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarSelect}
              />
            </div>

            <FieldGroup>
              <div className="grid gap-5 md:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="profile-name">Full name</FieldLabel>
                <Input
                  id="profile-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="e.g. Ayesha Rahman"
                  autoComplete="name"
                  maxLength={120}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="profile-email">Email address</FieldLabel>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="profile-email"
                    value={user.email}
                    disabled
                    className="pl-9"
                    autoComplete="email"
                  />
                </div>
              </Field>

              <Field>
                <FieldLabel htmlFor="profile-job-title">Job title</FieldLabel>
                <div className="relative">
                  <BriefcaseBusiness className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="profile-job-title"
                    value={jobTitle}
                    onChange={(event) => setJobTitle(event.target.value)}
                    placeholder="e.g. Operations Manager"
                    className="pl-9"
                    autoComplete="organization-title"
                    maxLength={120}
                  />
                </div>
              </Field>

              <Field>
                <FieldLabel htmlFor="profile-contact">Contact number</FieldLabel>
                <PhoneNumberInput
                  id="profile-contact"
                  value={contactNumber}
                  onChange={setContactNumber}
                  autoComplete="tel"
                />
              </Field>
            </div>
            </FieldGroup>
          </div>
        </CardContent>

        <CardFooter className="justify-end border-t">
          <Button type="submit" disabled={!isDirty || updateProfile.isPending}>
            {updateProfile.isPending && <Spinner className="size-4" />}
            Save changes
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}

function ProfileFormSkeleton() {
  return (
    <Card className="max-w-5xl">
      <CardHeader>
        <Skeleton className="h-5 w-44" />
        <Skeleton className="h-4 w-72" />
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 lg:grid-cols-[180px_1fr]">
          <div className="flex flex-col gap-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="size-36 rounded-full" />
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
