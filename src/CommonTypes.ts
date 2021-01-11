export type Dict<T> = {[p: string]: T}

export type ValueViewInfo = [
  value: any,
  view: string, 
  options?: {
    disabled?: boolean
  }
]