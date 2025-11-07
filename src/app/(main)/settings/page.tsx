import { ProfileForm } from "./_components/profile-form"
import { getLatestUser } from "@/lib/auth"
import { SettingsTitle } from "./_components/settings-title"
import { getTranslations } from 'next-intl/server'

const SettingPage = async () => {
  const userinfo = await getLatestUser()
  const t = await getTranslations('settings')

  return (
    <div className='space-y-6'>
      <SettingsTitle title={t('profile.title')} description={t('profile.description')} />
      <ProfileForm initialValues={{
        username: userinfo?.name!,
        image: userinfo?.image || "",
      }} />
    </div>
  )
}

export default SettingPage