import { Index as UpstashIndex } from '@upstash/vector'

// Initialize Upstash Vector client
const index = new UpstashIndex({
    url: process.env.UPSTASH_VECTOR_REST_URL as string,
    token: process.env.UPSTASH_VECTOR_REST_TOKEN as string,
})

type MovieMetadata = {
    title?: string
    year?: number
    genre?: string
    director?: string
    actors?: string
    rating?: number
    votes?: number
    revenue?: number
    metascore?: number
}

export const queryMovies = async ({
    query,
    filters,
    topK = 5
}: {
    query: string,
    filters?: any,
    topK: number
}) => {
    return index.query({
        data: query,
        topK,
        includeMetadata: true,
        includeData: true,
    })
}
