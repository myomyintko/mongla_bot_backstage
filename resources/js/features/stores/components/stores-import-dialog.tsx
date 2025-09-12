import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Download, FileSpreadsheet, Upload } from 'lucide-react'
import * as XLSX from 'xlsx'
import { storesService } from '@/services/stores-service'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

const formSchema = z.object({
  file: z
    .instanceof(FileList)
    .refine((files) => files.length > 0, {
      message: 'Please upload a file',
    })
    .refine(
      (files) => {
        const file = files?.[0]
        const allowedTypes = [
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        ]
        const fileName = file?.name?.toLowerCase() || ''
        
        return allowedTypes.includes(file?.type) || fileName.endsWith('.xlsx')
      },
      'Please upload Excel format (.xlsx) only.'
    ),
})

type StoresImportDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function StoresImportDialog({
  open,
  onOpenChange,
}: StoresImportDialogProps) {
  const queryClient = useQueryClient()
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { file: undefined },
  })

  const fileRef = form.register('file')

  const importMutation = useMutation({
    mutationFn: (file: File) => storesService.bulkImport(file),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['stores'] })
      toast.success(response.message || 'Stores imported successfully!')
      onOpenChange(false)
      form.reset()
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to import stores')
    },
  })

  const downloadTemplate = () => {
    // Create Excel template data with comprehensive examples
    const templateData = [
      // Header row
      ['Name', 'Description', 'Media File', 'Address', 'Open Hour', 'Close Hour', 'Status', 'Recommended', 'Category ID'],
      // Sample data rows
      ['Golden Dragon Restaurant', 'Authentic Chinese cuisine with fresh ingredients', 'restaurant1.jpg', '123 Main Street, Downtown', '10:00', '22:00', 'Active', 'Yes', '1'],
      ['Spicy Hot Pot House', 'Experience the authentic Sichuan hot pot', 'hotpot.jpg', '456 Food Court, Mall District', '11:00', '23:00', 'Active', 'Yes', '1'],
      ['Tech Gadgets Store', 'Latest electronics and gadgets', 'tech-store.jpg', '789 Tech Plaza, Innovation District', '09:00', '21:00', 'Active', 'No', '2'],
      ['Fashion Boutique', 'Trendy clothing and accessories', 'fashion.jpg', '321 Fashion Avenue, Shopping Center', '10:00', '20:00', 'Inactive', 'No', '3'],
    ]

    // Create a new workbook
    const wb = XLSX.utils.book_new()
    
    // Create a worksheet
    const ws = XLSX.utils.aoa_to_sheet(templateData)
    
    // Set column widths for better readability
    ws['!cols'] = [
      { wch: 20 }, // Name
      { wch: 40 }, // Description
      { wch: 20 }, // Media File
      { wch: 30 }, // Address
      { wch: 12 }, // Open Hour
      { wch: 12 }, // Close Hour
      { wch: 10 }, // Status
      { wch: 12 }, // Recommended
      { wch: 12 }, // Category ID
    ]

    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Stores Template')

    // Generate Excel file and download
    XLSX.writeFile(wb, 'stores_import_template.xlsx')
  }

  const onSubmit = () => {
    const file = form.getValues('file')

    if (file && file[0]) {
      importMutation.mutate(file[0])
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        onOpenChange(val)
        form.reset()
      }}
    >
      <DialogContent className='gap-0 sm:max-w-md p-0 overflow-hidden'>
        {/* Simple Header */}
        <div className='p-6 pb-4'>
          <DialogHeader className='text-center space-y-3'>
            {/* <div className='mx-auto w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center'>
              <FileSpreadsheet className='h-6 w-6 text-primary' />
            </div> */}
            <DialogTitle className='text-xl font-semibold'>
              Import Stores
            </DialogTitle>
            <DialogDescription className='text-sm text-muted-foreground max-w-xs mx-auto'>
              Upload an Excel file to bulk import stores with all necessary information.
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Content */}
        <div className='px-6 pb-6 space-y-6'>
          {/* Template Section */}
          <div className='rounded-lg border border-dashed border-border bg-muted/30 p-6 text-center'>
            <div className='space-y-3'>
              <div className='mx-auto w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center'>
                <FileSpreadsheet className='h-5 w-5 text-primary' />
              </div>
              <div className='space-y-1'>
                <h3 className='font-medium text-sm'>
                  Download Template
                </h3>
                <p className='text-xs text-muted-foreground'>
                  Get started with our pre-formatted Excel template
                </p>
              </div>
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={downloadTemplate}
                className='gap-2'
              >
                <Download className='h-4 w-4' />
                Download
              </Button>
            </div>
          </div>

          {/* Upload Section */}
          <div className='space-y-3'>
            <div className='text-center space-y-1'>
              <h3 className='font-medium text-sm'>
                Upload File
              </h3>
              <p className='text-xs text-muted-foreground'>
                Select your Excel file (.xlsx) to import
              </p>
            </div>
            
            <Form {...form}>
              <form id='stores-import-form' onSubmit={form.handleSubmit(onSubmit)}>
                <FormField
                  control={form.control}
                  name='file'
                  render={() => (
                    <FormItem>
                      <FormControl>
                        <Input 
                          type='file' 
                          {...fileRef} 
                          className='h-10 border-dashed border-2 cursor-pointer file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-medium file:bg-primary file:text-primary-foreground'
                          accept='.xlsx'
                        />
                      </FormControl>
                      <FormMessage />
                      <div className='flex items-center justify-center gap-1.5 text-xs text-muted-foreground'>
                        <div className='w-1 h-1 bg-green-500 rounded-full'></div>
                        <span>Excel (.xlsx) format only</span>
                      </div>
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          </div>
        </div>

        {/* Footer */}
        <div className='border-t border-border px-6 py-4'>
          <div className='flex gap-3'>
            <DialogClose asChild>
              <Button variant='outline' className='flex-1'>
                Cancel
              </Button>
            </DialogClose>
            <Button 
              type='submit' 
              form='stores-import-form' 
              className='flex-1 gap-2'
              disabled={importMutation.isPending}
            >
              {importMutation.isPending ? (
                <>
                  <div className='w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin'></div>
                  Importing...
                </>
              ) : (
                <>
                  <Upload className='h-4 w-4' />
                  Import Stores
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
