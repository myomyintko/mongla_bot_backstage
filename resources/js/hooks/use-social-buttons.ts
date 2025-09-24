import { useState, useEffect } from 'react'
import { SocialButton } from '@/components/social-buttons-manager'

interface UseSocialButtonsProps {
  initialValue?: any
  onChange?: (buttons: SocialButton[]) => void
}

export function useSocialButtons({ initialValue, onChange }: UseSocialButtonsProps = {}) {
  const [buttons, setButtons] = useState<SocialButton[]>([])

  // Parse initial value from JSON string or array
  useEffect(() => {
    if (initialValue) {
      try {
        let parsedValue: any[] = []
        
        if (typeof initialValue === 'string') {
          parsedValue = JSON.parse(initialValue)
        } else if (Array.isArray(initialValue)) {
          parsedValue = initialValue
        }
        
        // Ensure each button has an id
        const buttonsWithIds = parsedValue.map((btn, index) => ({
          id: btn.id || `btn_${index}`,
          platform: btn.platform || 'facebook',
          label: btn.label || '',
          url: btn.url || ''
        }))
        
        setButtons(buttonsWithIds)
      } catch (error) {
        console.error('Error parsing social buttons:', error)
        setButtons([])
      }
    }
  }, [initialValue])

  const updateButtons = (newButtons: SocialButton[]) => {
    setButtons(newButtons)
    onChange?.(newButtons)
  }

  const addButton = () => {
    const newButton: SocialButton = {
      id: `btn_${Date.now()}`,
      platform: 'facebook',
      label: '',
      url: ''
    }
    const updatedButtons = [...buttons, newButton]
    updateButtons(updatedButtons)
  }

  const removeButton = (id: string) => {
    const updatedButtons = buttons.filter(btn => btn.id !== id)
    updateButtons(updatedButtons)
  }

  const updateButton = (id: string, field: keyof SocialButton, value: string) => {
    const updatedButtons = buttons.map(btn => 
      btn.id === id ? { ...btn, [field]: value } : btn
    )
    updateButtons(updatedButtons)
  }

  const getButtonsAsJson = () => {
    return JSON.stringify(buttons)
  }

  const getButtonsAsArray = () => {
    return buttons
  }

  return {
    buttons,
    setButtons: updateButtons,
    addButton,
    removeButton,
    updateButton,
    getButtonsAsJson,
    getButtonsAsArray
  }
}

export default useSocialButtons
