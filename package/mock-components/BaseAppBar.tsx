import React from 'react'
import Brand from './assets/images/brand.webp'

interface BaseAppBarProps {
    modifier?: string
    renderApp: React.ReactNode
    renderNavigation: React.ReactNode
}

const BaseAppBar = (props: BaseAppBarProps) => {
    return (
        <header className={`BaseAppBar ${props.modifier}`}>
            <div className="brand">
                <img
                    src={Brand.src}
                    alt="AIQQQ"
                    width={Brand.width * 0.5}
                    height={Brand.height * 0.5}
                />
            </div>
            <div className="app">{props.renderApp}</div>
            <nav className="navigation">{props.renderNavigation}</nav>
        </header>
    )
}

export default BaseAppBar
