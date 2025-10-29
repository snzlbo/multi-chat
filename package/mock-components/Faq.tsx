import React from 'react'
import { useToggleReveal } from '../hooks/useToggleReveal.ts'

interface FaqProps {
    question: React.ReactNode
    answer: React.ReactNode
}
const AnchorScrollLink = ({ question, answer }: FaqProps) => {
    const { contentRef, isOpen, toggle } = useToggleReveal()

    return (
        <div className="Faq">
            <button className="question" onClick={toggle}>
                <span className="label">Q</span>
                <span className="text">{question}</span>
                <span
                    className={`marker ${isOpen ? 'marker--open' : ''}`}
                ></span>
            </button>
            <div className="answer" ref={contentRef}>
                {answer}
            </div>
        </div>
    )
}

export default AnchorScrollLink
