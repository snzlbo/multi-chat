import { useCallback, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'
gsap.registerPlugin(ScrollToPlugin)

/**
 * 高さをアニメーションするトグル機能。
 */
export function useToggleReveal(
    duration: number = 0.4,
    ease: string = 'power2.out'
) {
    const contentRef = useRef<HTMLDivElement>(null)
    const [isOpen, setIsOpen] = useState(false)

    const toggle = useCallback(() => {
        const el = contentRef.current
        if (!el) {
            setIsOpen((v) => !v)
            return
        }

        const currentHeight = el.getBoundingClientRect().height
        if (!isOpen) {
            setIsOpen(true)
            // autoの高さを測る
            el.style.height = 'auto'
            const targetHeight = el.getBoundingClientRect().height
            el.style.height = `${currentHeight}px`
            el.style.overflow = 'hidden'
            gsap.to(el, {
                height: targetHeight,
                duration,
                ease,
                onComplete: () => {
                    el.style.height = 'auto'
                },
            })
        } else {
            setIsOpen(false)
            gsap.to(el, {
                height: 0,
                duration,
                ease,
                onStart: () => {
                    el.style.overflow = 'hidden'
                },
            })
        }
    }, [duration, ease, isOpen])

    return { contentRef, isOpen, toggle }
}
