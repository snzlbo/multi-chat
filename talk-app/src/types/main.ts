// Base type
export interface BaseEntity {
    id: number
    created_at: string
    updated_at?: string
}

export interface PaginationParams {
    page?: number
    limit?: number
}

export interface PersonaQueryParams extends PaginationParams {
    id: string
}
