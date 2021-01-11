import { Dict } from '../../CommonTypes'
import { ID_FIELD } from '../../Constants/attributeNames'
import { last } from '../../Utils/index'
import Moment, { MomentType } from '../Moment/index'

type Nullable = undefined | null

interface FabricFunctionExt<DataType, RT> {
  (data: DataType, dataSources: DataSourcesCollection): RT extends (infer T)[] ? T : RT
}

type FabricFunction<DataType> = FabricFunctionExt<DataType, ClassItemTyped<DataType>>

type DataSource = Dict<Object>
export type DataSourcesCollection = Dict<DataSource>
type SourceKey = string | number

export interface ClassData {
  publicId?: string
  [p: string]: any
}

export type TimeTrio = {
  hour: number
  minute: number 
  second: number 
}

type ClassItem          = BasicClass<any, any, any>
type ClassItems         = BasicClass<any, any, any>[]
type ClassItemTyped<T>  = BasicClass<T, any, any>
type ExtraValueType     = ClassItem | ClassItems

const isClassItem = (value: ExtraValueType | Nullable): value is ClassItem => {
  return value && !Array.isArray(value) ? true : false
}

const isClassItems = (value: ExtraValueType | Nullable): value is ClassItems => {
  return Array.isArray(value)
}

type StringKeyOf<T> = keyof T & string 

type ExtraFieldAny = ExtraField<any, any, any, any, any>

export type ExtraDataCommon       = {}
export type MemoizedValuesCommon  = {}

type ExtraData<T>     = {[P in keyof T]?: T[P] & ExtraValueType }
type ExtraDataKey<T>  = StringKeyOf<ExtraData<T>>
type ExtraDataMap<T>  = Partial<Record<keyof T, ExtraFieldAny>>

type MemoizedValues<T> = Partial<T>
type MemoizedValuesKey<T> = StringKeyOf<T>

class BasicClass<
  T1 extends ClassData,
  T2 extends ExtraDataCommon,
  T3 extends MemoizedValuesCommon
  > {
  public isModelInstance = true
  public modified = false 
  public currentlyModified = false

  private dataSources: DataSourcesCollection
  private data: T1
  
  private extraData: ExtraData<T2> = {}
  private memoizedValues: MemoizedValues<T3> = {}

  private creator: FabricFunction<T1>

  private extraFieldsMap: ExtraDataMap<T2> = {}

  constructor (
    creator: FabricFunction<T1>, 
    data: T1, 
    dataSources: DataSourcesCollection = {},  
    initialValues: Dict<any> = {}) 
    {
      this.data = initialValues && !data[ID_FIELD]
        ? {...initialValues, ...data}
        : data

      this.dataSources = dataSources
      this.creator = creator

      return this
  }

  protected addExtraField<FieldType, ExtraKey extends StringKeyOf<T2>> (
    fieldName: StringKeyOf<T1>,
    extraFieldName: ExtraKey,
    creator: FabricFunctionExt<FieldType, T2[ExtraKey]>,
    dataSourceName = '',
    dataIsArray?: boolean,
    parentDataFn: ParentDataCallback = null,  
  ) {

    this.extraFieldsMap[extraFieldName] = 
      new ExtraField<T1, T2, this, FieldType, ExtraKey>(
        this, fieldName, extraFieldName, creator, dataSourceName, parentDataFn, dataIsArray
      )

    return this
  }

  get id () { return this.getValue(ID_FIELD) }
  set id (value) { this.setValue(ID_FIELD, value) }

  public getData () {
    return this.data
  }

  protected getValue <K extends keyof T1>(fieldName: K): T1[K] { 
    return this.data[fieldName]
  }

  protected getDateValue (fieldName: keyof T1, timezone: string = this.getValue('timezone')) { 
    const value: string | number | undefined = this.getValue(fieldName)
    if (value) return Moment(value, { timezone })

    return null
  }

  protected getTimeValue (fieldName: keyof T1): TimeTrio {
    const value: string = this.getValue(fieldName) || ''
    const [hourRaw = 0, minute = 0, second = 0] = 
      value.split(':').map(v => v[0] === '0' ? v[1] : v).map(Number)

    const hour = hourRaw + (hourRaw < 4 ? 24 : 0)

    return { hour, minute, second }
  }

  protected getNumberValue (fieldName: keyof T1): number { 
    return this.data[fieldName] || 0
  }

  protected getStringValue (fieldName: keyof T1): string { 
    return this.data[fieldName] || ''
  }

  protected getItemValue(fieldName: keyof T1, index: number) { 
    return this.data[fieldName][index] 
  }

  protected getLastItemValue(fieldName: keyof T1) { 
    return last(this.data[fieldName] || [])
  }

  protected setValue <K extends StringKeyOf<T1>>(fieldName: K, value: T1[K], removeExtraData = false) { 
    if (removeExtraData) {
      const extraFieldName = this.findExtraField(fieldName)
      if (extraFieldName)
        delete this.extraFieldsMap[extraFieldName]
    }

    type OnChangeHandler = (v: T1[K]) => undefined | false

    const onChangeHandlerName = fieldName + 'OnChange'
    const onChangeHandler = onChangeHandlerName in this
      ? 
        <FK extends keyof this>(handlerName: FK) => 
          (this[handlerName] as this[FK] & OnChangeHandler).bind(this)
      : null
      
          
    const onChangeHandlerCallRes = onChangeHandler && 
      onChangeHandler(onChangeHandlerName as keyof this)(value)

    if (onChangeHandlerCallRes === false) return this

    this.data[fieldName] = value 
    return this.setModified() 
  }

  private findExtraField(fieldName: StringKeyOf<T1>): StringKeyOf<T2> | undefined {
    for (let key in this.extraFieldsMap) {
      const field = this.extraFieldsMap[key]!
      if (field.fieldName === fieldName) {
        const extraFieldName = field.extraFieldName as StringKeyOf<T2>
        return extraFieldName
      } 
    }

    return undefined
  }

  protected setDateValue <K extends keyof T1>(fieldName: K, value: MomentType | null) { 
    this.data[fieldName] = value?.timestamp as T1[K] & (number | undefined)
    return this.setModified() 
  }

  protected setItemValue (fieldName: string, index: number, value: any) { 
    this.data[fieldName][index] = value 
    return this.setModified() 
  }

  protected getExtraDataValue <K extends ExtraDataKey<T2>>(fieldName: K): T2[K] | undefined {
    const { extraData, extraFieldsMap } = this
    if (!extraData[fieldName]) {
      const value = extraFieldsMap[fieldName]?.getValue()
      if (isClassItem(value)) {
        extraData[fieldName] = value as T2[K] & ClassItem
      } else if (isClassItems(value)) {
        extraData[fieldName] = value as T2[K] & ClassItems
      }
    }

    return extraData[fieldName]
  }


  protected getExtraDataItems <K extends StringKeyOf<T2>>(fieldName: K): T2[K] & ClassItems {
    const value = this.getExtraDataValue(fieldName)
    return (value || []) as T2[K] & ClassItems
  }

  protected setExtraDataValue <K extends keyof T2>(fieldName: K, value: ExtraValueType | null) {
    const extraField = this.extraFieldsMap[fieldName]!
    const { dataIsArray } = extraField

    if (isClassItems(value) && !dataIsArray) {
      throw new Error(`for array field ${fieldName} passed value should be array as well`)
    } else if (isClassItem(value) && dataIsArray) {
      throw new Error(`for field ${fieldName} passed value should be single, but array is passed`)
    } else if (isClassItems(value)) {
      this.extraData[fieldName] = value as T2[K] & ClassItems
    } else if (isClassItem(value)) {
      this.extraData[fieldName] = value as T2[K] & ClassItem
    } else {
      delete this.extraData[fieldName]
    }

    const primaryFieldName: StringKeyOf<T1> = extraField.fieldName
    if (primaryFieldName) {
      let primaryValue: any = undefined
      if (value) {
        primaryValue = Array.isArray(value) ? value.map(v => v.id) : value.id
      }
      this.setValue(primaryFieldName, primaryValue)
    }

    return this.setModified() 
  }

  protected getMemoizedValue<K extends MemoizedValuesKey<T3>>(propName: K, callback: () => MemoizedValues<T3>[K]) {
    const { memoizedValues } = this
    if (!(propName in memoizedValues)) {
      memoizedValues[propName] = callback()
    }

    return memoizedValues[propName]!
  }

  protected setMemoizedValues (values: MemoizedValues<T3>) {
    Object.assign(this.memoizedValues, values)
    return this
  }

  protected removeExtraDataItemBy (fieldName: ExtraDataKey<T2>, fn: (p: any) => Boolean, justOne = true): this {
    let list = this.getExtraDataValue(fieldName) as ExtraValueType | undefined
    if (!isClassItems(list)) return this

    if (justOne) {
      const index = list.findIndex(fn)
      if (index >= 0) list.splice(index, 1)
    } else {
      list = list.filter(v => !fn(v))
    }

    return this.setExtraDataValue(fieldName, list)
  }

  protected removeExtraDataItemsBy (fieldName: ExtraDataKey<T2>, fn: (p: any) => Boolean) {
    return this.removeExtraDataItemBy (fieldName, fn, false)
  }

  protected removeExtraDataObjectItem<T> (fieldName: ExtraDataKey<T2>, object: ClassItemTyped<T>): this {
    const fn = (v: ClassItem) => v.isEqual(object)
    return this.removeExtraDataItemBy(fieldName, fn)
  }

  protected replaceExtraDataObjectItem<T> (fieldName: ExtraDataKey<T2>, object: ClassItemTyped<T>, newObject: ClassItemTyped<T>) {
    const fn = (v: ClassItemTyped<T>) => v.isEqual(object)
    const list = this.getExtraDataValue(fieldName) as ExtraValueType | undefined
    if (!isClassItems(list)) return this

    const index = list.findIndex(fn)
    if (index >= 0) 
      list.splice(index, 1, newObject)
    else 
      list.push(newObject)

    return this.setExtraDataValue(fieldName, list)
  }

  public setExtraData (props: ExtraData<T2>) {
    Object.assign(this.extraData, props)
    return this
  }

  public setModified () {
    this.modified = true 
    this.currentlyModified = true
    return this
  }

  public update (props = {}, modified = true): this {
    const data = Object.assign(this.data, props)
    const newInstance = this
      .creator(data, this.dataSources) 
      .setExtraData(this.extraData)
      .setMemoizedValues(this.memoizedValues) as this

    newInstance.modified = modified

    return newInstance
  }

  public isEqual (that: BasicClass<T1, T2, T3> | null | undefined) { return this.id === that?.id }

  public convertToInstance<T, RT> (item: T, creator: FabricFunctionExt<T, RT>, parentProps: Object) {
    return (creator(item, this.dataSources) as ClassItem).setExtraData(parentProps)
  }

  public getDataFromSource<T extends ClassData> (fieldName: keyof T1, sourceName?: string) {
    let value: T
    if (!sourceName) {
      value = this.data[fieldName]
    } else {
      const source = this.dataSources[sourceName]
      const key: SourceKey = this.data[fieldName]
      value = source[key] as T
    }

    return value || null
  }


  public getDataObjectsFromSource <T extends ClassData>(fieldName: keyof T1, sourceName?: string) {
    let value: T[] = []
    
    if (!sourceName) {
      value = this.data[fieldName] as T[]
    } else {
      const source = this.dataSources[sourceName]
      const keys: SourceKey[] | undefined = this.data[fieldName]
      if (keys !== undefined)
        value = keys.map(item => source[item] as T)
    }

    return value
  }

  public getDataSources () {
    return this.dataSources
  }
}

type ParentDataCallback = (<T extends ClassData>(obj?: T) => Object) | null

export class ExtraField<
  DataType extends ClassData,
  ExtraDataType extends ExtraDataCommon,
  OwnerType extends BasicClass<DataType, ExtraDataType, any>,
  FieldType,
  FieldKey extends StringKeyOf<ExtraDataType>
> {
  context: OwnerType
  fieldName: StringKeyOf<DataType>
  extraFieldName: FieldKey
  creator: FabricFunctionExt<FieldType, ExtraDataType[FieldKey]> 
  dataSourceName: string 
  parentDataFn: ParentDataCallback
  
  dataIsArray: boolean

  constructor (
    context: OwnerType, 
    fieldName: StringKeyOf<DataType>,
    extraFieldName: FieldKey, 
    creator: FabricFunctionExt<FieldType, ExtraDataType[FieldKey]>, 
    dataSourceName = '', 
    parentDataFn: ParentDataCallback = null,  
    dataIsArray?: boolean ) {

      this.context = context
      this.fieldName = fieldName
      this.creator = creator
      this.dataSourceName = dataSourceName
      this.parentDataFn = parentDataFn
      this.extraFieldName = extraFieldName
      
      this.dataIsArray = dataIsArray === undefined
        ? fieldName.endsWith('s')
        : dataIsArray

  }

  public getValue () {
    const { context, dataIsArray } = this
    if (dataIsArray) {
      const data: FieldType[] = 
        context.getDataObjectsFromSource<FieldType>(this.fieldName, this.dataSourceName)
      if (data) return this.getInstances(data)
    } else {
      const data: FieldType = context.getDataFromSource<FieldType>(this.fieldName, this.dataSourceName)
      if (data) return this.getInstance(data)
    }

    return undefined
  }

  private getParentData <T extends ClassData>(obj: ClassItemTyped<T>) {
    if (this.parentDataFn) return this.parentDataFn(obj)
    return {}
  }
    
  private getInstances (itemsData: Array<FieldType>) {
    const res = itemsData.map(item => 
      this.context.convertToInstance(item, this.creator, this.getParentData(this.context))
    ) 
    return res
  }
  
  private getInstance ( itemData: FieldType) {
    return this.context.convertToInstance(itemData, this.creator, this.getParentData(this.context)) 
  }

  
}

export default BasicClass


