import React from 'react'
import BaseAppBar from '../../../package/mock-components/BaseAppBar'
import Logo from '@components/ui/Logo'
import AppBarNavigation from '@components/AppBarNavigation'

const AppBar = () => {
    return (
        <BaseAppBar
            renderApp={
                <text
                    x="0"
                    y="45"
                    fill="#000"
                    fontFamily="'Arial Narrow', Arial, sans-serif"
                    fontWeight="normal"
                    fontSize="48"
                    letterSpacing="2"
                >
                    AgroMentor
                </text>
            }
            renderNavigation={<AppBarNavigation />}
        />
    )
}
export default AppBar
