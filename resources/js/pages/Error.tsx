import { Head, Link } from '@inertiajs/react';

export default function ErrorPage({ status }: { status: number }) {
    const title = {
        503: 'Service Unavailable',
        500: 'Server Error',
        404: 'Page Not Found',
        403: 'Forbidden',
    }[status] || 'Error';

    const description = {
        503: 'Sorry, we are doing some maintenance. Please check back soon.',
        500: 'Whoops, something went wrong on our servers.',
        404: 'Sorry, the page you are looking for could not be found.',
        403: 'Sorry, you are forbidden from accessing this page.',
    }[status] || 'An unexpected error occurred.';

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
            <Head title={title} />
            <div className="max-w-md w-full space-y-8 text-center">
                <div>
                    <h1 className="text-9xl font-extrabold text-gray-200 dark:text-gray-800 tracking-widest">{status}</h1>
                    <div className="bg-[#ce1126] px-2 text-sm rounded rotate-12 absolute shadow-lg text-white font-bold inline-block -ml-6 -mt-16">
                        {title}
                    </div>
                </div>

                <div className="mt-8">
                    <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">{description}</p>

                    <Link
                        href="/dashboard"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#ce1126] hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                    >
                        Return to Dashboard
                    </Link>
                </div>
            </div>
        </div>
    );
}
