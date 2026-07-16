"use client"

import { Country } from "country-state-city"

import { Flag } from "@/components/shared/country-flag"
import { SearchableSelect } from "@/components/shared/searchable-select"

export type CountryOption = {
  isoCode: string
  name: string
}

export const countryOptions: CountryOption[] = Country.getAllCountries()
  .map((country) => ({ isoCode: country.isoCode, name: country.name }))
  .sort((a, b) => a.name.localeCompare(b.name))

type CountrySelectProps = {
  value: string
  onChange: (isoCode: string) => void
  disabled?: boolean
  id?: string
  "aria-invalid"?: boolean
  className?: string
  placeholder?: string
}

export function CountrySelect({
  value,
  onChange,
  disabled,
  id,
  "aria-invalid": ariaInvalid,
  className,
  placeholder = "Select country",
}: CountrySelectProps) {
  return (
    <SearchableSelect
      id={id}
      value={value}
      onChange={onChange}
      disabled={disabled}
      aria-invalid={ariaInvalid}
      className={className}
      placeholder={placeholder}
      searchPlaceholder="Search country..."
      emptyMessage="No country found."
      options={countryOptions.map((country) => ({
        value: country.isoCode,
        label: country.name,
        keywords: country.isoCode,
        icon: <Flag isoCode={country.isoCode} className="h-3.5 w-5 shrink-0" />,
      }))}
    />
  )
}
