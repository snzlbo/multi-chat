import { useCallback } from 'react'
import { gsap } from 'gsap'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'
gsap.registerPlugin(ScrollToPlugin)

/**
 * ウィンドウを目的の位置または要素までスクロールする。
 */
export function useScrollTo(
    options: {
        duration?: number
        offset?: number
        ease?: string
    } = {}
) {
    const { duration = 0.6, offset = 0, ease = 'power2.out' } = options

    return useCallback(
        (target: string | HTMLElement) => {
            let y: number
            if (typeof target === 'string') {
                // 文字列の場合、 セレクターとして扱う
                const el = document.querySelector(target)
                y = el
                    ? el.getBoundingClientRect().top + window.scrollY - offset
                    : offset
            } else {
                // HTMLElementの場合、element.top + オフセットまでスクロール
                y = target.getBoundingClientRect().top + window.scrollY - offset
            }
            gsap.to(window, { duration, scrollTo: y, ease })
        },
        [duration, offset, ease]
    )
}
