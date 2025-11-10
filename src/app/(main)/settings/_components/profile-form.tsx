"use client"
import { updateProfile } from '@/server/actions/user'
import { LoadingButton } from '@/components/ui/button'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { getUpdatedFields } from '@/lib/object-utils'
import { ProfileSchema } from '@/schema/settings'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAction } from 'next-safe-action/hooks'
import { isExecuting } from 'next-safe-action/status'
import Link from 'next/link'
import React from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { isEmpty } from 'radash'
import UserCard from './user-card'
import { useTranslations } from 'next-intl'

type ProfileProps = {
  initialValues: ProfileSchema
}

export const ProfileForm = ({ initialValues }: ProfileProps) => {
  const t = useTranslations('settings');

  const { execute, status } = useAction(updateProfile, {
    onSuccess: (res) => {
      if (res.error) {
        toast.error(res.error)
      } else {
        toast.success(res.success)
      }
    },
    onError: (e) => {
      console.log(e)
      toast.error(e.fetchError || e.serverError || t('messages.errorOccurred'))
    }
  })

  const isPending = isExecuting(status);

  const form = useForm<ProfileSchema>({
    resolver: zodResolver(ProfileSchema),
    defaultValues: {
      ...initialValues
    }
  })

  const onSubmit = (data: ProfileSchema) => {
    const reqData = getUpdatedFields(initialValues, data)
    if (isEmpty(reqData)) return toast.error(t('messages.noChangesMade'))
    execute(reqData as Required<typeof reqData>)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
        <FormField
          control={form.control}
          name='username'
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('fields.username')}</FormLabel>
              <FormControl>
                <Input placeholder={t('placeholders.username')} {...field} />
              </FormControl>
              <FormDescription>
                {t('descriptions.username')}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='image'
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('fields.image')}</FormLabel>
              <FormControl>
                <Input placeholder={t('placeholders.imageUrl')} className='hidden' {...field} />
              </FormControl>
              <UserCard onChange={field.onChange} src={initialValues.image} />
              <FormDescription>
                {t('descriptions.image')}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <LoadingButton loading={isPending}>{t('actions.updateProfile')}</LoadingButton>
      </form>
    </Form>
  )
}
