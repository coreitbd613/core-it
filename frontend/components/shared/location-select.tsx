"use client"

import * as React from "react"
import { City, State } from "country-state-city"

import { Input } from "@/components/ui/input"
import { SearchableSelect } from "@/components/shared/searchable-select"

type SelectFieldProps = {
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  disabled?: boolean
  id?: string
  "aria-invalid"?: boolean
  placeholder?: string
}

/** State/Division select, populated from country-state-city for the given country. */
export function StateSelect({
  countryIso,
  value,
  onChange,
  onBlur,
  disabled,
  id,
  "aria-invalid": ariaInvalid,
  placeholder = "Select state / division",
}: SelectFieldProps & { countryIso: string }) {
  const states = React.useMemo(
    () => (countryIso ? State.getStatesOfCountry(countryIso) : []),
    [countryIso]
  )

  if (states.length === 0) {
    return (
      <Input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        disabled={disabled || !countryIso}
        aria-invalid={ariaInvalid}
        placeholder="State / Province"
      />
    )
  }

  return (
    <SearchableSelect
      id={id}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      disabled={disabled || !countryIso}
      aria-invalid={ariaInvalid}
      placeholder={placeholder}
      searchPlaceholder="Search state / division..."
      emptyMessage="No state found."
      options={states.map((state) => ({ value: state.name, label: state.name }))}
    />
  )
}

/**
 * City select, populated from country-state-city for the given country+state.
 * Falls back to a plain text input when the library has no city data for that
 * state (common outside a handful of well-covered countries) so users can
 * still type their city/area freely rather than being blocked by sparse data.
 */
export function CitySelect({
  countryIso,
  stateName,
  value,
  onChange,
  onBlur,
  disabled,
  id,
  "aria-invalid": ariaInvalid,
  placeholder = "Select city",
}: SelectFieldProps & { countryIso: string; stateName: string }) {
  const cities = React.useMemo(() => {
    if (!countryIso || !stateName) return []
    const state = State.getStatesOfCountry(countryIso).find((s) => s.name === stateName)
    if (!state) return []
    return City.getCitiesOfState(countryIso, state.isoCode)
  }, [countryIso, stateName])

  if (cities.length === 0) {
    return (
      <Input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        disabled={disabled || !countryIso}
        aria-invalid={ariaInvalid}
        placeholder="City"
      />
    )
  }

  return (
    <SearchableSelect
      id={id}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      disabled={disabled || !stateName}
      aria-invalid={ariaInvalid}
      placeholder={placeholder}
      searchPlaceholder="Search city..."
      emptyMessage="No city found."
      options={cities.map((city, index) => ({
        value: city.name,
        label: city.name,
        keywords: `${city.name}-${index}`,
      }))}
    />
  )
}
