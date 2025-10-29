interface ToggleProps {
    value: boolean
    /**
     * トグル操作を試みたときに呼び出されるコールバック
     * この関数には、変更要求された新しい状態が渡される（例: !value）
     */
    onRequestToggle: (newValue: boolean) => void
}
const Toggle = ({ value, onRequestToggle }: ToggleProps) => {
    const handleClick = () => {
        // ボタンがクリックされたら、新たに設定しようとしている状態を渡す
        onRequestToggle(!value)
    }

    return (
        <button
            className={`Toggle ${value ? 'Toggle--on' : 'Toggle--off'}`}
            onClick={handleClick}
        >
            <div className="switch"></div>
        </button>
    )
}

export default Toggle
