export function ServerNotFound() {
    return (
        <div className="col-span-2 flex justify-center items-center">
            <div className="px-4 py-2 flex flex-col text-center max-w-96 rounded-lg ring ring-destructive/20 dark:ring-destructive/40 border-destructive dark:bg-destructive/10 bg-destructiv/20">
                <h1 className="font-medium text-xl text-destructive">Server Not Found</h1>
                <p className="text-destructive/75">
                    Looks like you've taken a wrong turn, this server doesn't appear to exist.
                </p>
            </div>
        </div>
    );
}
