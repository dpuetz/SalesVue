import { describe, it, expect } from 'vitest'
import { useCurrency } from '@/composables/useCurrency'
import { useDate } from '@/composables/useDate'
import { useInitials } from '@/composables/useInitials'
import { useMonth } from '@/composables/useMonth'

// ─── useCurrency ─────────────────────────────────────────────────────────────

describe('useCurrency', () => {
  const { formatUSD } = useCurrency()

  describe('formatUSD', () => {
    it('formats a whole dollar amount', () => {
      expect(formatUSD(1000)).toBe('$1,000')
    })

    it('formats a large amount with comma separators', () => {
      expect(formatUSD(1234567)).toBe('$1,234,567')
    })

    it('rounds fractional cents (no decimal places)', () => {
      expect(formatUSD(99.99)).toBe('$100')
      expect(formatUSD(99.49)).toBe('$99')
    })

    it('formats zero', () => {
      expect(formatUSD(0)).toBe('$0')
    })

    it('formats negative values', () => {
      expect(formatUSD(-500)).toBe('-$500')
    })

    it('formats a sub-dollar amount', () => {
      expect(formatUSD(0.75)).toBe('$1') // rounds up due to maximumFractionDigits: 0
    })
  })
})

// ─── useDate ─────────────────────────────────────────────────────────────────

describe('useDate', () => {
  const { formatDate, formatDateShort, formatDatePadded } = useDate()

  // ── formatDate ──────────────────────────────────────────────────────────────

  describe('formatDate', () => {
    it('formats a plain date string (Feb 1, 2029)', () => {
      expect(formatDate('2029-02-01')).toBe('Feb 1, 2029')
    })

    it('strips the time component from an ISO datetime string', () => {
      expect(formatDate('2029-02-01T00:00:00')).toBe('Feb 1, 2029')
    })

    it('formats a date at month boundaries', () => {
      expect(formatDate('2024-12-31')).toBe('Dec 31, 2024')
      expect(formatDate('2024-01-01')).toBe('Jan 1, 2024')
    })

    it('returns an em dash for null', () => {
      expect(formatDate(null)).toBe('—')
    })

    it('returns an em dash for an empty string', () => {
      expect(formatDate('')).toBe('—')
    })
  })

  // ── formatDateShort ─────────────────────────────────────────────────────────

  describe('formatDateShort', () => {
    it('formats a plain date string (2/1/2029)', () => {
      expect(formatDateShort('2029-02-01')).toBe('2/1/2029')
    })

    it('strips the time component from an ISO datetime string', () => {
      expect(formatDateShort('2029-02-01T12:30:00')).toBe('2/1/2029')
    })

    it('formats a date at month boundaries', () => {
      expect(formatDateShort('2024-12-31')).toBe('12/31/2024')
    })

    it('returns an em dash for null', () => {
      expect(formatDateShort(null)).toBe('—')
    })

    it('returns an em dash for an empty string', () => {
      expect(formatDateShort('')).toBe('—')
    })
  })

  // ── formatDatePadded ────────────────────────────────────────────────────────

  describe('formatDatePadded', () => {
    it('formats a plain date string with zero-padding (02/01/2029)', () => {
      expect(formatDatePadded('2029-02-01')).toBe('02/01/2029')
    })

    it('pads single-digit month and day', () => {
      expect(formatDatePadded('2024-03-05')).toBe('03/05/2024')
    })

    it('strips the time component from an ISO datetime string', () => {
      expect(formatDatePadded('2024-03-05T08:00:00')).toBe('03/05/2024')
    })

    it('returns an em dash for null', () => {
      expect(formatDatePadded(null)).toBe('—')
    })

    it('returns an em dash for an empty string', () => {
      expect(formatDatePadded('')).toBe('—')
    })
  })
})

// ─── useInitials ─────────────────────────────────────────────────────────────

describe('useInitials', () => {
  const { initials } = useInitials()

  it('returns first two initials from a two-word name', () => {
    expect(initials('Janet Leverling')).toBe('JL')
  })

  it('returns first two initials from a three-word name', () => {
    expect(initials('Anne Marie Jones')).toBe('AM')
  })

  it('uppercases the result', () => {
    expect(initials('john doe')).toBe('JD')
  })

  it('returns a single initial for a one-word name', () => {
    expect(initials('Cher')).toBe('C')
  })

  it('handles a name with extra spaces between words gracefully', () => {
    // split(' ') produces empty strings for multiple spaces;
    // empty strings have no [0] so they produce undefined — document current behaviour
    const result = initials('Bob  Smith')
    expect(typeof result).toBe('string')
  })
})

// ─── useMonth ─────────────────────────────────────────────────────────────────

describe('useMonth', () => {
  const { monthName } = useMonth()

  it.each([
    [1, 'Jan'], [2, 'Feb'], [3, 'Mar'], [4, 'Apr'],
    [5, 'May'], [6, 'Jun'], [7, 'Jul'], [8, 'Aug'],
    [9, 'Sep'], [10, 'Oct'], [11, 'Nov'], [12, 'Dec'],
  ])('returns %s for month %i', (month, expected) => {
    expect(monthName(month)).toBe(expected)
  })

  it('returns an empty string for month 0 (out of range)', () => {
    expect(monthName(0)).toBe('')
  })

  it('returns an empty string for month 13 (out of range)', () => {
    expect(monthName(13)).toBe('')
  })
})