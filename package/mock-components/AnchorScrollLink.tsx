import React from 'react'
import { useScrollTo } from '../hooks/useScrollTo.ts'
import ArrowShape from './shapes/ArrowShape.tsx'

interface AnchorScrollLink {
    duration?: number
    offset?: number
    ease?: string
    label: string
    target: string | HTMLElement
}
const AnchorScrollLink = ({
    duration,
    offset,
    ease,
    label,
    target,
}: AnchorScrollLink) => {
    const scrollTo = useScrollTo({
        duration: duration,
        offset: offset,
        ease: ease,
    })

    return (
        <button className="AnchorScrollLink" onClick={() => scrollTo(target)}>
            <span className="label">{label}</span>
            <span className="arrow">
                <ArrowShape />
            </span>
        </button>
    )
}

export default AnchorScrollLink
