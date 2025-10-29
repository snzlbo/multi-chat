import React, { useLayoutEffect, useRef, useState } from 'react'
import {
    BackfaceScrollingDisabled,
    onboardingOpened,
    showOptionalOnboarding,
} from '@store/store.ts'
import OnboardingSlide from '../../../package/mock-components/OnboardingSlide'
import useAnimationClose from '../../../package/hooks/useAnimationClose.ts'
import onboardingLogo from '@assets/images/onboarding/onboarding-logo.webp'
import onboardingSlide1 from '@assets/images/onboarding/onboarding-slide_1.webp'
import onboardingSlide2 from '@assets/images/onboarding/onboarding-slide_2.webp'
import CautionShape from '../../../package/mock-components/shapes/CautionShape'
import CrossShape from '../../../package/mock-components/shapes/CrossShape'
import { Trans, useTranslation } from 'react-i18next'

interface OnboardingProps {}
const Onboarding = ({}: OnboardingProps) => {
    const { t } = useTranslation()
    const slidesRef = useRef<HTMLDivElement>(null)
    const [currentSlideNumber, setCurrentSlideNumber] = useState(0)
    const [totalSlides, setTotalSlides] = useState(-1)
    const [isRequireSlideOpened, setIsRequireSlideOpened] = useState(false)

    useLayoutEffect(() => {
        if (!showOptionalOnboarding.get()) {
            setIsRequireSlideOpened(true)
            return
        }

        if (slidesRef.current) setTotalSlides(slidesRef.current.children.length)
    }, [showOptionalOnboarding.get()])

    const onBeforeClose = () => {
        BackfaceScrollingDisabled.set(false)
    }

    const onClose = () => {
        onboardingOpened.set(false)
    }

    const { isCloseAnimating, handleClose, handleAnimationEnd } =
        useAnimationClose(onBeforeClose, onClose)

    const touchOverlay = () => {
        // 最後のスライドを表示しているときは isRequireSlideOpened を true にする
        if (!isRequireSlideOpened && currentSlideNumber === totalSlides - 1) {
            setIsRequireSlideOpened(true)
            return
        }

        // 必須のスライドを表示しているときはオンボーディングを閉じる。
        if (isRequireSlideOpened) {
            handleClose()
            return
        }

        // それ以外の場合は currentSlideNumber を 1 加算する
        setCurrentSlideNumber((prev) => prev + 1)
    }

    return (
        <div
            className={`Modal Modal--onboarding ${isCloseAnimating ? 'Modal--close' : ''}`}
            onAnimationEnd={handleAnimationEnd}
        >
            <div className="inner">
                <button className="overlay" onClick={touchOverlay}></button>
                <div className="Onboarding">
                    {showOptionalOnboarding.get() && (
                        <div className="optional" ref={slidesRef}>
                            <div className="slide">
                                <OnboardingSlide
                                    isOpen={
                                        !isRequireSlideOpened &&
                                        currentSlideNumber === 0
                                    }
                                    children={
                                        <div className="initial-slide">
                                            <div className="logo">
                                                <img
                                                    src={onboardingLogo.src}
                                                    width={onboardingLogo.width}
                                                    height={
                                                        onboardingLogo.height
                                                    }
                                                    alt=""
                                                />
                                            </div>
                                            <div className="texts">
                                                <div className="heading">
                                                    {t(
                                                        'onboarding.slide0.heading'
                                                    )}
                                                </div>
                                                <p>
                                                    <Trans
                                                        i18nKey={
                                                            'onboarding.slide0.text'
                                                        }
                                                    />
                                                </p>
                                            </div>
                                        </div>
                                    }
                                    goNext={() => setCurrentSlideNumber(1)}
                                    slideNumber={0}
                                    totalSlides={totalSlides}
                                />
                            </div>
                            <div className="slide">
                                <OnboardingSlide
                                    isOpen={
                                        !isRequireSlideOpened &&
                                        currentSlideNumber === 1
                                    }
                                    children={
                                        <div className="image-slide">
                                            <div className="visual">
                                                <img
                                                    src={onboardingSlide1.src}
                                                    width={
                                                        onboardingSlide1.width
                                                    }
                                                    height={
                                                        onboardingSlide1.height
                                                    }
                                                    alt=""
                                                />
                                            </div>
                                            <div className="texts">
                                                <p>
                                                    <Trans
                                                        i18nKey={
                                                            'onboarding.slide1.text'
                                                        }
                                                    />
                                                </p>
                                            </div>
                                        </div>
                                    }
                                    goPrev={() => setCurrentSlideNumber(0)}
                                    goNext={() => setCurrentSlideNumber(2)}
                                    slideNumber={1}
                                    totalSlides={totalSlides}
                                />
                            </div>
                            <div className="slide">
                                <OnboardingSlide
                                    isOpen={
                                        !isRequireSlideOpened &&
                                        currentSlideNumber === 2
                                    }
                                    children={
                                        <div className="image-slide">
                                            <div className="visual">
                                                <img
                                                    src={onboardingSlide2.src}
                                                    width={
                                                        onboardingSlide2.width
                                                    }
                                                    height={
                                                        onboardingSlide2.height
                                                    }
                                                    alt=""
                                                />
                                            </div>
                                            <div className="texts">
                                                <p>
                                                    <Trans
                                                        i18nKey={
                                                            'onboarding.slide2.text'
                                                        }
                                                    />
                                                </p>
                                            </div>
                                        </div>
                                    }
                                    goPrev={() => setCurrentSlideNumber(1)}
                                    goNext={() => setIsRequireSlideOpened(true)}
                                    handleHiddenNextTime={true}
                                    slideNumber={2}
                                    totalSlides={totalSlides}
                                />
                            </div>
                        </div>
                    )}

                    <div className="require">
                        <div className="slide">
                            <OnboardingSlide
                                isOpen={isRequireSlideOpened}
                                children={
                                    <div className="require-slide">
                                        <div>
                                            <div className="head">
                                                <div className="shape">
                                                    <CautionShape />
                                                </div>
                                                <div className="text-sm">
                                                    {t(
                                                        'onboarding.requireSlide.heading'
                                                    )}
                                                </div>
                                            </div>
                                            <div className="texts">
                                                <div className="attention">
                                                    <div className="unit">
                                                        <div className="heading--sm">
                                                            <Trans
                                                                i18nKey={
                                                                    'onboarding.requireSlide.texts.heading1'
                                                                }
                                                            />
                                                        </div>
                                                        <p className="notes">
                                                            <Trans
                                                                i18nKey={
                                                                    'onboarding.requireSlide.texts.text1'
                                                                }
                                                            />
                                                        </p>
                                                    </div>
                                                    <div className="unit">
                                                        <div className="heading--sm">
                                                            <Trans
                                                                i18nKey={
                                                                    'onboarding.requireSlide.texts.heading2'
                                                                }
                                                            />
                                                        </div>
                                                        <p className="notes">
                                                            <Trans
                                                                i18nKey={
                                                                    'onboarding.requireSlide.texts.text2'
                                                                }
                                                            />
                                                        </p>
                                                    </div>
                                                    <div className="unit">
                                                        <div className="heading--sm">
                                                            <Trans
                                                                i18nKey={
                                                                    'onboarding.requireSlide.texts.heading3'
                                                                }
                                                            />
                                                        </div>
                                                        <p className="notes">
                                                            <Trans
                                                                i18nKey={
                                                                    'onboarding.requireSlide.texts.text3'
                                                                }
                                                            />
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                }
                                goNext={handleClose}
                                handleHiddenNextTime={false}
                                slideNumber={3}
                                totalSlides={totalSlides}
                                requireSlide={true}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Onboarding
