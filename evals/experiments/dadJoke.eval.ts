import { runEval } from '../evalTools'
import { runLLM } from '../../src/llm'
import { ToolCallMatch } from '../scorers'
import { dadJokeToolDefinition } from '../../src/tools/dadjoke'

const createToolCallMessage = (toolName: string) => ({
    role: 'assistant',
    tool_calls: [
        {
            type: 'function',
            function: { name: toolName },
        },
    ],
})

runEval('dadjoke', {
    task: (input) =>
        runLLM({
            messages: [{ role: 'user', content: input }],
            tools: [dadJokeToolDefinition],
        }),
    data: [
        {
            input: 'tell me a funny dad joke',
            expected: createToolCallMessage(dadJokeToolDefinition.name),
        }
    ],
    scorers: [ToolCallMatch],
})
