/** Portable export: provide your own notification provider if needed. */
export async function notifyOwner(_input: { title: string; content: string }): Promise<boolean> { return false; }
