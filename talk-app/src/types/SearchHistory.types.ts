import type { BaseEntity } from './main'

export interface SearchHistory extends BaseEntity {
    search_query: string
}
