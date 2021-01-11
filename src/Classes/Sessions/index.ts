import BasicClass, { ExtraField, ClassData, DataSourcesCollection, ExtraDataCommon } from '../Basic'
import { MomentType } from '../Moment'
import Session, { SessionDataType, SessionType } from '../Session'

interface SessionsDataType extends ClassData {
  sessions: SessionDataType[] 
}

interface SessionsExtraData extends ExtraDataCommon {
  sessions?: SessionType[]  
}

export class SessionsType extends BasicClass<SessionsDataType, SessionsExtraData, {}> {
  constructor (data: SessionsDataType, dataSources = {}) {
    super(SessionsFabric, data, dataSources)
    this.addExtraField('sessions', 'sessions', Session)
  }

  get sessions (): SessionType[] { return this.getExtraDataItems('sessions') }
  set sessions (value) { this.setExtraDataValue('sessions', value) }

  get date () { return this.getValue('date') }
  set date (value) { 
    this.setValue('date', value)
    this.sessions = this.sessions.map(v => v.update({ date: value }))
  }

  get id () { return this.sessions.map(v => v.id).join() }

  getClosestSession (dateTime: MomentType | null) {
    const date = dateTime?.morningDate
    const session = this.sessions.find(
      item => 
        !date || 
        item
          .getDateTimeEnd(date)
          .moreThan(dateTime!)
    )
    return session
  }

  useDate (date: MomentType): SessionsType {
    this.date = date.morningDate
    return this.update() as SessionsType
  }
}

export const SessionsFabric = (data: SessionsDataType, dataSources: DataSourcesCollection) => {
  return new SessionsType(data, dataSources)
}
const Sessions = (data: SessionDataType[], dataSources: DataSourcesCollection = {}) => {
  return SessionsFabric({ sessions: data }, dataSources)
}
  
export default Sessions