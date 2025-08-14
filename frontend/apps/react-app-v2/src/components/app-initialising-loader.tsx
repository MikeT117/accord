import { AccordLogo } from "./accord-logo";

export function AppInitialisingLoader() {
    return (
        <div className="h-screen w-screen flex items-center justify-center">
            <AccordLogo className="animate-pulse size-12" />
        </div>
    );
}
