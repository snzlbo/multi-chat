import React from 'react'
import { useDropzone, type DropzoneOptions } from 'react-dropzone'
import Btn from './Btn'
import { Trans, useTranslation } from 'react-i18next'

interface DropZoneProps {
    files: UploadImageProps[]
    setFiles: (files: UploadImageProps[]) => void
    dropZoneOption: DropzoneOptions
    preview?: boolean
    modifier?: string
    label?: string
}

export interface UploadImageProps extends File {
    path?: string
    preview: string
}

const DropZone = ({
    files,
    setFiles,
    dropZoneOption,
    preview = true,
    modifier = '',
    label,
}: DropZoneProps) => {
    const { t } = useTranslation()
    const { acceptedFiles, getRootProps, getInputProps } = useDropzone({
        ...dropZoneOption,
        onDrop: (acceptedFiles) => {
            setFiles(
                acceptedFiles.map((file) =>
                    Object.assign(file, {
                        preview: URL.createObjectURL(file),
                    })
                )
            )
        },
    })

    return (
        <div className={`DropZone ${modifier}`}>
            {files.length === 0 && (
                <div {...getRootProps({ className: 'dropzone' })}>
                    <input {...getInputProps()} />
                    <p>
                        <Trans
                            i18nKey={label ? t(label) : t('dropZone.label')}
                        />
                    </p>
                </div>
            )}
            {files.length !== 0 && (
                <div className="display">
                    <ul className="grid gap-2">
                        {files.map((file) => (
                            <li key={file.name} className="item">
                                {preview && (
                                    <div>
                                        <img
                                            src={file.preview}
                                            className="thumbnail"
                                            onLoad={() => {
                                                URL.revokeObjectURL(
                                                    file.preview
                                                )
                                            }}
                                        />
                                    </div>
                                )}
                                <div className="filename">{file.name}</div>
                            </li>
                        ))}
                    </ul>
                    <div className="reset">
                        <Btn
                            size="sm"
                            label={t('dropZone.reset')}
                            color="secondly"
                            border="gray"
                            onClick={() => setFiles([])}
                        />
                    </div>
                </div>
            )}
        </div>
    )
}

export default DropZone
