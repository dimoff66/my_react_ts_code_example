import { Dict } from "../CommonTypes"
import { joinClassNames } from "../Components/StyledElement"

export const last = <T>(arr: Array<T>) => arr[arr.length - 1]
export const first = <T>(arr: Array<T>) => arr[0]

export const valuesAreEqual = (oldValue: any, newValue: any) => {
  if (Boolean(oldValue) !== Boolean(newValue)) return true 
  if (!oldValue) return false
  if (!oldValue.isModelInstance) return oldValue !== newValue

  return !oldValue.isEqual(newValue)
}

export const mixStyles = (...stylesArr: Dict<string | Dict<any>>[]) => {
  type StyleValue = { className?: string, style?: Dict<any> }
  const styles: Dict<StyleValue> = {}

  for (const style of stylesArr) {
    for (const key in style) {
      const value = style[key]
      if (!value) continue
      if (!(key in styles)) styles[key] = {}

      switch (typeof value) {
        case 'string': 
          styles[key].className = joinClassNames(styles[key].className, value) 
          break 

        case 'object':
          styles[key].style = Object.assign(styles[key].style || {}, value)
          break
      }   
    }
  }
  
  return styles
}
