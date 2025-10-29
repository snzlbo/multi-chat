import React, { useMemo } from 'react'
import DropZone, {
    type UploadImageProps,
} from 'package/mock-components/DropZone'
import Btn from 'package/mock-components/Btn'
import TripleArrowShape from '@components/shapes/TripleArrowShape'
import { Trans, useTranslation } from 'react-i18next'
import { useStore } from '@nanostores/react'
import { exportMode } from '@store/store'

interface PersonaRegisterExtractProps {
    extractionSource: UploadImageProps[]
    setExtractionSource: (extractionSource: UploadImageProps[]) => void
    isPromptExtracting: boolean
    handleExtract: () => void
    setIsExpertSettingModalOpened: (isExpertSettingModalOpened: boolean) => void
}
const PersonaRegisterExtract = ({
    extractionSource,
    setExtractionSource,
    isPromptExtracting,
    handleExtract,
    setIsExpertSettingModalOpened,
}: PersonaRegisterExtractProps) => {
    const { t } = useTranslation()
    const isExpertMode = useStore(exportMode)
    const fileSizeExceeded = useMemo(() => {
        const totalSize = extractionSource.reduce(
            (sum, file) => sum + (file.size || 0),
            0
        )
        return totalSize > 5 * 1024 * 1024
    }, [extractionSource])
    return (
        <div className="extract">
            <div className="grid gap-[6px]">
                <DropZone
                    files={extractionSource}
                    setFiles={setExtractionSource}
                    dropZoneOption={{
                        accept: {
                            'image/jpeg': ['.jpg', '.jpeg'],
                        },
                        maxFiles: 1,
                    }}
                    modifier="DropZone--secondly"
                />
                {!fileSizeExceeded ? (
                    <p className="notes">
                        {t('personaRegister.fileMode.notes')}
                    </p>
                ) : (
                    <p className="notes">
                        {t('imageSetting.fileMode.exceededNotes', {
                            size: '5',
                        })}
                    </p>
                )}
            </div>
            <div className="submit">
                <Btn
                    label={t('personaRegister.fileMode.extract')}
                    onClick={handleExtract}
                    disabled={
                        extractionSource.length === 0 ||
                        isPromptExtracting ||
                        fileSizeExceeded
                    }
                />
                {isExpertMode && (
                    <Btn
                        label={t('personaRegister.fileMode.expertSetting')}
                        color="secondly"
                        border="gray"
                        onClick={() => {
                            setIsExpertSettingModalOpened(true)
                        }}
                    />
                )}
            </div>
            <div className="arrow">
                <TripleArrowShape />
            </div>
        </div>
    )
}

export default PersonaRegisterExtract
