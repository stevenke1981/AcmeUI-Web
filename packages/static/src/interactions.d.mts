/** Horizontal link-based Tabs. Keep markup stable until cleanup restores it. */
export function enhanceTabs(root: HTMLElement): () => void;
/** Native dialog owns Tab handling and inert. Returns listener/focus cleanup. */
export function enhanceModal(dialog: HTMLDialogElement, openers?: Iterable<HTMLElement>): () => void;
