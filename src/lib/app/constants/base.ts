import type { TableConfiguration } from '../types/table'

export const WELCOME_LIST_RESULTS_NUMBER = 50
export const DEFAULT_TABLE_PAGE_SIZE = 10
export const DEFAULT_SDK_CLIENT_REQUEST_LIMIT = 50

export const DEFAULT_TABLE_CONFIGURATION: TableConfiguration = {
    isPaginated: true,
    siblingsCount: 2,
    pageSize: DEFAULT_TABLE_PAGE_SIZE,
}
