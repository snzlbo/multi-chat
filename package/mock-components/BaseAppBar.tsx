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
      <div className="app">{props.renderApp}</div>
      <nav className="navigation">{props.renderNavigation}</nav>
    </header>
  )
}

export default BaseAppBar
