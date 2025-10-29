import { OPENAI_API_KEY } from 'astro:env/client'
import {
    GoogleGenAI,
    PersonGeneration,
    createUserContent,
    createPartFromUri,
} from '@google/genai'
import type { ImageGenerationModelTypes } from '@types/Persona.types'

export async function image2Text(imageSrc: string | Blob, prompt: string) {
    // Initialize the Google Gemini AI client with the provided API key
    const apiKey = ''
    const ai = new GoogleGenAI({ apiKey: apiKey })

    // Upload the provided image to Gemini AI and obtain its URI and MIME type
    const image = await ai.files.upload({
        file: imageSrc,
    })

    // Verify successful image upload
    if (!image || !image.uri || !image.mimeType) {
        throw new Error('Image upload failed')
    }

    // Generate content using the uploaded image and provided prompt
    const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: [
            createUserContent([
                prompt,
                createPartFromUri(image.uri, image.mimeType),
            ]),
        ],
    })

    // Return the generated text content from the AI response
    return response.text
}

export async function generateImage(
    prompt: string,
    model: ImageGenerationModelTypes,
    signal?: AbortSignal
): Promise<Blob> {
    let base64Image: string

    // Select the appropriate image generation function based on the specified model
    if (model === 'imagen-3.0-generate-002') {
        base64Image = await imagen3(prompt, model, signal)
    } else {
        base64Image = await dalle3(prompt, model, signal)
    }

    // Decode the base64-encoded image data into binary format
    const byteChars = atob(base64Image)
    const byteArray = new Uint8Array(byteChars.length)

    for (let i = 0; i < byteChars.length; i++) {
        byteArray[i] = byteChars.charCodeAt(i)
    }

    // Create a Blob object from the binary image data
    const originalBlob = new Blob([byteArray], { type: 'image/png' })

    // Resize the original image Blob to 256x256 pixels
    const resizedBlob = await resizeImage(originalBlob, 256, 256)

    // Return the resized image Blob
    return resizedBlob
}

async function dalle3(
    prompt: string,
    model: 'dall-e-3' | 'gpt-image-1' | string,
    signal?: AbortSignal,
    imageSize: string = '1024x1024'
) {
    // Retrieve the OpenAI API key from configuration
    const apiKey = OPENAI_API_KEY
    const baseResponse = { model: model, prompt: prompt, size: imageSize, n: 1 }
    if (model === 'dall-e-3') {
        Object.assign(baseResponse, {
            response_format: 'b64_json',
        })
    } else {
        Object.assign(baseResponse, {
            quality: 'medium',
        })
    }

    // Send a POST request to OpenAI's image generation endpoint
    const response = await fetch(
        'https://api.openai.com/v1/images/generations',
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify(baseResponse),
            signal,
        }
    )

    // Check if the response is successful; throw an error otherwise
    if (!response.ok) throw new Error(response.statusText)

    // Parse the JSON response and extract the base64-encoded image data
    const result = await response.json()
    return result.data[0].b64_json
}

// async function imagen3(prompt: string, model: 'dall-e-3' | string, signal?: AbortSignal) {
//     const apiKey = GEMINI_API_KEY
//     const ai = new GoogleGenAI({ apiKey: apiKey })

//     const response = await ai.models.generateImages({
//         model: model,
//         prompt: prompt,
//         config: {
//             numberOfImages: 1,
//             personGeneration: PersonGeneration.ALLOW_ALL,
//             aspectRatio: '1:1',
//         },
//     })
//     if (response.generatedImages && response.generatedImages.length > 0) {
//         return response.generatedImages[0]?.image?.imageBytes ?? ''
//     }
//     throw new Error('No image was generated!')
// }

async function imagen3(
    prompt: string,
    model: 'imagen-3.0-generate-002' | string,
    signal?: AbortSignal
) {
    const apiKey = GEMINI_API_KEY
    const ai = new GoogleGenAI({ apiKey })

    const imageGenerationPromise = ai.models.generateImages({
        model,
        prompt,
        config: {
            numberOfImages: 1,
            personGeneration: PersonGeneration.ALLOW_ADULT,
            aspectRatio: '1:1',
        },
    })

    if (signal) {
        if (signal.aborted) {
            throw new DOMException('Request aborted', 'AbortError')
        }

        const abortPromise = new Promise<never>((_, reject) => {
            signal.addEventListener('abort', () => {
                reject(new DOMException('Request aborted', 'AbortError'))
            })
        })

        const response: any = await Promise.race([
            imageGenerationPromise,
            abortPromise,
        ])

        if (response.generatedImages && response.generatedImages.length > 0) {
            return response.generatedImages[0]?.image?.imageBytes ?? ''
        }
        throw new Error('No image was generated!')
    } else {
        const response = await imageGenerationPromise
        if (response.generatedImages && response.generatedImages.length > 0) {
            return response.generatedImages[0]?.image?.imageBytes ?? ''
        }
        throw new Error('No image was generated!')
    }
}

export async function resizeImage(
    blob: Blob,
    width: number,
    height: number
): Promise<Blob> {
    // Create a new Image object to load the Blob data
    const img = new Image()
    // Generate a temporary URL for the Blob to use as the image source
    const url = URL.createObjectURL(blob)
    img.src = url

    // Wait for the image to load successfully or fail
    await new Promise((resolve, reject) => {
        img.onload = resolve
        img.onerror = reject
    })

    // Create a canvas element to draw and resize the image
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height

    // Get the 2D rendering context from the canvas
    const ctx = canvas.getContext('2d')

    // Check if the context was successfully obtained
    if (!ctx) {
        URL.revokeObjectURL(url)
        throw new Error('Could not get canvas context')
    }

    // Draw the loaded image onto the canvas, resizing it to the specified dimensions
    ctx.drawImage(img, 0, 0, width, height)

    // Convert the canvas content back into a Blob object
    const resizedBlob: Blob = await new Promise((resolve, reject) => {
        canvas.toBlob((b) => {
            if (b) resolve(b)
            else reject(new Error('Canvas toBlob failed'))
        }, 'image/png')
    })

    URL.revokeObjectURL(url) // Clean up memory

    // Return the resized image Blob
    return resizedBlob
}

export async function compressImage(blob: Blob, quality = 0.5): Promise<Blob> {
    const img = new Image()
    const url = URL.createObjectURL(blob)
    img.src = url

    await new Promise((resolve, reject) => {
        img.onload = resolve
        img.onerror = reject
    })

    const canvas = document.createElement('canvas')
    canvas.width = img.width
    canvas.height = img.height

    const ctx = canvas.getContext('2d')

    if (!ctx) {
        URL.revokeObjectURL(url)
        throw new Error('Could not get canvas context')
    }

    ctx.drawImage(img, 0, 0)

    const compressedBlob: Blob = await new Promise((resolve, reject) => {
        canvas.toBlob(
            (b) => {
                if (b) resolve(b)
                else reject(new Error('Canvas toBlob failed'))
            },
            'image/jpeg',
            quality
        )
    })

    URL.revokeObjectURL(url)

    return compressedBlob
}
