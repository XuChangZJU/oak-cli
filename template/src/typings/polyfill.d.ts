
declare global {
    const generateNewId: () => Promise<string>;
    const getRandomValues: (length: number) => Promise<Uint8Array>;
}
export {}