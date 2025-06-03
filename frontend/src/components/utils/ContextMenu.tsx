import { createPortal } from 'react-dom';
import { RefObject } from 'react';
import Tippy from '@tippyjs/react';

export interface ContextMenuEntry {
    label: string;
    onClick: () => void;
    className?: string;
    danger?: boolean;
}

export interface ContextMenuProps {
    isOpen: boolean;
    anchorPosition: { top: number; left: number } | null;
    entries: ContextMenuEntry[];
    onClose: () => void;
    menuRef: RefObject<HTMLDivElement>;
    title?: string;
    toolTip?: string;
    disabled?: boolean;
}

export function ContextMenu({
    isOpen,
    anchorPosition,
    entries,
    onClose,
    menuRef,
    title,
    disabled,
    toolTip,
}: ContextMenuProps) {
    if (!isOpen || !anchorPosition) return null;
    return createPortal(
        <div
            ref={menuRef}
            className="z-50 w-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-lg py-1 fixed"
            style={{
                top: anchorPosition.top,
                left: anchorPosition.left,
                minWidth: '8rem',
            }}
        >
            {title && (
                <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-300 border-b border-gray-100 dark:border-gray-700 uppercase tracking-wider">
                    {title}
                </div>
            )}
            {entries.map((entry, idx) =>
                toolTip ? (
                    <Tippy key={idx} content={toolTip}>
                        <button
                            disabled={disabled}
                            onClick={() => {
                                entry.onClick();
                                onClose();
                            }}
                            className={`w-full text-left px-4 py-2 text-sm ${entry.danger ? 'text-red-600' : 'text-gray-900 dark:text-gray-100'} hover:bg-gray-100 dark:hover:bg-gray-700 ${entry.className || ''}`}
                        >
                            {entry.label}
                        </button>
                    </Tippy>
                ) : (
                    <button
                        key={idx}
                        disabled={disabled}
                        onClick={() => {
                            entry.onClick();
                            onClose();
                        }}
                        className={`w-full text-left px-4 py-2 text-sm ${entry.danger ? 'text-red-600' : 'text-gray-900 dark:text-gray-100'} hover:bg-gray-100 dark:hover:bg-gray-700 ${entry.className || ''}`}
                    >
                        {entry.label}
                    </button>
                )
            )}
        </div>,
        document.body
    );
}
