"use client"

import * as React from "react"
import { useState } from "react"
import { toast } from "sonner"

import { services } from "@/lib/services"
import { cn } from "@/lib/utils"
import { PhoneNumberInput } from "@/components/shared/phone-number-input"
import { Button } from "@/components/ui/button"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"

const budgetRanges = [
  "$500-$1000",
  "$1000-$2000",
  "$2000-$3000",
  "$3000-$4000",
  "$4000-$6000",
  "$6000-$8000",
  "$8000-$10000",
  "$10000-$20000",
  "$20000+",
]

function ToggleChip({
  label,
  selected,
  onClick,
  disabled,
}: {
  label: string
  selected: boolean
  onClick: () => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "rounded-full border px-4 py-2 text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50",
        selected
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border text-foreground hover:bg-muted"
      )}
    >
      {label}
    </button>
  )
}

export function ContactForm() {
  const [isPending, setIsPending] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [whatsapp, setWhatsapp] = useState("")
  const [company, setCompany] = useState("")
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [budget, setBudget] = useState<string | null>(null)
  const [projectDetails, setProjectDetails] = useState("")

  function toggleService(title: string) {
    setSelectedServices((current) =>
      current.includes(title)
        ? current.filter((service) => service !== title)
        : [...current, title]
    )
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsPending(true)

    setTimeout(() => {
      setIsPending(false)
      toast.success("Thanks for reaching out — we'll get back to you soon.")
      setName("")
      setEmail("")
      setWhatsapp("")
      setCompany("")
      setSelectedServices([])
      setBudget(null)
      setProjectDetails("")
    }, 600)
  }

  return (
    <form onSubmit={handleSubmit}>
      <FieldGroup>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="name">Name</FieldLabel>
            <Input
              id="name"
              name="name"
              placeholder="Your name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isPending}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="email">Email*</FieldLabel>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="m@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isPending}
            />
          </Field>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="whatsapp">WhatsApp Number</FieldLabel>
            <PhoneNumberInput
              id="whatsapp"
              name="whatsapp"
              value={whatsapp}
              onChange={setWhatsapp}
              disabled={isPending}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="company">Company name</FieldLabel>
            <Input
              id="company"
              name="company"
              placeholder="Your company"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              disabled={isPending}
            />
          </Field>
        </div>
        <Field>
          <FieldLabel>Select your Service*</FieldLabel>
          <div className="flex flex-wrap gap-2">
            {services.map((service) => (
              <ToggleChip
                key={service.title}
                label={service.title}
                selected={selectedServices.includes(service.title)}
                onClick={() => toggleService(service.title)}
                disabled={isPending}
              />
            ))}
          </div>
        </Field>
        <Field>
          <FieldLabel>Budget Range*</FieldLabel>
          <div className="flex flex-wrap gap-2">
            {budgetRanges.map((range) => (
              <ToggleChip
                key={range}
                label={range}
                selected={budget === range}
                onClick={() => setBudget(range)}
                disabled={isPending}
              />
            ))}
          </div>
        </Field>
        <Field>
          <FieldLabel htmlFor="projectDetails">Project Details</FieldLabel>
          <Textarea
            id="projectDetails"
            name="projectDetails"
            placeholder="Tell us a bit about what you need."
            required
            rows={8}
            value={projectDetails}
            onChange={(e) => setProjectDetails(e.target.value)}
            disabled={isPending}
          />
        </Field>
        <Field>
          <Button
            type="submit"
            size="lg"
            className="h-12 w-fit gap-2 px-8 text-base"
            disabled={isPending}
          >
            {isPending && <Spinner className="size-4" />}
            Send message
          </Button>
        </Field>
      </FieldGroup>
    </form>
  )
}
