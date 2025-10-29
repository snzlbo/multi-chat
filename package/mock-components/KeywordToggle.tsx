import { useState } from 'react'

interface KeywordToggleOptionProps {
    label: string
    onSelect: () => void
}

interface KeywordToggleProps {
    value: boolean
    trueOption: KeywordToggleOptionProps
    falseOption: KeywordToggleOptionProps
    modifier?: string
}

const KeywordToggle = ({
    value,
    trueOption,
    falseOption,
    modifier = '',
}: KeywordToggleProps) => {
    const [currentValue, setCurrentValue] = useState(value)

    return (
        <div
            className={`KeywordToggle ${modifier} ${currentValue ? 'KeywordToggle--true' : 'KeywordToggle--false'}`}
        >
            <button
                className="option option--true"
                onClick={() => {
                    trueOption.onSelect()
                    setCurrentValue(true)
                }}
            >
                {trueOption.label}
            </button>
            <button
                className="option option--false"
                onClick={() => {
                    falseOption.onSelect()
                    setCurrentValue(false)
                }}
            >
                {falseOption.label}
            </button>
        </div>
    )
}

export default KeywordToggle
