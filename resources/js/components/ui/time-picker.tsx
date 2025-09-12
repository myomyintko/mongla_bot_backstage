import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface TimePickerProps {
  value?: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

const TimePicker = ({ value, onChange, placeholder, className }: TimePickerProps) => {
  return (
    <Input
      type='time'
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={cn(
        'bg-background',
        '[&::-webkit-calendar-picker-indicator]:hidden',
        '[&::-webkit-calendar-picker-indicator]:appearance-none',
        className
      )}
    />
  )
}

export default TimePicker
