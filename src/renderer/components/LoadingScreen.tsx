
export function LoadingScreen() {
    return (
        <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
            <div className="text-center">
                <div className="spinner mx-auto mb-4"></div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Nest Studio
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                    Loading your workspace...
                </p>
            </div>
        </div>
    )
}
