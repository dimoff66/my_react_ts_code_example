import { sailings as mockSailings, 
  guests as mockGuests, 
  reservations as mockReservations, 
  extractIdNumber,
  createNewId} from "../Data/data"
import _ from 'lodash'
import { ID_FIELD } from "../Constants/attributeNames"

const mockPromiseDelay = [1, 1]

const mockPromise = value => new Promise((resolve, reject) => {
  const delayMls = _.random(...mockPromiseDelay)
  _.delay(() => resolve(value), delayMls)
})

const fetchSailings = () => mockPromise(mockSailings)
const fetchGuests = () => mockPromise(mockGuests)

const fetchReservations = (timestampFrom, timestampTo, venueId = null) => {
  const reservations = mockReservations
  const items = reservations
    .filter(v => 
      v.timestamp >= timestampFrom && 
      v.timestamp <= timestampTo &&
      (!venueId || v.venueId === venueId)
    )

  return mockPromise(items)
}

const fetchReservation = () => {
  return Promise.resolve(null)
}

const saveReservation = data => {
  let id = data[ID_FIELD]
  if (!id) {
    const idNumber = Math.max(0, ...mockReservations.map(v => v[ID_FIELD].substring(1))) + 1
    data[ID_FIELD] = createNewId('R', 10, idNumber)
    mockReservations.push(data)
  } else {
    const index = mockReservations.findIndex(v => v[ID_FIELD] === id)
    mockReservations[index] = data
  }
  return mockPromise(data[ID_FIELD])
}

const agent = { 
  fetchSailings, 
  fetchGuests, 
  fetchReservation,
  fetchReservations,
  saveReservation 
}

export default agent