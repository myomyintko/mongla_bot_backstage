import React from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'
import { profileService } from '@/services/profile-service'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { MultiMediaUploader } from '@/components/multi-media-uploader'
import { Separator } from '@/components/ui/separator'

const profileFormSchema = z.object({
  name: z
    .string()
    .min(1, 'Please enter your name.')
    .min(2, 'Name must be at least 2 characters.')
    .max(30, 'Name must not be longer than 30 characters.'),
  avatar: z.array(z.string()).optional(),
})

const passwordFormSchema = z.object({
  current_password: z.string().min(1, 'Please enter your current password.'),
  new_password: z.string().min(8, 'Password must be at least 8 characters.'),
  new_password_confirmation: z.string().min(1, 'Please confirm your new password.'),
}).refine((data) => data.new_password === data.new_password_confirmation, {
  message: "Passwords don't match",
  path: ["new_password_confirmation"],
})

type ProfileFormValues = z.infer<typeof profileFormSchema>
type PasswordFormValues = z.infer<typeof passwordFormSchema>

export function ProfileForm() {
  const { user, setUser } = useAuthStore((state) => state.auth)
  const queryClient = useQueryClient()

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: user?.name || '',
      avatar: user?.avatar ? [user.avatar] : [],
    },
    mode: 'onChange',
  })

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      current_password: '',
      new_password: '',
      new_password_confirmation: '',
    },
  })

  // Fetch fresh profile data
  const { data: profileData, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: () => profileService.getProfile(),
    enabled: !!user,
  })

  // Update form when profile data is loaded
  React.useEffect(() => {
    if (profileData?.user) {
      form.reset({
        name: profileData.user.name,
        avatar: profileData.user.avatar ? [profileData.user.avatar] : [],
      })
    }
  }, [profileData, form])

  const updateProfileMutation = useMutation({
    mutationFn: (data: ProfileFormValues) => profileService.updateProfile({
      name: data.name,
    }),
    onSuccess: (response) => {
      toast.success('Profile updated successfully')
      setUser(response.user)
      queryClient.invalidateQueries({ queryKey: ['profile'] })
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update profile')
    },
  })

  const updateAvatarMutation = useMutation({
    mutationFn: (avatar: string | null) => profileService.updateAvatar({ avatar }),
    onSuccess: (response) => {
      toast.success('Avatar updated successfully')
      if (user) {
        setUser({ ...user, avatar: response.avatar })
      }
      queryClient.invalidateQueries({ queryKey: ['profile'] })
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update avatar')
    },
  })

  const updatePasswordMutation = useMutation({
    mutationFn: (data: PasswordFormValues) => profileService.updatePassword(data),
    onSuccess: () => {
      toast.success('Password updated successfully')
      passwordForm.reset()
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update password')
    },
  })

  const onSubmit = (data: ProfileFormValues) => {
    updateProfileMutation.mutate(data)
  }

  const onPasswordSubmit = (data: PasswordFormValues) => {
    updatePasswordMutation.mutate(data)
  }

  const handleAvatarChange = (files: string[]) => {
    const avatarUrl = files.length > 0 ? files[0] : null
    updateAvatarMutation.mutate(avatarUrl)
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className='space-y-8'
        >
        <FormField
          control={form.control}
          name='name'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder='Your name' {...field} />
              </FormControl>
              <FormDescription>
                This is your public display name. It can be your real name or a
                pseudonym.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormItem>
          <FormLabel>Username</FormLabel>
          <FormControl>
            <Input 
              value={user?.username || ''} 
              disabled 
              placeholder='username' 
            />
          </FormControl>
          <FormDescription>
            Your username cannot be changed. Contact support if you need assistance.
          </FormDescription>
        </FormItem>
        <FormItem>
          <FormLabel>Email</FormLabel>
          <FormControl>
            <Input 
              value={user?.email || ''} 
              disabled 
              placeholder='your@email.com' 
            />
          </FormControl>
          <FormDescription>
            Your email address cannot be changed. Contact support if you need assistance.
          </FormDescription>
        </FormItem>
        <FormField
          control={form.control}
          name='avatar'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Avatar</FormLabel>
              <FormControl>
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={user?.avatar || undefined} alt={user?.name || 'User'} />
                    <AvatarFallback>
                      {user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <MultiMediaUploader
                      value={field.value || []}
                      onChange={handleAvatarChange}
                      maxFiles={1}
                      accept="image/*"
                      listType="picture-card"
                      showUploadList={true}
                      showDownloadButton={false}
                      uploadPath="avatars"
                    />
                  </div>
                </div>
              </FormControl>
              <FormDescription>
                Upload a profile picture. Recommended size: 200x200 pixels.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button 
          type='submit' 
          disabled={updateProfileMutation.isPending}
        >
          {updateProfileMutation.isPending ? 'Updating...' : 'Update profile'}
        </Button>
        </form>
      </Form>

      <Separator className="my-8" />

      <div className="space-y-6 pb-12">
      <div>
        <h3 className="text-lg font-medium">Change Password</h3>
        <p className="text-sm text-muted-foreground">
          Update your password to keep your account secure.
        </p>
      </div>

      <Form {...passwordForm}>
        <form
          onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
          className='space-y-6'
        >
          <FormField
            control={passwordForm.control}
            name='current_password'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Current Password</FormLabel>
                <FormControl>
                  <Input 
                    type="password" 
                    placeholder='Enter your current password' 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={passwordForm.control}
            name='new_password'
            render={({ field }) => (
              <FormItem>
                <FormLabel>New Password</FormLabel>
                <FormControl>
                  <Input 
                    type="password" 
                    placeholder='Enter your new password' 
                    {...field} 
                  />
                </FormControl>
                <FormDescription>
                  Password must be at least 8 characters long.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={passwordForm.control}
            name='new_password_confirmation'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm New Password</FormLabel>
                <FormControl>
                  <Input 
                    type="password" 
                    placeholder='Confirm your new password' 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button 
            type='submit' 
            disabled={updatePasswordMutation.isPending}
          >
            {updatePasswordMutation.isPending ? 'Updating...' : 'Update password'}
          </Button>
        </form>
      </Form>
      </div>
    </div>
  )
}
