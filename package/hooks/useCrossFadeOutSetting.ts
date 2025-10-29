import React from 'react'
import type { WritableAtom } from 'nanostores'

/**
 * クロスフェードしてホーム画面に戻る際、フェードアウトする要素 ref が fixed 配置になるとき
 * スクロール位置が初期化されガタついて見えるので、これを自然な見え方にするための汎用hook
 * 閉じる前のスクロール位置 scrollingPosition を取得しておいて、fixed 配置になった後に改めてスクロール位置を設定する。
 * @param ref
 * @param homePositionShift
 */
export function useCrossFadeOutSetting<T extends HTMLElement | null>(
    ref: React.RefObject<T>,
    homePositionShift: WritableAtom<number>
) {
    const scrollingPosition = window.scrollY
    requestAnimationFrame(() => {
        ref.current?.scrollTo(0, scrollingPosition)
    })
    homePositionShift.set(0)
}
