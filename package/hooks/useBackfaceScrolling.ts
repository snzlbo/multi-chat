import {useEffect, useState} from 'react'
import { useStore } from '@nanostores/react'
import type { WritableAtom } from 'nanostores'

export function useBackfaceScrolling(atomStore: WritableAtom<boolean>) {
    const backfaceScrollingState = useStore(atomStore)
    const [scrollbarWidth,setScrollbarWidth] = useState(0)

    useEffect(()=>{
        setScrollbarWidth(window.innerWidth - document.documentElement.clientWidth)
    }, [])

    useEffect(() => {
        if (backfaceScrollingState) {
            document.body.classList.add('scroll-locked')
        } else {
            // backfaceScrollingState が解除されたときに scrollbarWidthを更新
            setScrollbarWidth(window.innerWidth - document.documentElement.clientWidth)
            document.documentElement.style.setProperty(
                '--scrollbar-width',
                `${scrollbarWidth}px`
            )

            document.body.classList.remove('scroll-locked')
        }
    }, [backfaceScrollingState])
}
