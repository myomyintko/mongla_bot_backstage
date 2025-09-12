import { ContentSection } from '../components/content-section'
import { SecurityForm } from './security-form'

export function SettingsSecurity() {
  return (
    <ContentSection
      title='Security'
      desc='Manage your account security settings and authentication preferences.'
    >
      <SecurityForm />
    </ContentSection>
  )
}
