"use client"

import * as React from "react"
import { Country } from "country-state-city"
import { AsYouType, type CountryCode } from "libphonenumber-js/min"
import { ChevronsUpDownIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Flag } from "@/components/shared/country-flag"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

type PhoneCountry = {
  isoCode: string
  name: string
  dialCode: string
}

const phoneCountries: PhoneCountry[] = Country.getAllCountries()
  .filter((country) => Boolean(country.phonecode))
  .map((country) => ({
    isoCode: country.isoCode,
    name: country.name,
    dialCode: `+${country.phonecode.replace(/^\+/, "")}`,
  }))
  .sort((a, b) => a.name.localeCompare(b.name))

const DEFAULT_COUNTRY: PhoneCountry =
  phoneCountries.find((country) => country.isoCode === "BD") ?? phoneCountries[0]

/** Strips a local BD trunk `0` if present and returns the 10 mobile digits stored after +880. */
function normalizeBdDigits(raw: string): string {
  let digits = raw.replace(/\D/g, "")
  if (digits.startsWith("0")) digits = digits.slice(1)
  return digits.slice(0, 10)
}

export function isValidBdPhone(value: string): boolean {
  if (!value.startsWith("+880")) return false
  const digits = value.slice(4)
  return /^1\d{9}$/.test(digits)
}

function matchCountry(value: string): PhoneCountry | null {
  return (
    phoneCountries
      .filter((c) => value.startsWith(c.dialCode))
      .sort((a, b) => b.dialCode.length - a.dialCode.length)[0] ?? null
  )
}

type PhoneNumberInputProps = {
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  disabled?: boolean
  id?: string
  name?: string
  autoComplete?: string
  "aria-invalid"?: boolean
  className?: string
}

export function PhoneNumberInput({
  value,
  onChange,
  onBlur,
  disabled,
  id,
  name,
  autoComplete = "tel",
  "aria-invalid": ariaInvalid,
  className,
}: PhoneNumberInputProps) {
  const [open, setOpen] = React.useState(false)

  // Tracked as its own state rather than re-derived from `value` every render:
  // when no digits have been typed yet, `value` is "", which carries no dial
  // code to parse — deriving straight from `value` would snap the picker back
  // to the default country the instant it's selected but nothing typed yet.
  const [selectedIso, setSelectedIso] = React.useState<string>(
    () => matchCountry(value)?.isoCode ?? DEFAULT_COUNTRY.isoCode
  )
  const [bdTrunkStarted, setBdTrunkStarted] = React.useState(false)
  const selectedCountry =
    phoneCountries.find((c) => c.isoCode === selectedIso) ?? DEFAULT_COUNTRY

  // Re-sync if `value` is set externally (e.g. loaded from the server) to a
  // number under a different country than what's currently selected.
  const previousValueRef = React.useRef(value)
  React.useEffect(() => {
    if (value === previousValueRef.current) return
    previousValueRef.current = value
    const match = value ? matchCountry(value) : null
    if (match && match.isoCode !== selectedIso) {
      setSelectedIso(match.isoCode)
    }
  }, [value, selectedIso])

  const nationalDigits = value.startsWith(selectedCountry.dialCode)
    ? value.slice(selectedCountry.dialCode.length).replace(/\D/g, "")
    : ""

  const displayDigits =
    selectedCountry.dialCode === "+880" && (nationalDigits || bdTrunkStarted)
      ? `0${nationalDigits}`
      : nationalDigits

  const displayValue = React.useMemo(() => {
    if (!displayDigits) return ""
    const formatter = new AsYouType(selectedCountry.isoCode as CountryCode)
    return formatter.input(displayDigits)
  }, [displayDigits, selectedCountry.isoCode])

  function emit(nextDialCode: string, rawDigits: string) {
    if (nextDialCode === "+880") {
      setBdTrunkStarted(rawDigits.replace(/\D/g, "") === "0")
    } else {
      setBdTrunkStarted(false)
    }

    const digits =
      nextDialCode === "+880" ? normalizeBdDigits(rawDigits) : rawDigits.replace(/\D/g, "").slice(0, 15)
    onChange(digits ? `${nextDialCode}${digits}` : "")
  }

  return (
    <InputGroup
      className={cn(ariaInvalid && "border-destructive ring-3 ring-destructive/20", className)}
    >
      <InputGroupAddon>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <InputGroupButton
              type="button"
              variant="ghost"
              size="sm"
              disabled={disabled}
              className="gap-1.5 px-1.5"
            >
              <Flag isoCode={selectedCountry.isoCode} className="h-3.5 w-5" />
              <InputGroupText>{selectedCountry.dialCode}</InputGroupText>
              <ChevronsUpDownIcon className="size-3.5 opacity-50" />
            </InputGroupButton>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-72 p-0">
            <Command>
              <CommandInput placeholder="Search country or code..." />
              <CommandList>
                <CommandEmpty>No country found.</CommandEmpty>
                <CommandGroup>
                  {phoneCountries.map((country) => (
                    <CommandItem
                      key={country.isoCode}
                      value={`${country.name} ${country.isoCode} ${country.dialCode}`}
                      data-checked={country.isoCode === selectedCountry.isoCode}
                      onSelect={() => {
                        setSelectedIso(country.isoCode)
                        emit(country.dialCode, nationalDigits)
                        setOpen(false)
                      }}
                      className="gap-2"
                    >
                      <Flag isoCode={country.isoCode} className="h-3.5 w-5 shrink-0" />
                      <span className="min-w-0 flex-1 truncate">{country.name}</span>
                      <span className="text-xs text-muted-foreground">{country.dialCode}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </InputGroupAddon>

      <InputGroupInput
        id={id}
        name={name ?? id}
        type="tel"
        inputMode="numeric"
        autoComplete={autoComplete}
        placeholder={selectedCountry.dialCode === "+880" ? "01XXX-XXXXXX" : "Phone number"}
        value={displayValue}
        onChange={(e) => emit(selectedCountry.dialCode, e.target.value)}
        onBlur={onBlur}
        disabled={disabled}
        aria-invalid={ariaInvalid}
      />
    </InputGroup>
  )
}
