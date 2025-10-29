import React from 'react'
import BaseAppBar from '../../../package/mock-components/BaseAppBar'
import Logo from '@components/ui/Logo'
import AppBarNavigation from '@components/AppBarNavigation'

const AppBar = () => {
    return (
        <BaseAppBar
            renderApp={<Logo />}
            renderNavigation={<AppBarNavigation />}
        />
    )
}
export default AppBar
