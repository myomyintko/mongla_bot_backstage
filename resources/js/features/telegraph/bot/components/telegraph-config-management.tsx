import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Settings, Save, AlertCircle, RefreshCw, Globe, Activity, Send, Info, Copy, Check, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'
import { telegraphService, TelegraphConfig } from '@/services/telegraph'

interface ConfigFormData {
  bot_token: string
  bot_name: string
  bot_username: string
  webhook_domain: string
  webhook_secret: string
  max_connections: number
  http_timeout: number
  http_connection_timeout: number
  default_parse_mode: string
  report_unknown_commands: boolean
  debug: boolean
  allow_callback_queries_from_unknown_chats: boolean
  allow_messages_from_unknown_chats: boolean
  store_unknown_chats_in_db: boolean
}

export function TelegraphConfigManagement() {
  const queryClient = useQueryClient()
  const [copied, setCopied] = useState(false)
  const [showBotToken, setShowBotToken] = useState(false)
  const [formData, setFormData] = useState<ConfigFormData>({
    bot_token: '',
    bot_name: '',
    bot_username: '',
    webhook_domain: '',
    webhook_secret: '',
    max_connections: 40,
    http_timeout: 60,
    http_connection_timeout: 30,
    default_parse_mode: 'markdown',
    report_unknown_commands: true,
    debug: false,
    allow_callback_queries_from_unknown_chats: false,
    allow_messages_from_unknown_chats: true,
    store_unknown_chats_in_db: true,
  })

  const { data: configData, isLoading, error } = useQuery({
    queryKey: ['telegraph-config'],
    queryFn: () => telegraphService.getConfig(),
  })

  // Update form data when config data is loaded
  useEffect(() => {
    if (configData?.success && configData.data) {
      setFormData({
        bot_token: configData.data.bot_token || '',
        bot_name: configData.data.bot_name || '',
        bot_username: configData.data.bot_username || '',
        webhook_domain: configData.data.webhook_domain || '',
        webhook_secret: configData.data.webhook_secret || '',
        max_connections: configData.data.max_connections || 40,
        http_timeout: configData.data.http_timeout || 60,
        http_connection_timeout: configData.data.http_connection_timeout || 30,
        default_parse_mode: configData.data.default_parse_mode || 'markdown',
        report_unknown_commands: configData.data.report_unknown_commands ?? true,
        debug: configData.data.debug ?? false,
        allow_callback_queries_from_unknown_chats: configData.data.allow_callback_queries_from_unknown_chats ?? false,
        allow_messages_from_unknown_chats: configData.data.allow_messages_from_unknown_chats ?? true,
        store_unknown_chats_in_db: configData.data.store_unknown_chats_in_db ?? true,
      })
    }
  }, [configData])

  const updateConfigMutation = useMutation({
    mutationFn: (config: Partial<TelegraphConfig>) => telegraphService.updateConfig(config),
    onSuccess: (response) => {
      if (response.success) {
        toast.success(response.message || 'Configuration updated successfully', {
          description: 'Configuration cache cleared and queue workers restarted.',
          duration: 5000,
        })
        queryClient.invalidateQueries({ queryKey: ['telegraph-config'] })
        queryClient.invalidateQueries({ queryKey: ['telegraph-bot'] })
      } else {
        toast.error(response.message || 'Failed to update configuration')
      }
    },
    onError: (error: any) => {
      toast.error('Error updating configuration')
      console.error('Error:', error)
    },
  })

  const handleInputChange = (field: keyof ConfigFormData, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Filter out empty values for optional fields
    const configToUpdate: Partial<TelegraphConfig> = {}

    if (formData.bot_token) configToUpdate.bot_token = formData.bot_token
    if (formData.bot_name) configToUpdate.bot_name = formData.bot_name
    if (formData.bot_username) configToUpdate.bot_username = formData.bot_username
    if (formData.webhook_domain) configToUpdate.webhook_domain = formData.webhook_domain
    if (formData.webhook_secret) configToUpdate.webhook_secret = formData.webhook_secret
    configToUpdate.max_connections = formData.max_connections
    configToUpdate.http_timeout = formData.http_timeout
    configToUpdate.http_connection_timeout = formData.http_connection_timeout
    configToUpdate.default_parse_mode = formData.default_parse_mode
    configToUpdate.report_unknown_commands = formData.report_unknown_commands
    configToUpdate.debug = formData.debug
    configToUpdate.allow_callback_queries_from_unknown_chats = formData.allow_callback_queries_from_unknown_chats
    configToUpdate.allow_messages_from_unknown_chats = formData.allow_messages_from_unknown_chats
    configToUpdate.store_unknown_chats_in_db = formData.store_unknown_chats_in_db

    updateConfigMutation.mutate(configToUpdate)
  }

  // Webhook action functions
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
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Configuration Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  if (error || !configData?.success) {
    return (
      <Alert variant="destructive" className="border-destructive/50 bg-destructive/10">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="text-destructive">
          {configData?.message || 'Failed to load configuration. Please check your environment variables.'}
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <Settings className="mr-2 h-5 w-5" />
          Configuration Management
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Bot Settings */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Bot Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bot_token">Bot Token</Label>
                <div className="relative">
                  <Input
                    id="bot_token"
                    type={showBotToken ? "text" : "password"}
                    value={formData.bot_token}
                    onChange={(e) => handleInputChange('bot_token', e.target.value)}
                    placeholder="Enter bot token from @BotFather"
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowBotToken(!showBotToken)}
                  >
                    {showBotToken ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bot_name">Bot Name</Label>
                <Input
                  id="bot_name"
                  value={formData.bot_name}
                  onChange={(e) => handleInputChange('bot_name', e.target.value)}
                  placeholder="Bot display name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bot_username">Bot Username</Label>
                <Input
                  id="bot_username"
                  value={formData.bot_username}
                  onChange={(e) => handleInputChange('bot_username', e.target.value)}
                  placeholder="@botusername"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="default_parse_mode">Default Parse Mode</Label>
                <Select
                  value={formData.default_parse_mode}
                  onValueChange={(value) => handleInputChange('default_parse_mode', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="html">HTML</SelectItem>
                    <SelectItem value="markdown">Markdown</SelectItem>
                    <SelectItem value="MarkdownV2">MarkdownV2</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Webhook Settings */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Webhook Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="webhook_domain">Webhook Domain</Label>
                <Input
                  id="webhook_domain"
                  value={formData.webhook_domain}
                  onChange={(e) => handleInputChange('webhook_domain', e.target.value)}
                  placeholder="https://your-domain.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="webhook_secret">Webhook Secret</Label>
                <Input
                  id="webhook_secret"
                  type="password"
                  value={formData.webhook_secret}
                  onChange={(e) => handleInputChange('webhook_secret', e.target.value)}
                  placeholder="Optional webhook secret token"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max_connections">Max Connections</Label>
                <Input
                  id="max_connections"
                  type="number"
                  min="1"
                  max="100"
                  value={formData.max_connections}
                  onChange={(e) => handleInputChange('max_connections', parseInt(e.target.value))}
                />
              </div>
            </div>

            {/* Webhook Actions */}
            <div className="pt-4 border-t border-border/40">
              <h4 className="text-sm font-medium text-foreground mb-3">Webhook Actions</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Button
                  onClick={registerWebhook}
                  className="h-12 justify-start p-3"
                  variant="outline"
                  type="button"
                >
                  <div className="flex items-center w-full">
                    <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30 mr-3">
                      <Globe className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="text-left flex-1">
                      <div className="font-medium">Register Webhook</div>
                      <div className="text-xs text-muted-foreground mt-0.5">Enable webhook for bot</div>
                    </div>
                  </div>
                </Button>

                <Button
                  onClick={unregisterWebhook}
                  className="h-12 justify-start p-3"
                  variant="outline"
                  type="button"
                >
                  <div className="flex items-center w-full">
                    <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30 mr-3">
                      <Settings className="h-4 w-4 text-red-600 dark:text-red-400" />
                    </div>
                    <div className="text-left flex-1">
                      <div className="font-medium">Unregister Webhook</div>
                      <div className="text-xs text-muted-foreground mt-0.5">Disable webhook</div>
                    </div>
                  </div>
                </Button>

                <Button
                  onClick={getWebhookInfo}
                  className="h-12 justify-start p-3"
                  variant="outline"
                  type="button"
                >
                  <div className="flex items-center w-full">
                    <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30 mr-3">
                      <Activity className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div className="text-left flex-1">
                      <div className="font-medium">Get Webhook Info</div>
                      <div className="text-xs text-muted-foreground mt-0.5">Check webhook status</div>
                    </div>
                  </div>
                </Button>
              </div>
            </div>
          </div>

          {/* HTTP Settings */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">HTTP Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="http_timeout">HTTP Timeout (seconds)</Label>
                <Input
                  id="http_timeout"
                  type="number"
                  min="1"
                  max="300"
                  value={formData.http_timeout}
                  onChange={(e) => handleInputChange('http_timeout', parseInt(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="http_connection_timeout">Connection Timeout (seconds)</Label>
                <Input
                  id="http_connection_timeout"
                  type="number"
                  min="1"
                  max="60"
                  value={formData.http_connection_timeout}
                  onChange={(e) => handleInputChange('http_connection_timeout', parseInt(e.target.value))}
                />
              </div>
            </div>
          </div>

          {/* System Settings */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">System Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="report_unknown_commands">Report Unknown Commands</Label>
                  <div className="text-sm text-muted-foreground">
                    Log unknown webhook commands as exceptions in application logs
                  </div>
                </div>
                <Switch
                  id="report_unknown_commands"
                  checked={formData.report_unknown_commands}
                  onCheckedChange={(checked) => handleInputChange('report_unknown_commands', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="debug">Debug Mode</Label>
                  <div className="text-sm text-muted-foreground">
                    Dump received webhook messages to logs for debugging
                  </div>
                </div>
                <Switch
                  id="debug"
                  checked={formData.debug}
                  onCheckedChange={(checked) => handleInputChange('debug', checked)}
                />
              </div>
            </div>
          </div>

          {/* Security Settings */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Security Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="allow_callback_queries_from_unknown_chats">Allow Callback Queries from Unknown Chats</Label>
                  <div className="text-sm text-muted-foreground">
                    Allow callback queries from unregistered chats
                  </div>
                </div>
                <Switch
                  id="allow_callback_queries_from_unknown_chats"
                  checked={formData.allow_callback_queries_from_unknown_chats}
                  onCheckedChange={(checked) => handleInputChange('allow_callback_queries_from_unknown_chats', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="allow_messages_from_unknown_chats">Allow Messages from Unknown Chats</Label>
                  <div className="text-sm text-muted-foreground">
                    Allow messages and commands from unregistered chats
                  </div>
                </div>
                <Switch
                  id="allow_messages_from_unknown_chats"
                  checked={formData.allow_messages_from_unknown_chats}
                  onCheckedChange={(checked) => handleInputChange('allow_messages_from_unknown_chats', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="store_unknown_chats_in_db">Store Unknown Chats in Database</Label>
                  <div className="text-sm text-muted-foreground">
                    Automatically save unknown chats as new TelegraphChat models
                  </div>
                </div>
                <Switch
                  id="store_unknown_chats_in_db"
                  checked={formData.store_unknown_chats_in_db}
                  onCheckedChange={(checked) => handleInputChange('store_unknown_chats_in_db', checked)}
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={updateConfigMutation.isPending}
              className="min-w-32"
            >
              {updateConfigMutation.isPending ? (
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              {updateConfigMutation.isPending ? 'Updating...' : 'Save Configuration'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}