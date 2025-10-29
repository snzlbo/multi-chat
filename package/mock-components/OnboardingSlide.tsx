import React, { useEffect, useState } from 'react'
import ArrowShape from './shapes/ArrowShape.tsx'
import Btn from './Btn.tsx'
import SmallCheckShape from './shapes/SmallCheckShape'
import { useTranslation } from 'react-i18next'

interface OnboardingSlideProps {
    isOpen: boolean
    children: React.ReactNode
    goNext: () => void
    goPrev?: () => void
    handleHiddenNextTime?: boolean
    slideNumber: number
    totalSlides?: number
    requireSlide?: boolean
}
const OnboardingSlide = ({
    isOpen = false,
    children,
    goNext,
    goPrev,
    handleHiddenNextTime = false,
    slideNumber,
    totalSlides = 0,
    requireSlide = false,
}: OnboardingSlideProps) => {
    const { t } = useTranslation()
    const [hiddenNextTime, setHiddenNextTime] = useState(false)
    const [slides, setSlides] = useState<number[]>([])

    useEffect(() => {
        const array: number[] = []
        if (totalSlides) {
            // スライド枚数分ループさせるための配列を作成
            for (let i = 0; i < totalSlides; i++) {
                array.push(i)
            }
        }
        setSlides(array)
    }, [totalSlides])

    return (
        <div
            className={`OnboardingSlide ${requireSlide ? 'OnboardingSlide--require' : ''} ${isOpen ? 'OnboardingSlide--open' : 'OnboardingSlide--close'}`}
        >
            <div className="message">{children}</div>

            <div className="control">
                <div className="grid gap-[14px]">
                    {handleHiddenNextTime && (
                        <div className="check">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={hiddenNextTime}
                                    onChange={(e) => {
                                        localStorage.setItem('onboardingHiddenNextTime', '1');
                                        setHiddenNextTime(e.target.checked)
                                    }}
                                />
                                <div className="marker">
                                    <SmallCheckShape />
                                </div>
                                <span className="text-xs">
                                    {t('onboardingSlide.dontShowAgain')}
                                </span>
                            </label>
                        </div>
                    )}
                    {!requireSlide && (
                        <ul className="dots">
                            {slides.map((slide) => (
                                <li
                                    key={slide}
                                    className={`dot ${slide === slideNumber ? 'current' : ''}`}
                                ></li>
                            ))}
                        </ul>
                    )}
                </div>
                <div className="navigation">
                    {goPrev && (
                        <button className="prev" onClick={goPrev}>
                            <ArrowShape />
                        </button>
                    )}
                    <Btn
                        label={
                            requireSlide
                                ? t('onboardingSlide.confirmed')
                                : t('onboardingSlide.next')
                        }
                        onClick={goNext}
                    />
                </div>
            </div>
        </div>
    )
}

export default OnboardingSlide