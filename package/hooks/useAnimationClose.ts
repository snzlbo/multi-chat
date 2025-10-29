import { useState } from 'react'

const useAnimationClose = (onBeforeClose: Function, onClose: Function) => {
    const [isCloseAnimating, setIsCloseAnimating] = useState(false)

    const handleClose = () => {
        onBeforeClose() //親コンポーネントの `onBeforeClose` を実行
        setIsCloseAnimating(true)
    }

    const handleAnimationEnd = () => {
        if (isCloseAnimating) {
            onClose() // 親コンポーネントの `onClose` を実行
            setIsCloseAnimating(false)
        }
    }

    return {
        isCloseAnimating,
        handleClose,
        handleAnimationEnd,
    }
}

export default useAnimationClose
