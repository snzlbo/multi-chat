import React, { useEffect } from 'react'

/**
 * 「プルダウンメニューが開いている時、メニュー外をクリックすると閉じる」などの挙動を実装する場合の汎用hook
 * active が true のとき、
 * ref外をクリックすると onClickOutside を実行（ここに active を false にする関数などを渡す）
 * @param ref
 * @param active
 * @param onClickOutside
 */
export function useClickOutside<T extends HTMLElement | null>(
    ref: React.RefObject<T>,
    active: boolean,
    onClickOutside: (event?: MouseEvent | null) => void
) {
    useEffect(() => {
        if (!active) return

        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                // composedPath() で伝播経路上に data-ignore-click-outside 属性を持つ要素があれば、処理をスキップする
                const path = event.composedPath ? event.composedPath() : []
                const isIgnored = path.some(
                    (node) =>
                        node instanceof HTMLElement &&
                        node.hasAttribute('data-ignore-click-outside')
                )
                if (isIgnored) return

                onClickOutside(event)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [active, ref, onClickOutside])
}
