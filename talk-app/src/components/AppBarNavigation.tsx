import {
    homeOpened,
    homeScrollingPosition,
    homePositionShift,
    settingOpened,
} from '@store/store.ts'
import { useStore } from '@nanostores/react'
import SettingShape from 'package/mock-components/shapes/SettingShape'

const AppBarNavigation = () => {
    const isSettingOpened = useStore(settingOpened)

    const settingOpen = () => {
        //設定画面を閉じて一覧画面を戻ってきたときにスクロール位置を調整するために現在のスクロール位置を取得。
        homeScrollingPosition.set(window.scrollY)
        homePositionShift.set(homeScrollingPosition.get())
        settingOpened.set(true)
        homeOpened.set(false)
    }

    return (
        <div className={'flex'}>
            <button
                onClick={settingOpen}
                className={'btn flex-1'}
                disabled={isSettingOpened}
            >
                <SettingShape />
            </button>
        </div>
    )
}

export default AppBarNavigation
