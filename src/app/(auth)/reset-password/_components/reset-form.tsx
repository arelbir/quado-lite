"use client"
import { zodResolver } from "@hookform/resolvers/zod"

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Button, LoadingButton } from "@/components/ui/button"
import { FormError } from "@/components/shared/form-error"
import { FormSuccess } from "@/components/shared/form-success"
import { ResetSchema } from "@/features/auth/schemas/auth"
import { reset } from "@/features/auth/actions/auth-actions"
import { Icons } from "@/components/shared/icons"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import {  Link } from "@/components/ui/link"
import { useAction } from "next-safe-action/hooks"
import { isExecuting } from "next-safe-action/status"
import { useTranslations } from 'next-intl'




export const ResetPasswordForm = () => {
    const t = useTranslations('auth');
    // const callbackUrl = searchParams.get("callbackUrl");
    const [error, setError] = useState<string | undefined>("");
    const [success, setSuccess] = useState<string | undefined>("");


    const { execute, status } = useAction(reset, {
        onSuccess: (res) => {
            if (res?.error) {
                form.reset();
                setError(res.error);
            } else if (res?.success) {
                form.reset();
                setSuccess(res?.success);
                res.link && toast.success(<Link href={res.link}>
                    {t('messages.resetPasswordNow')}
                </Link>, {duration: 0})
            }
        },
        onError: () => {
            setError(t('messages.somethingWentWrong'))
        }
    });

    const isPending = isExecuting(status);
    const form = useForm<ResetSchema>({
        resolver: zodResolver(ResetSchema),
        defaultValues: {
            email: ""
        },
    })

    // 2. Define a submit handler.
    function onSubmit(values: ResetSchema) {
        setError("");
        setSuccess("");

        execute(values)
    }
    return (
        <>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4" >
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem className="grid gap-2">
                                <FormLabel>{t('fields.email')}</FormLabel>
                                <FormControl>
                                    <Input
                                        disabled={isPending}
                                        placeholder={t('placeholders.email')}
                                        autoComplete="email"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormError message={error} />
                    <FormSuccess message={success} />
                    <LoadingButton loading={isPending}
                        className="w-full">
                        {t('actions.sendResetEmail')}
                    </LoadingButton>
                </form>
            </Form>
        </>

    )
}

