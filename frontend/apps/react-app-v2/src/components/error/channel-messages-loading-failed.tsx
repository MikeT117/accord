export function ChannelMessagesLoadingFailed() {
    return (
        <div className="col-span-2 flex justify-center items-center">
            <div className="px-4 py-2 flex flex-col text-center max-w-96 rounded-lg ring ring-destructive/20 dark:ring-destructive/40 border-destructive dark:bg-destructive/10 bg-destructiv/20">
                <h1 className="font-medium text-xl text-destructive">Error loading messages</h1>
                <p className="text-destructive/75">
                    Unable to load channel messages, please ensure you're onlin and have access to this channel.
                </p>
            </div>
        </div>
    );
}
