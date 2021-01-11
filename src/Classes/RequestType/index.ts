export interface RequestTypeData {
  id: string 
  requireText?: boolean 
  view?: string
  showByDefault?: boolean 
}

export class RequestType {
  data: RequestTypeData

  constructor (data: RequestTypeData) {
    this.data = data
  }

  get id () { return this.data.id }
  get view () { return this.data.view || '' }
  get requireText () { return this.data.requireText || false }
  get showByDefault () { return this.data.showByDefault || false }
}

export default RequestType

class Main {
  update () {
    return this
  }
}

class Child extends Main {
  constructor () {
    super()
    const updated = this.update()
  }
}