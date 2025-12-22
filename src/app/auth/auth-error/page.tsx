import Link from 'next/link';

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="bg-danger-50 border border-danger-200 rounded-lg p-6">
          <svg
            className="mx-auto h-12 w-12 text-danger-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <h2 className="mt-4 text-xl font-semibold text-danger-800">
            Authentication Error
          </h2>
          <p className="mt-2 text-danger-700">
            Something went wrong during authentication. This could happen if:
          </p>
          <ul className="mt-4 text-sm text-danger-600 text-left list-disc list-inside space-y-1">
            <li>The link has expired</li>
            <li>The link has already been used</li>
            <li>The link is invalid</li>
          </ul>
        </div>
        <div className="space-y-2">
          <Link
            href="/login"
            className="inline-block text-primary-600 hover:text-primary-500 font-medium"
          >
            Back to login
          </Link>
          <p className="text-sm text-secondary-500">
            Need a new link?{' '}
            <Link href="/reset-password" className="text-primary-600 hover:text-primary-500">
              Reset password
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
