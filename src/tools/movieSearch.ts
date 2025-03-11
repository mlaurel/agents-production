import type { ToolFn} from '../../types'
import { z } from 'zod'
import { queryMovies } from '../rag/query'

export const movieSearchToolDefinition = {
    name: 'movie_search',
    parameters: z.object({
        query: z.string().describe('The query used to vector search for movies')
    }),
    description: 'use this tool to find movies or answers questions about movies and their metadata like score, rating, costs, director, actors and more. '
}

type Args = z.infer<typeof movieSearchToolDefinition.parameters>

export const movieSearch: ToolFn<Args> = async ({ userMessage, toolArgs }) => {
    let results
    try {
        results = await queryMovies({ query: toolArgs.query })
    } catch(e) {
        console.error(e)
        return 'Error: could not query the db to get movies'
    }

    const formattedResults = results.map((result) => {
        const { metadata, data }  = result
        return { ...metadata, description: data }
    })

    return JSON.stringify(formattedResults, null, 2)
}
