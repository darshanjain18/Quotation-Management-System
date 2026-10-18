import { useEffect, useMemo, useRef, useState } from 'react'
import { Check, ChevronsUpDown, Search } from 'lucide-react'
import {
  COUNTRY_CODES,
  DEFAULT_COUNTRY_CODE,
  formatDialLabel,
  searchCountries,
} from '../../utils/countryCodes'

export function PhoneInput({
  countryCode = DEFAULT_COUNTRY_CODE,
  phoneNumber = '',
  onCountryChange,
  onPhoneChange,
  error,
  label = 'Phone',
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const rootRef = useRef(null)

  const selected = useMemo(
    () => COUNTRY_CODES.find((item) => item.code === countryCode) || COUNTRY_CODES[0],
    [countryCode],
  )

  const results = useMemo(() => searchCountries(query), [query])

  useEffect(() => {
    function onClickOutside(event) {
      if (!rootRef.current?.contains(event.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  function handlePhoneChange(event) {
    const digits = event.target.value.replace(/\D/g, '').slice(0, 10)
    onPhoneChange?.(digits)
  }

  return (
    <div className="flex flex-col gap-1.5 text-sm" ref={rootRef}>
      {label ? <span className="font-medium text-slate-700">{label}</span> : null}

      <div className="flex gap-2">
        <div className="relative w-[84px] shrink-0">
          <button
            type="button"
            className={`flex h-11 w-full items-center justify-between gap-1 rounded-xl border bg-white px-2 text-left text-sm shadow-soft transition hover:border-slate-300 ${
              error ? 'border-danger' : 'border-border'
            }`}
            aria-haspopup="listbox"
            aria-expanded={open}
            aria-label={`Country code ${selected.code}`}
            title={formatDialLabel(selected)}
            onClick={() => {
              setOpen((value) => !value)
              setQuery('')
            }}
          >
            <span className="truncate font-semibold">{selected.code}</span>
            <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 text-muted" />
          </button>

          {open ? (
            <div className="absolute left-0 top-12 z-30 w-[min(18rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-border bg-white shadow-lift">
              <div className="relative border-b border-border p-2">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                <input
                  autoFocus
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search country"
                  className="h-10 w-full rounded-lg border border-border bg-white pl-9 pr-3 text-sm"
                  aria-label="Search country code"
                />
              </div>
              <ul className="max-h-56 overflow-y-auto py-1" role="listbox">
                {results.length === 0 ? (
                  <li className="px-3 py-2 text-sm text-muted">No countries found</li>
                ) : (
                  results.map((country) => {
                    const active = country.code === selected.code && country.name === selected.name
                    return (
                      <li key={`${country.code}-${country.name}`}>
                        <button
                          type="button"
                          role="option"
                          aria-selected={active}
                          className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm transition hover:bg-slate-50 ${
                            active ? 'bg-brand-50 text-brand-700' : 'text-ink'
                          }`}
                          onClick={() => {
                            onCountryChange?.(country.code)
                            setOpen(false)
                            setQuery('')
                          }}
                        >
                          <span>{formatDialLabel(country)}</span>
                          {active ? <Check className="h-4 w-4" /> : null}
                        </button>
                      </li>
                    )
                  })
                )}
              </ul>
            </div>
          ) : null}
        </div>

        <input
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          maxLength={10}
          value={phoneNumber}
          onChange={handlePhoneChange}
          placeholder="10-digit number"
          className={`h-11 min-w-0 flex-1 rounded-xl border bg-white px-3.5 text-ink placeholder:text-slate-400 shadow-soft transition focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 ${
            error ? 'border-danger' : 'border-border hover:border-slate-300'
          }`}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? 'phone-error' : undefined}
        />
      </div>

      {error ? (
        <span id="phone-error" className="text-xs font-medium text-danger">
          {error}
        </span>
      ) : null}
    </div>
  )
}
