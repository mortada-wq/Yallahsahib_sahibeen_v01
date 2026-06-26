import { SignIn } from '@clerk/remix';

export function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bolt-elements-background-depth-1 px-4">
      <SignIn
        routing="path"
        path="/login"
        signUpUrl="/signup"
        afterSignInUrl="/"
        appearance={{
          elements: {
            rootBox: 'w-full max-w-md',
            card: 'bg-bolt-elements-background-depth-2 border border-bolt-elements-borderColor shadow-lg',
            headerTitle: 'text-bolt-elements-textPrimary',
            headerSubtitle: 'text-bolt-elements-textSecondary',
            formButtonPrimary: 'bg-blue-600 hover:bg-blue-700',
            footerActionLink: 'text-blue-500 hover:text-blue-400',
          },
        }}
      />
    </div>
  );
}
