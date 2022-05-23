export type Filter = {
    state: boolean  // State is the state of the filter (checked / unchecked)
    value?: string | number // Value is the value to filter by, can be a string or a number depending on the filter
}
