import { getPersonaById } from '../database/persona.ts'
import {
    createChatLog,
    getChatLogsByConversationId,
} from '../database/chatlog.ts'
import { getExpertMode } from '../database/expert.ts'
import { OPENAI_API_KEY } from 'astro:env/client'

export const answer = async (
    language: 'en' | 'fr',
    conversationId: string,
    question: string,
    personaId: number,
    images: Blob[]
): Promise<AsyncGenerator<string, void, unknown>> => {
    // Retrieve persona details using the provided persona ID
    const persona = await getPersonaById(personaId)
    // Retrieve expert mode configuration data
    const expertData = await getExpertMode()

    // Construct the initial prompt using persona-specific chat prompt and details
    let prompt =
        persona?.chat_prompt +
        `\n\n「指定名前」：\n${persona?.name}\n\n「指定情報」：\n${persona?.other_description}\n\n「与えられた情報」:\n${persona?.profile_description}`

    // If persona-specific chat prompt is unavailable, fallback to expert mode chat prompt
    if (!persona?.chat_prompt) {
        prompt =
            expertData?.chat_prompt +
            `\n\n「指定名前」：\n${persona?.name}\n\n「指定情報」：\n${persona?.other_description}\n\n「与えられた情報」:\n${persona?.profile_description}`
    }

    // Set the system prompt language based on the provided language parameter
    const systemPrompt =
        language === 'en'
            ? 'IMPORTANT: 英語でのみ回答してください。' + prompt
            : 'IMPORTANT: 日本語でのみ回答してください。' + prompt

    // Retrieve previous chat logs for the current conversation
    const chatHistory = await getChatLogsByConversationId(conversationId)

    // Initialize the user message object with the provided question
    let messages = []
    let userChat = { role: 'user', content: question } as {
        role: string
        content: string | {}[]
    }
    // Prepare a log entry for the user's message, including placeholders for images if present
    let userLog = question
    const imageTag = ' [IMAGE]'.repeat(images.length)
    userLog += imageTag

    // Determine the chat model to use, defaulting to 'gpt-4o' if not specified in expert mode
    const chatModel = expertData?.chat_model ?? 'gpt-4.1'

    // If images are provided, convert them to base64 and include them in the user message content
    if (images.length > 0) {
        const user_content = [{ type: 'text', text: question } as {}]
        images.map(async (image) => {
            const base64String = await blobToBase64(image)
            user_content.push({
                type: 'image_url',
                image_url: {
                    url: base64String,
                },
            })
        })
        userChat = {
            role: 'user',
            content: user_content,
        }
    }
    // Construct the complete message array including system prompt, chat history, and current user message
    messages = [
        { role: 'system', content: systemPrompt },
        ...(chatHistory ?? []).map(({ role, content }) => ({ role, content })),
        { ...userChat },
    ]
    // Log the user's message and associated metadata into the chat history
    await createChatLog({
        persona_id: personaId,
        conversation_id: conversationId,
        content: userLog,
        prompt: systemPrompt,
        role: 'user',
        model: chatModel,
    })
    // Retrieve the OpenAI API key from configuration
    const apiKey = OPENAI_API_KEY

    // Send a streaming request to OpenAI's Chat Completion API with the constructed messages
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: chatModel,
            messages: messages,
            stream: true, // Enable streaming
        }),
    })

    // Handle unsuccessful API responses by logging the error details and throwing an exception
    if (!response.ok) {
        const errorText = await response.text()
        console.error('OpenAI API Error Response:', errorText)
        throw new Error(
            `OpenAI API Error: ${response.status} ${response.statusText}`
        )
    }

    const reader = response.body?.getReader()
    const decoder = new TextDecoder('utf-8')

    async function* streamResponse() {
        if (!reader) return

        let buffer = ''

        while (true) {
            const { done, value } = await reader.read()
            if (done) break

            // Decode the chunk and add it to our buffer
            buffer += decoder.decode(value, { stream: true })

            // Process the buffer line by line
            const lines = buffer.split('\n')
            buffer = lines.pop() || '' // Keep the last incomplete line in the buffer

            for (const line of lines) {
                // Skip empty lines or [DONE] messages
                if (!line.trim() || line === 'data: [DONE]') continue

                // Lines starting with "data: " contain the actual content
                if (line.startsWith('data: ')) {
                    try {
                        const jsonData = JSON.parse(line.slice(6)) // Remove "data: " prefix

                        // Extract the content delta from the response
                        const contentDelta =
                            jsonData.choices?.[0]?.delta?.content
                        if (contentDelta) {
                            yield contentDelta
                        }
                    } catch (e) {
                        console.error('Error parsing JSON from stream:', e)
                    }
                }
            }
        }

        // Process any remaining data in the buffer
        if (buffer.trim() && buffer.startsWith('data: ')) {
            try {
                const jsonData = JSON.parse(buffer.slice(6))
                const contentDelta = jsonData.choices?.[0]?.delta?.content
                if (contentDelta) {
                    yield contentDelta
                }
            } catch (e) {
                console.error('Error parsing JSON from stream:', e)
            }
        }
    }

    return streamResponse()
}

export const jsonAnswer = async (prompt: string) => {
    // Retrieve the OpenAI API key from configuration
    const apiKey = OPENAI_API_KEY

    // Construct the message payload with the provided prompt
    const messages = [
        {
            role: 'system',
            content: prompt,
        },
    ]

    // Retrieve expert mode settings, including the preferred chat model
    const expertData = await getExpertMode()

    // Send a POST request to OpenAI's Chat Completion API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: expertData?.chat_model ?? 'gpt-4o', // Use expert mode model or default to 'gpt-4o'
            messages: messages,
        }),
    })

    // Parse the JSON response from the API
    const jsonResponse = (await response.json()) as {
        choices: { message: { content: string } }[]
    }

    // Return the content of the first message from the response
    return jsonResponse.choices[0].message.content
}

function blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onerror = reject // Reject promise if an error occurs during reading
        reader.onloadend = () => {
            resolve(reader.result as string) // Resolve promise with base64 string upon successful reading
        }
        reader.readAsDataURL(blob) // Initiate reading of the Blob as a base64-encoded data URL
    })
}
