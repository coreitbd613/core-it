"use client"

import * as React from "react"
import { useEffect, useRef, useState } from "react"
import { Camera, Mail, Phone } from "lucide-react"
import { toast } from "sonner"
import { FaWhatsapp } from "react-icons/fa"

import {
  useCurrentUser,
  useUpdateProfile,
  useUploadAvatar,
} from "@/hooks/use-current-user"
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
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"

const MAX_AVATAR_SIZE_BYTES = 5 * 1024 * 1024

function getInitials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean)
  if (!words.length) return "U"
  return words.slice(0, 2).map((word) => word[0]?.toUpperCase()).join("")
}

export function ProfileForm() {
  const { data: user, isPending } = useCurrentUser()
  const updateProfile = useUpdateProfile()
  const uploadAvatar = useUploadAvatar()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [name, setName] = useState("")
  const [contactNumber, setContactNumber] = useState("")
  const [whatsappNumber, setWhatsappNumber] = useState("")

  useEffect(() => {
    if (!user) return
    setName(user.name ?? "")
    setContactNumber(user.contactNumber ?? "")
    setWhatsappNumber(user.whatsappNumber ?? "")
  }, [user])

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

  const isDirty =
    name !== (user.name ?? "") ||
    contactNumber !== (user.contactNumber ?? "") ||
    whatsappNumber !== (user.whatsappNumber ?? "")

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

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    updateProfile.mutate(
      {
        name: name.trim() || undefined,
        contactNumber: contactNumber.trim() || undefined,
        whatsappNumber: whatsappNumber.trim() || undefined,
      },
      {
        onSuccess: () => toast.success("Profile updated."),
        onError: (error) => toast.error(error.message),
      },
    )
  }

  const initials = getInitials(user.name ?? user.email)

  return (
    <form onSubmit={handleSubmit}>
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Personal information</CardTitle>
          <CardDescription>
            How you appear across Core IT and how we can reach you.
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-6">
          <div className="flex items-center gap-5">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadAvatar.isPending}
              className="group relative shrink-0 rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              aria-label="Change profile photo"
            >
              <Avatar className="size-20">
                {user.avatarUrl ? (
                  <AvatarImage src={user.avatarUrl} alt={user.name ?? user.email} />
                ) : null}
                <AvatarFallback className="text-lg">{initials}</AvatarFallback>
              </Avatar>
              <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/45 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                {uploadAvatar.isPending ? (
                  <Spinner className="size-5 text-white" />
                ) : (
                  <Camera className="size-5 text-white" />
                )}
              </span>
            </button>
            <div className="flex flex-col gap-1.5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadAvatar.isPending}
                className="w-fit"
              >
                {uploadAvatar.isPending && <Spinner className="size-3.5" />}
                Change photo
              </Button>
              <p className="text-xs text-muted-foreground">
                JPG or PNG, up to 5MB.
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarSelect}
            />
          </div>

          <Separator />

          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="profile-name">Full name</FieldLabel>
              <Input
                id="profile-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Jane Doe"
                autoComplete="name"
                maxLength={120}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="profile-email">Email</FieldLabel>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="profile-email"
                  value={user.email}
                  disabled
                  className="pl-9"
                />
              </div>
              <FieldDescription>
                Your email is used to sign in and can&apos;t be changed here.
              </FieldDescription>
            </Field>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="profile-contact">Contact number</FieldLabel>
                <div className="relative">
                  <Phone className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="profile-contact"
                    type="tel"
                    value={contactNumber}
                    onChange={(event) => setContactNumber(event.target.value)}
                    placeholder="+880 1XXX-XXXXXX"
                    autoComplete="tel"
                    className="pl-9"
                  />
                </div>
              </Field>

              <Field>
                <FieldLabel htmlFor="profile-whatsapp">WhatsApp number</FieldLabel>
                <div className="relative">
                  <FaWhatsapp className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="profile-whatsapp"
                    type="tel"
                    value={whatsappNumber}
                    onChange={(event) => setWhatsappNumber(event.target.value)}
                    placeholder="+880 1XXX-XXXXXX"
                    autoComplete="tel"
                    className="pl-9"
                  />
                </div>
              </Field>
            </div>
          </FieldGroup>
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
    <Card className="max-w-2xl">
      <CardHeader>
        <Skeleton className="h-5 w-44" />
        <Skeleton className="h-4 w-72" />
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <div className="flex items-center gap-5">
          <Skeleton className="size-20 rounded-full" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-8 w-28" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
        <Separator />
        <div className="flex flex-col gap-5">
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
          <div className="grid gap-5 sm:grid-cols-2">
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
