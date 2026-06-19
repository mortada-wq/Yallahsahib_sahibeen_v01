import { ClientOnly } from 'remix-utils/client-only';
import { SignupPage } from '~/components/auth/SignupPage';

export default function Signup() {
  return <ClientOnly fallback={null}>{() => <SignupPage />}</ClientOnly>;
}
