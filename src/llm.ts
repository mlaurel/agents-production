import type { AIMessage } from '../types'
import { openai } from './ai'
import { zodFunction, zodResponseFormat } from 'openai/helpers/zod'
import { systemPrompt as defaultSystemPrompt } from './systemPrompt'
import { getSummary } from './memory'
import { z } from 'zod'

export const runLLM = async ({
    messages,
    tools = [],
    temperature = 0.1,
    systemPrompt,
}: {
    messages: AIMessage[]
    tools?: any[]
    temperature?: number
    systemPrompt?: string
}) => {
    const formattedTools = tools.map(zodFunction)
    const summary = await getSummary()
    const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        temperature,
        messages: [
            {
                role: 'system',
                content: `${systemPrompt || defaultSystemPrompt}. Conversation so far: ${summary}`,
            },
            ...messages,
        ],
        ...(formattedTools.length > 0 && {
            tools: formattedTools,
            tool_choice: 'auto',
            parallel_tool_calls: false,
        }),
    })

    return response.choices[0].message
}

export const runApprovalCheck = async (userMessage: string) => {
    const result = await openai.beta.chat.completions.parse({
        model: 'gpt-4o-mini',
        temperature: 0.1,
        response_format: zodResponseFormat(
            z.object({
                approved: z.boolean().describe('did the user approve the action or not')
            }),
            'approval'
        ),
        messages: [
            { role: 'system', content: 'Determine if the user approved the image generation. If you are not sure, then it is not approved.' },
            { role: 'user', content: userMessage }
        ],
    })

    return result.choices[0].message.parsed?.approved
}

export const summarizeMessages = async (messages: AIMessage[]) => {
    const response = await runLLM({
        messages,
        systemPrompt: `Your job is to summarize the given messages to be used in another LLM's system prompt. Summarize it play by play. `,
        temperature: 0.3,
    })
}
