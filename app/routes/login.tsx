import { ClientOnly } from 'remix-utils/client-only';
import { LoginPage } from '~/components/auth/LoginPage';

export default function Login() {
  return <ClientOnly fallback={null}>{() => <LoginPage />}</ClientOnly>;
}
