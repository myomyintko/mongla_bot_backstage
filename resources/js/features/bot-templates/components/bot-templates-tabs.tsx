import { CanView } from '@/components/permission/permission-gate'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { BotTemplate, TEMPLATE_TYPES } from '@/features/bot-templates/data/schema'
import { botTemplatesService } from '@/services/bot-templates-service'
import { TelegramEditor } from '@/components/telegram-editor'
import { MessageSquare, Save, Settings } from 'lucide-react'
import React, { useState, useRef } from 'react'
import { toast } from 'sonner'

// Sample data for template preview
const getSampleData = () => {
  const sampleData: Record<string, string> = {
    // Common variables
    currentTime: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    currentDate: new Date().toLocaleDateString('en-US'),
    
    // Telegram user variables
    userId: '123456789',
    userFirstName: 'John',
    userLastName: 'Doe',
    userUsername: 'johndoe',
    userFullName: 'John Doe',
    userMention: '@johndoe',
    userLanguageCode: 'en',
    userIsBot: 'false',
    userIsPremium: 'true',
    
    // Bot variables
    botName: 'Mongolia Bot',
    botUsername: '@mongolia_bot',
    
    // Store variables
    storeName: 'Sample Store',
    storeDescription: 'A great sample store with amazing products',
    storeAddress: '123 Sample Street, Sample City',
    storeHours: '9:00 AM - 6:00 PM',
    storeCategory: 'Food',
    storeStatus: 'Open',
    
    // Search variables
    searchTerm: 'pizza',
    resultCount: '5',
    
    // Advertisement variables
    adTitle: 'Special Offer',
    adDescription: 'Get 50% off today!',
    
    // Pagination variables
    currentPage: '2',
    totalPages: '10',
    
    // Menu variables
    categoryName: 'Restaurants',
    storeCount: '15',
    
    // Error variables
    errorMessage: 'Connection timeout',
  }
  
  return sampleData
}

// Function to convert Telegram MarkdownV2 to HTML for preview
const telegramMarkdownV2ToHtml = (text: string): string => {
  return text
    // Bold: *text* -> <strong>text</strong>
    .replace(/\*([^*]+)\*/g, '<strong>$1</strong>')
    // Italic: _text_ -> <em>text</em>
    .replace(/_([^_]+)_/g, '<em>$1</em>')
    // Code: `text` -> <code>text</code>
    .replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">$1</code>')
    // Unescape MarkdownV2 special characters
    .replace(/\\([!._-])/g, '$1')
    // Line breaks
    .replace(/\n/g, '<br>')
}

// Function to render template preview with sample data
const renderTemplatePreview = (template: BotTemplate) => {
  if (!template || !template.content) {
    return 'No template content available'
  }
  
  const sampleData = getSampleData()
  let content = template.content
  
  // Replace variables with sample data
  Object.entries(sampleData).forEach(([key, value]) => {
    content = content.replace(new RegExp(`\\{${key}\\}`, 'g'), value)
  })
  
  return content
}

interface BotTemplatesTabsProps {
  data: BotTemplate[]
}

export function BotTemplatesTabs({ data }: BotTemplatesTabsProps) {
  const [activeTab, setActiveTab] = useState<string>('welcome')
  const insertVariableRef = useRef<((variable: string) => void) | null>(null)
  const [editingContent, setEditingContent] = useState<string>('')
  const [isEditing, setIsEditing] = useState<boolean>(false)
  const [templates, setTemplates] = useState<BotTemplate[]>(Array.isArray(data) ? data : [])

  // Handle variable insertion
  const handleInsertVariable = (variable: string) => {
    if (insertVariableRef.current) {
      insertVariableRef.current(`{${variable}}`)
    }
  }
  
  // Update templates when data changes
  React.useEffect(() => {
    setTemplates(Array.isArray(data) ? data : [])
  }, [data])

  // Update editing content when active tab changes
  React.useEffect(() => {
    const currentTemplate = getTemplateByType(activeTab)
    if (currentTemplate) {
      if (isEditing) {
        // If editing, update the content to match the new template
        setEditingContent(currentTemplate.content)
      }
    }
  }, [activeTab, templates])
  
  // Get template by type
  const getTemplateByType = (type: string) => {
    return templates.find(template => template.type === type)
  }

  const handleToggleActive = async (template: BotTemplate) => {
    try {
      const newActiveState = !template.is_active
      
      if (template.is_active) {
        await botTemplatesService.deactivateBotTemplate(template.id)
        toast.success("Template deactivated", {
          description: `${TEMPLATE_TYPES[template.type as keyof typeof TEMPLATE_TYPES]} has been deactivated.`,
        })
      } else {
        await botTemplatesService.activateBotTemplate(template.id)
        toast.success("Template activated", {
          description: `${TEMPLATE_TYPES[template.type as keyof typeof TEMPLATE_TYPES]} has been activated.`,
        })
      }
      
      // Update the local state
      setTemplates(prevTemplates => 
        prevTemplates.map(t => 
          t.id === template.id 
            ? { ...t, is_active: newActiveState }
            : t
        )
      )
    } catch (error) {
      toast.error("Error", {
        description: "Failed to update template status.",
      })
    }
  }

  const handleEditContent = (template: BotTemplate) => {
    setEditingContent(template.content)
    setIsEditing(true)
  }

  const handleSaveContent = async (template: BotTemplate) => {
    try {
      await botTemplatesService.updateBotTemplate(template.id, {
        content: editingContent
      })
      
      // Update the local state instead of reloading the page
      setTemplates(prevTemplates => 
        prevTemplates.map(t => 
          t.id === template.id 
            ? { ...t, content: editingContent }
            : t
        )
      )
      
      toast.success("Template updated", {
        description: "Template content has been updated successfully.",
      })
      setIsEditing(false)
    } catch (error) {
      toast.error("Error", {
        description: "Failed to update template content.",
      })
    }
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditingContent('')
  }

  // Handle tab switching - preserve editing state but update content
  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab)
  }

  const currentTemplate = getTemplateByType(activeTab)

  return (
    <div className="w-full">
      {/* Template Type Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          {Object.entries(TEMPLATE_TYPES).map(([type, name]) => {
            const isActive = activeTab === type
            return (
              <button
                key={type}
                onClick={() => handleTabChange(type)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  isActive
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {name}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Panel - Template Preview */}
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6 dark:bg-gray-800 dark:border-gray-700">
            <div className="flex items-center space-x-2 mb-4">
              <MessageSquare className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold">Template Preview</h3>
            </div>
            
            {currentTemplate ? (
              <div className="space-y-4">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 dark:bg-gray-800 dark:border-gray-700">
                  <div className="space-y-3">
                    <div className="bg-white border border-gray-200 rounded p-3 text-sm dark:bg-gray-900 dark:border-gray-600">
                      <div 
                        className="prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ 
                          __html: telegramMarkdownV2ToHtml(renderTemplatePreview(currentTemplate)) 
                        }}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Updated {new Date(currentTemplate.updated_at).toLocaleDateString()}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                <p>No template found for this type</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Template Controls */}
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6 dark:bg-gray-800 dark:border-gray-700">
            <div className="flex items-center space-x-2 mb-6">
              <Settings className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold">Template Settings</h3>
            </div>
            
            {currentTemplate ? (
              <div className="space-y-6">
                {/* Template Status Toggle */}
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="template-status" className="text-sm font-medium">
                      Template Status
                    </Label>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Enable or disable this template for use in the bot
                    </p>
                  </div>
                  <CanView resource="bot-templates">
                    <Switch
                      id="template-status"
                      checked={currentTemplate.is_active}
                      onCheckedChange={() => handleToggleActive(currentTemplate)}
                    />
                  </CanView>
                </div>

                {/* Template Content */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Label className="text-sm font-medium">Template Content</Label>
                      {/* {isEditing && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Editing {TEMPLATE_TYPES[activeTab as keyof typeof TEMPLATE_TYPES]}
                        </span>
                      )} */}
                    </div>
                    {!isEditing && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditContent(currentTemplate)}
                      >
                        Edit
                      </Button>
                    )}
                  </div>
                  
                  {isEditing ? (
                    <div className="space-y-3">
                      <div className="mt-2">
                        <TelegramEditor
                          value={editingContent}
                          onChange={setEditingContent}
                          placeholder="Enter your template content..."
                          height={300}
                          onInsertVariable={(insertFn) => {
                            insertVariableRef.current = insertFn
                          }}
                        />
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={() => handleSaveContent(currentTemplate)}
                          className="flex items-center space-x-1"
                        >
                          <Save className="h-4 w-4" />
                          <span>Save</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleCancelEdit}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-1 p-3 bg-gray-50 border border-gray-200 rounded-md dark:bg-gray-800 dark:border-gray-700">
                      <pre className="text-sm whitespace-pre-wrap font-mono">
                        {currentTemplate.content}
                      </pre>
                    </div>
                  )}
                </div>

                {/* Variables */}
                {currentTemplate.variables && currentTemplate.variables.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium">Available Variables</Label>
                    <div className="mt-1 space-y-2">
                      {currentTemplate.variables.map((variable) => (
                        isEditing ? (
                          <button
                            key={variable}
                            type="button"
                            onClick={() => handleInsertVariable(variable)}
                            className="w-full flex items-center space-x-2 p-2 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 hover:border-blue-300 transition-colors cursor-pointer dark:bg-blue-900 dark:border-blue-700 dark:hover:bg-blue-800 dark:hover:border-blue-600"
                            title={`Click to insert {${variable}} into the editor`}
                          >
                            <code className="text-sm font-mono text-blue-800 dark:text-blue-200">{`{${variable}}`}</code>
                            <span className="text-xs text-blue-600 dark:text-blue-400">Dynamic variable</span>
                          </button>
                        ) : (
                          <div
                            key={variable}
                            className="w-full flex items-center space-x-2 p-2 bg-blue-50 border border-blue-200 rounded dark:bg-blue-900 dark:border-blue-700"
                          >
                            <code className="text-sm font-mono text-blue-800 dark:text-blue-200">{`{${variable}}`}</code>
                            <span className="text-xs text-blue-600 dark:text-blue-400">Dynamic variable</span>
                          </div>
                        )
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Settings className="h-12 w-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                <p>Select a template type to view settings</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
