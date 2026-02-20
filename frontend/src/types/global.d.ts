export { };

declare global {
    interface Window {
        AndroidBridge?: {
            logout: () => void;
            exitApp: () => void;
            syncCookies: () => void;
        };
    }
}
