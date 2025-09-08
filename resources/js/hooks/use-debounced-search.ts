import { useState, useEffect, useCallback } from 'react'

export function useDebouncedSearch(
  initialValue: string = '',
  delay: number = 500
) {
  const [searchValue, setSearchValue] = useState(initialValue)
  const [debouncedValue, setDebouncedValue] = useState(initialValue)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(searchValue)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [searchValue, delay])

  const handleSearchChange = useCallback((value: string) => {
    setSearchValue(value)
  }, [])

  return {
    searchValue,
    debouncedValue,
    handleSearchChange,
  }
}
