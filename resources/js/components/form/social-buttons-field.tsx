import { useFormContext } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Plus, Trash2 } from 'lucide-react'
import { useEffect, useRef } from 'react'

export interface SocialButton {
  id: string
  platform: string
  label: string
  url: string
}

const SOCIAL_PLATFORMS = [
  { value: 'telegram', label: 'Telegram' },
  { value: 'wechat', label: 'WeChat' },
  { value: 'tiktok', label: 'TikTok' },
]

interface SocialButtonsFieldProps {
  name: string
  label?: string
  className?: string
}

export function SocialButtonsField({ 
  name, 
  label = "Social Media Buttons",
  className 
}: SocialButtonsFieldProps) {
  const { control, watch, setValue } = useFormContext()
  const hasInitialized = useRef(false)
  
  // Watch the field value
  const fieldValue = watch(name)
  const buttons = fieldValue || []
  
  // Auto-initialize with first button if none exist
  useEffect(() => {
    if (buttons.length === 0 && !hasInitialized.current) {
      const defaultButton: SocialButton = {
        id: Date.now().toString(),
        platform: 'telegram',
        label: '',
        url: ''
      }
      setValue(name, [defaultButton])
      hasInitialized.current = true
    }
  }, [buttons.length, name, setValue])

  const addButton = (currentButtons: SocialButton[], onChange: (buttons: SocialButton[]) => void) => {
    const newButton: SocialButton = {
      id: Date.now().toString(),
      platform: 'facebook',
      label: '',
      url: ''
    }
    const updatedButtons = [...currentButtons, newButton]
    onChange(updatedButtons)
  }

  const removeButton = (id: string, currentButtons: SocialButton[], onChange: (buttons: SocialButton[]) => void) => {
    // Don't allow deleting the last button if it's empty
    if (currentButtons.length === 1) {
      const button = currentButtons.find(btn => btn.id === id)
      if (button && (!button.label || button.label.trim() === '') && (!button.url || button.url.trim() === '')) {
        return // Don't delete the last empty button
      }
    }
    
    const updatedButtons = currentButtons.filter(button => button.id !== id)
    onChange(updatedButtons)
  }

  const updateButton = (id: string, field: keyof SocialButton, value: string, currentButtons: SocialButton[], onChange: (buttons: SocialButton[]) => void) => {
    const updatedButtons = currentButtons.map(button => 
      button.id === id ? { ...button, [field]: value } : button
    )
    onChange(updatedButtons)
  }

  const getPlatformIcon = (platform: string) => {
    const icons: Record<string, string> = {
      telegram: '✈️',
      wechat: '💬',
      tiktok: '🎵',
    }
    return icons[platform] || '🔗'
  }

  const getPlatformUrl = (platform: string, username: string) => {
    if (!username) return ''
    
    const urls: Record<string, string> = {
      telegram: `https://t.me/${username}`,
      wechat: `weixin://contacts/profile/${username}`,
      tiktok: `https://www.tiktok.com/@${username}`,
    }
    return urls[platform] || ''
  }

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        return (
          <FormItem className={className}>
            {label && <FormLabel>{label}</FormLabel>}
            <FormControl>
              <div className="space-y-4">
                {buttons.map((button: SocialButton) => (
                  <div key={button.id} className="space-y-3 p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Social Media Button</span>
                      <div className="flex items-center space-x-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => addButton(buttons, field.onChange)}
                          className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeButton(button.id, buttons, field.onChange)}
                          disabled={buttons.length === 1 && (!button.label || button.label.trim() === '') && (!button.url || button.url.trim() === '')}
                          className={`h-8 w-8 p-0 ${
                            buttons.length === 1 && (!button.label || button.label.trim() === '') && (!button.url || button.url.trim() === '')
                              ? 'text-gray-300 cursor-not-allowed'
                              : 'text-gray-400 hover:text-red-500'
                          }`}
                          title={
                            buttons.length === 1 && (!button.label || button.label.trim() === '') && (!button.url || button.url.trim() === '')
                              ? 'Cannot delete the last empty social media button'
                              : 'Delete social media button'
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <Select
                      value={button.platform}
                      onValueChange={(value) => updateButton(button.id, 'platform', value, buttons, field.onChange)}
                    >
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Select platform" />
                      </SelectTrigger>
                      <SelectContent>
                        {SOCIAL_PLATFORMS.map((platform) => (
                          <SelectItem key={platform.value} value={platform.value}>
                            <div className="flex items-center space-x-2">
                              <span>{getPlatformIcon(platform.value)}</span>
                              <span>{platform.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Input
                      value={button.label}
                      onChange={(e) => updateButton(button.id, 'label', e.target.value, buttons, field.onChange)}
                      placeholder="Button label"
                      className="h-10"
                    />
                    
                    <div className="space-y-2">
                      <Input
                        value={button.url}
                        onChange={(e) => updateButton(button.id, 'url', e.target.value, buttons, field.onChange)}
                        placeholder="Username"
                        className="h-10"
                      />
                      <div className="text-xs text-gray-500">
                        Preview: <span className="font-mono">{getPlatformUrl(button.platform, button.url) || 'Enter username'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )
      }}
    />
  )
}
