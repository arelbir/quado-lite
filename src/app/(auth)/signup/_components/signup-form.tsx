"use client"
import { zodResolver } from "@hookform/resolvers/zod"

import { useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { LoadingButton } from "@/components/ui/button"
import { useRouter, useSearchParams } from "next/navigation"
import { FormError } from "@/components/shared/form-error"
import { FormSuccess } from "@/components/shared/form-success"
import { SignupSchema } from "@/schema/auth"
import { signup } from "@/features/auth/actions/auth-actions"
import { PasswordInput } from "@/components/ui/password-input"
import { toast } from "sonner"
import {  Link } from "@/components/ui/link"
import { useTranslations } from 'next-intl'




export const SignupForm = () => {
    const t = useTranslations('auth');
    const [isPending, startTransition] = useTransition()
    const searchParams = useSearchParams();
    // const callbackUrl = searchParams.get("callbackUrl");

    const urlError = searchParams.get("error") === "OAuthAccountNotLinked"
        ? t('messages.emailInUse')
        : "";
    const [error, setError] = useState<string | undefined>("");
    const [success, setSuccess] = useState<string | undefined>("");

    const form = useForm<SignupSchema>({
        resolver: zodResolver(SignupSchema),
        defaultValues: {
            email: "",
            password: "",
            confirmPassword: "",
            name: "",
        },
    })

    // 2. Define a submit handler.
    function onSubmit(values: SignupSchema) {
        setError("");
        setSuccess("");

        startTransition(() => {
            signup(values)
                .then((res) => {
                    if (res.data?.error) {
                        setError(res.data.error);
                    }
                    if (res.data?.success) {
                        setSuccess(res.data.success);
                        if (res.data.link) {
                            toast.success(<Link href={res.data.link}>{t('messages.clickToVerifyEmail')}</Link>, {
                                duration: 0,
                            })
                        }
                    }

                })
                .catch(() => setError(t('messages.somethingWentWrong')));
        })

    }
    return (
        <>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4" >
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem className="grid gap-2">
                                <FormLabel>{t('fields.username')}</FormLabel>
                                <FormControl>
                                    <Input
                                        disabled={isPending}
                                        id="name"
                                        placeholder={t('placeholders.username')}

                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem className="grid gap-2">
                                <FormLabel>{t('fields.email')}</FormLabel>
                                <FormControl>
                                    <Input
                                        disabled={isPending}
                                        id="email"
                                        type="email"
                                        placeholder={t('placeholders.emailExample')}

                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem className="grid gap-2">
                                <FormLabel>{t('fields.password')}</FormLabel>
                                <FormControl>
                                    <PasswordInput
                                        disabled={isPending}
                                        id="password"
                                        placeholder={t('placeholders.password')}
                                        autoComplete="new-password"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="confirmPassword"
                        render={({ field }) => (
                            <FormItem className="grid gap-2">
                                <FormLabel>{t('fields.confirmPassword')}</FormLabel>
                                <FormControl>
                                    <PasswordInput
                                        disabled={isPending}
                                        id="password"
                                        placeholder={t('placeholders.password')}
                                        autoComplete="new-password"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormError message={error ?? urlError} />
                    <FormSuccess message={success} />
                    <LoadingButton loading={isPending}
                        className="w-full">
                        {t('actions.createAccount')}
                    </LoadingButton>
                    {/* <Button variant="outline" className="w-full">
                        Sign up with GitHub
                    </Button> */}
                </form>
            </Form>
        </>

    )
}

