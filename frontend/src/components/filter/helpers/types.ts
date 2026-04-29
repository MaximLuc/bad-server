export interface FieldOption {
    title: string
    value: string | number
}

export type FilterValue = FieldOption | string | number | null | undefined
export type FilterValues = Record<string, FilterValue>
