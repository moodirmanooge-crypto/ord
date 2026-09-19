import { Link } from 'react-router-dom'
import { PageBanner, Section, usePageTitle } from '../components/ui'

export default function NotFound() {
  usePageTitle('Page not found')
  return (
    <>
      <PageBanner title="Page not found" intro="The page you are looking for has moved or does not exist." />
      <Section>
        <Link to="/" className="btn btn-blue">
          Back to home
        </Link>
      </Section>
    </>
  )
}
