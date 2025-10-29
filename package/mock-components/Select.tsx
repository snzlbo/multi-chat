import React, { useEffect, useRef, useState } from 'react'
import { useClickOutside } from '../hooks/useClickOutside.ts'
import ArrowShape from './shapes/ArrowShape.tsx'

type SelectOptionProps = {
    label: string
    value: string
    onSelect: () => void
}

type SelectProps = {
    options?: SelectOptionProps[]
    defaultValue?: string
    disabled?: boolean
}

const Select = ({ options = [], defaultValue, disabled = false }: SelectProps) => {
    const pulldownRef = useRef<HTMLDivElement>(null)
    const [isFocused, setIsFocused] = useState(false)
    const [label, setLabel] = useState('')

    useClickOutside(pulldownRef, isFocused, () => setIsFocused(false))

    useEffect(() => {
        if (options?.length !== 0) {
            setLabel(options[0].label)
        }

        if (options?.length !== 0 && defaultValue) {
            const selectedOption = options.find((option) => {
                return option.value === defaultValue
            })
            if (selectedOption) {
                optionSelect(selectedOption.label, () => {})
            } else {
                optionSelect(defaultValue, () => {})
            }
        }
    }, [])

    const optionSelect = (optionLabel: string, optionCallback: Function) => {
        setLabel(optionLabel)
        optionCallback()
        setIsFocused(false)
    }

    return (
        <div
            className={`Pulldown ${isFocused && !disabled ? 'Pulldown--active' : ''}`}
            ref={pulldownRef}
        >
            <div
                className={`Select ${isFocused && !disabled ? 'Select--active' : ''} ${disabled ? 'opacity-50' : ''}`}
                onClick={() => {
                    if (!disabled) {
                        setIsFocused(!isFocused)
                    }
                }}
            >
                <div>{label}</div>
                <div className="icon">
                    <ArrowShape />
                </div>
            </div>
            <div className="cover">
                <div className="options">
                    {options?.map((option: SelectOptionProps, index) => {
                        return (
                            <button
                                key={index}
                                value={option.value}
                                className="option"
                                disabled={disabled}
                                onClick={() =>
                                    optionSelect(option.label, option.onSelect)
                                }
                            >
                                {option.label}
                            </button>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}

export default Select