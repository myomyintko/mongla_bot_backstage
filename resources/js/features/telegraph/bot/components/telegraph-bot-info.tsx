import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Bot, Settings, Send, Info, Users, AlertCircle, Copy, Check, Globe, Activity } from 'lucide-react'
import { toast } from 'sonner'
import { telegraphService } from '@/services/telegraph'
import { useState } from 'react'

export function TelegraphBotInfo() {
  const [copied, setCopied] = useState(false)
  const { data: botData, isLoading, error } = useQuery({
    queryKey: ['telegraph-bot'],
    queryFn: () => telegraphService.getBot(),
  })

  const { data: webhookData } = useQuery({
    queryKey: ['webhook-domain'],
    queryFn: () => telegraphService.getWebhookDomain(),
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
    <div className="space-y-6">
      {/* Bot Header */}
      <div className="flex items-center space-x-4">
        <div className="relative">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
            <Bot className="h-8 w-8 text-primary" />
          </div>
          <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-green-500 border-2 border-background flex items-center justify-center">
            <div className="h-2 w-2 rounded-full bg-white" />
          </div>
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{bot.name}</h1>
          <div className="flex items-center space-x-2 mt-1">
            <Badge variant="outline" className="text-xs text-green-600 border-green-200">
              Active
            </Badge>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-1 gap-4 max-w-md">
        <Card className="border-0 bg-muted/30">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Chats</p>
                <p className="text-2xl font-bold">{bot.chats?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bot Token Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Bot Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Bot Token</label>
            <div className="flex items-center space-x-2">
              <div className="flex-1 p-3 bg-muted rounded-lg font-mono text-sm break-all">
                {bot.token.substring(0, 20)}...
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={copyToken}
                className="shrink-0"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Webhook Domain Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Webhook Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Webhook Domain</label>
            <div className="p-3 bg-muted rounded-lg">
              {webhookData?.data?.domain ? (
                <div className="space-y-2">
                  <div className="font-mono text-sm text-green-600">
                    {webhookData.data.domain}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Webhook URL: {webhookData.data.webhook_url}
                  </div>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">
                  No webhook domain configured. Set TELEGRAPH_WEBHOOK_DOMAIN in your .env file.
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Bot Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Button
              onClick={registerWebhook}
              className="h-12 justify-start"
              variant="outline"
            >
              <Globe className="mr-3 h-4 w-4" />
              <div className="text-left">
                <div className="font-medium">Register Webhook</div>
                <div className="text-xs text-muted-foreground">Enable webhook for bot</div>
              </div>
            </Button>

            <Button
              onClick={sendTestMessage}
              className="h-12 justify-start"
              variant="outline"
            >
              <Send className="mr-3 h-4 w-4" />
              <div className="text-left">
                <div className="font-medium">Send Test Message</div>
                <div className="text-xs text-muted-foreground">Test bot functionality</div>
              </div>
            </Button>

            <Button
              onClick={getBotInfo}
              className="h-12 justify-start"
              variant="outline"
            >
              <Info className="mr-3 h-4 w-4" />
              <div className="text-left">
                <div className="font-medium">Get Bot Info</div>
                <div className="text-xs text-muted-foreground">Fetch from Telegram API</div>
              </div>
            </Button>

            <Button
              onClick={getWebhookInfo}
              className="h-12 justify-start"
              variant="outline"
            >
              <Activity className="mr-3 h-4 w-4" />
              <div className="text-left">
                <div className="font-medium">Get Webhook Info</div>
                <div className="text-xs text-muted-foreground">Check webhook status</div>
              </div>
            </Button>

            <Button
              onClick={unregisterWebhook}
              className="h-12 justify-start"
              variant="outline"
            >
              <Settings className="mr-3 h-4 w-4" />
              <div className="text-left">
                <div className="font-medium">Unregister Webhook</div>
                <div className="text-xs text-muted-foreground">Disable webhook</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
