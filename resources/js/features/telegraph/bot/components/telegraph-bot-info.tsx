import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Bot, Settings, Send, Info, AlertCircle, Copy, Check, Globe, Activity } from 'lucide-react'
import { toast } from 'sonner'
import { telegraphService } from '@/services/telegraph'
import { useState } from 'react'

export function TelegraphBotInfo() {
  const [copied, setCopied] = useState(false)
  const { data: botData, isLoading, error } = useQuery({
    queryKey: ['telegraph-bot'],
    queryFn: () => telegraphService.getBot(),
  })


  const copyToken = async () => {
    if (botData?.data?.token) {
      await navigator.clipboard.writeText(botData.data.token)
      setCopied(true)
      toast.success('Bot token copied to clipboard')
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const registerWebhook = async () => {
    try {
      const response = await telegraphService.registerWebhook()
      if (response.success) {
        toast.success(response.message)
      } else {
        toast.error(response.message)
      }
    } catch (error) {
      toast.error('Error registering webhook')
      console.error('Error:', error)
    }
  }

  const unregisterWebhook = async () => {
    try {
      const response = await telegraphService.unregisterWebhook()
      if (response.success) {
        toast.success(response.message)
      } else {
        toast.error(response.message)
      }
    } catch (error) {
      toast.error('Error unregistering webhook')
      console.error('Error:', error)
    }
  }

  const sendTestMessage = async () => {
    try {
      const response = await telegraphService.sendTestMessage()
      if (response.success) {
        toast.success(response.message, {
          description: 'Check your Telegram chat to see the test message',
          duration: 5000,
        })
      } else {
        toast.error(response.message, {
          description: 'Make sure you have started a conversation with the bot first',
          duration: 7000,
        })
      }
    } catch (error) {
      toast.error('Error sending test message')
      console.error('Error:', error)
    }
  }

  const getBotInfo = async () => {
    try {
      const response = await telegraphService.getBotInfo()
      if (response.success) {
        const info = response.data
        toast.success(`Bot: @${info.username} (${info.first_name})`, {
          description: `ID: ${info.id} | Can join groups: ${info.can_join_groups ? 'Yes' : 'No'}`,
          duration: 5000,
        })
      } else {
        toast.error(response.message)
      }
    } catch (error) {
      toast.error('Error getting bot info')
      console.error('Error:', error)
    }
  }

  const getWebhookInfo = async () => {
    try {
      const response = await telegraphService.getWebhookInfo()
      if (response.success && response.data) {
        const info = response.data
        const status = info.url ? '✅ Active' : '❌ Not set'
        const pendingUpdates = info.pending_update_count || 0
        const lastError = info.last_error_message ? `Last error: ${info.last_error_message}` : 'No errors'
        
        toast.success(`Webhook Status: ${status}`, {
          description: `URL: ${info.url || 'Not configured'} | Pending: ${pendingUpdates} | ${lastError}`,
          duration: 7000,
        })
      } else {
        toast.error(response.message || 'Failed to get webhook info')
      }
    } catch (error) {
      toast.error('Error getting webhook info')
      console.error('Error:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-16 w-16 rounded-2xl" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 max-w-md">
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    )
  }

  if (error || !botData?.success) {
    return (
      <Alert variant="destructive" className="border-destructive/50 bg-destructive/10">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="text-destructive">
          {botData?.message || 'Failed to load bot configuration. Please check your environment variables.'}
        </AlertDescription>
      </Alert>
    )
  }

  const bot = botData.data

  if (!bot) {
    return (
      <Alert variant="destructive" className="border-destructive/50 bg-destructive/10">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="text-destructive">
          Bot data is not available.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <Bot className="mr-2 h-5 w-5" />
          Bot Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Button
            onClick={registerWebhook}
            className="h-16 justify-start p-4"
            variant="outline"
            size="lg"
          >
            <div className="flex items-center w-full">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30 mr-3">
                <Globe className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div className="text-left flex-1">
                <div className="font-medium">Register Webhook</div>
                <div className="text-xs text-muted-foreground mt-1">Enable webhook for bot</div>
              </div>
            </div>
          </Button>

          <Button
            onClick={unregisterWebhook}
            className="h-16 justify-start p-4"
            variant="outline"
            size="lg"
          >
            <div className="flex items-center w-full">
              <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30 mr-3">
                <Settings className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div className="text-left flex-1">
                <div className="font-medium">Unregister Webhook</div>
                <div className="text-xs text-muted-foreground mt-1">Disable webhook</div>
              </div>
            </div>
          </Button>

          <Button
            onClick={sendTestMessage}
            className="h-16 justify-start p-4"
            variant="outline"
            size="lg"
          >
            <div className="flex items-center w-full">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 mr-3">
                <Send className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="text-left flex-1">
                <div className="font-medium">Send Test Message</div>
                <div className="text-xs text-muted-foreground mt-1">Test bot functionality</div>
              </div>
            </div>
          </Button>

          <Button
            onClick={getBotInfo}
            className="h-16 justify-start p-4"
            variant="outline"
            size="lg"
          >
            <div className="flex items-center w-full">
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30 mr-3">
                <Info className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="text-left flex-1">
                <div className="font-medium">Get Bot Info</div>
                <div className="text-xs text-muted-foreground mt-1">Fetch from Telegram API</div>
              </div>
            </div>
          </Button>

          <Button
            onClick={getWebhookInfo}
            className="h-16 justify-start p-4"
            variant="outline"
            size="lg"
          >
            <div className="flex items-center w-full">
              <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30 mr-3">
                <Activity className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="text-left flex-1">
                <div className="font-medium">Get Webhook Info</div>
                <div className="text-xs text-muted-foreground mt-1">Check webhook status</div>
              </div>
            </div>
          </Button>

          <Button
            onClick={copyToken}
            className="h-16 justify-start p-4"
            variant="outline"
            size="lg"
          >
            <div className="flex items-center w-full">
              <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-900/30 mr-3">
                {copied ? (
                  <Check className="h-5 w-5 text-green-600" />
                ) : (
                  <Copy className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                )}
              </div>
              <div className="text-left flex-1">
                <div className="font-medium">Copy Bot Token</div>
                <div className="text-xs text-muted-foreground mt-1">Copy token to clipboard</div>
              </div>
            </div>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
