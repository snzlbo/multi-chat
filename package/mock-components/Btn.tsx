import React from 'react'

type BtnProps = {
    label?: string
    onClick?: () => void
    size?: 'default' | 'full' | 'sm' | 'sm-full' | 'sm-icon'
    color?:
        | 'primary'
        | 'secondly'
        | 'tertiary'
        | 'quaternary'
        | 'gray'
        | 'transparent'
    border?: 'none' | 'gray'
    icon?: React.ReactNode
    disabled?: boolean
}

const Btn = ({
    label = 'Default',
    onClick,
    size = 'default',
    color = 'primary',
    border = 'none',
    icon = null,
    disabled = false,
}: BtnProps) => {
    const classNames =
        `Btn Btn--${size} Btn--${color} Btn--border-${border}` +
        (disabled ? ' Btn--disabled' : '')
    return (
        <button className={classNames} onClick={onClick} disabled={disabled}>
            {icon && <span className="icon">{icon}</span>}
            {label}
        </button>
    )
}

export default Btn
