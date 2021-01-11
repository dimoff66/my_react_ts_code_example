import Moment, { setMockCurrentTime } from "../Classes/Moment/index"
import { ReservationDataType } from "../Classes/Reservation"
import { SailingDataType } from "../Classes/Sailing"
import { GuestDataType } from "../Classes/Guest"
import { REQUEST_TYPE_ALLERGY, REQUEST_TYPE_WHEELCHAIR } from "../Constants/RequestTypes"

const sailing: SailingDataType = {
  publicId: 'S0001',
  dateStart: '2020-12-02',
  dateEnd: '2020-12-30',
  timezone: 'Europe/Moscow',

  venues: [
    {
      publicId: 'V00002CHR',
      name: 'Chineese restaurant',
      timeslotsStep: 30,
      sittingDurations: [
        { guestsNumber: 2, duration: 40 },
        { guestsNumber: 4, duration: 60 },
        { guestsNumber: 6, duration: 70 },
        { guestsNumber: 8, duration: 90 },
      ],

      sessions: [
        { timeStart: '06:00', timeEnd: '11:00', name: 'Breakfast' },
        { timeStart: '13:00', timeEnd: '17:00', name: 'Lunch' },
        { timeStart: '19:00', timeEnd: '24:00', name: 'Dinner' },
      ],

      layouts: [
        { 
          publicId: 'LCHR00001', 
          name: 'Main',
          tables: [
            { name: '01', maxSize: 2, orientation: 'H', publicId: 'T00000010', x: 10, y: 10 },
            { name: '02', maxSize: 3, orientation: 'H', publicId: 'T00000011', x: 40, y: 100 },
            { name: '03', maxSize: 4, orientation: 'H', publicId: 'T00000012', x: 10, y: 190 },

            { name: '04', maxSize: 6, orientation: 'V', publicId: 'T00000013', x: 200, y: 10 },
            { name: '05', maxSize: 8, orientation: 'V', publicId: 'T00000014', x: 300, y: 130, multiparty: true },
            { name: '06', maxSize: 8, orientation: 'V', publicId: 'T00000015', x: 320, y: 360 },
          ] 
        },
      ],

      
    }

    ,

    {
      publicId: 'V00001IR',
      name: 'Italian restaurant',
      timeslotsStep: 40,

      sittingDurations: [
        { guestsNumber: 2, duration: 30 },
        { guestsNumber: 4, duration: 40 },
        { guestsNumber: 6, duration: 60 },
        { guestsNumber: 8, duration: 80 },
      ],

      sessions: [
        { timeStart: '07:00', timeEnd: '02:00' }
      ],

      layouts: [
        { 
          publicId: 'LIR00001', 
          name: 'First floor',
          tables:  [
            { name: '01', maxSize: 2, orientation: 'V', publicId: 'T00000001', x: 20, y: 20 },
            { name: '02', maxSize: 4, orientation: 'V', publicId: 'T00000002', x: 150, y: 20 },
            { name: '03', maxSize: 4, orientation: 'H', publicId: 'T00000003', x: 320, y: 10 },
            { name: '04', maxSize: 6, orientation: 'H', publicId: 'T00000004', x: 10, y: 100 },
            { name: '05', maxSize: 8, orientation: 'H', publicId: 'T00000005', multyparty: true, x: 80, y: 200 }
          ]
        },
        { 
          publicId: 'LIR00002', 
          name: 'Second floor',
          tables: [
            { name: '06', maxSize: 4, orientation: 'V', publicId: 'T00000006', x: 20, y: 20 },
            { name: '07', maxSize: 4, orientation: 'V', publicId: 'T00000007', x: 170, y: 20 },
            { name: '08', maxSize: 4, orientation: 'H', publicId: 'T00000008', x: 350, y: 20 },
            { name: '09', maxSize: 6, orientation: 'H', publicId: 'T00000009', x: 20, y: 220 }
          ]
        },
      ],

      defaultLayout: 'LIR00002',
    },
  ]
}

export const sailings = [sailing]

export const guests: GuestDataType[] = [
  { firstName: 'Alex', secondName: 'Bolduin', cabinNumber: 23810, publicId: '12146', requests: [[REQUEST_TYPE_ALLERGY.id, 'no apples']], party: ['12147', '12148'] },
  { firstName: 'Lara', secondName: 'Bolduin', cabinNumber: 23810, publicId: '12147', requests: [] },
  { firstName: 'Mary', secondName: 'Bolduin', cabinNumber: 23810, publicId: '12148', requests: [[REQUEST_TYPE_WHEELCHAIR.id]] },
  { firstName: 'Miroslav', secondName: 'Vrozhek', cabinNumber: 21946, publicId: '12149', requests: [[REQUEST_TYPE_ALLERGY.id, 'no apples']], party: ['12150'] },
  { firstName: 'Olga', secondName: 'Lanska', cabinNumber: 18679, publicId: '12150', isVIP: true, requests: [] },
  { firstName: 'Joe', secondName: 'Rotshild', cabinNumber: 18695, publicId: '12151', requests: [] },
  { firstName: 'Melissa', secondName: 'Dempkins', cabinNumber: 18697, publicId: '12152', requests: [] },
]

const mockDateString = '2020-12-10'
setMockCurrentTime(mockDateString + ' 14:55:00')
const ts = (t: string) => Moment(`${mockDateString} ${t}:00`, { timezone: sailing.timezone }).timestamp

export const createNewId = (prefix: string, length: number, idNumber: number) => {
  return prefix + '000000000000000000'.substring(0, length).substring(idNumber.toString().length) + idNumber
}

export const extractIdNumber = (id: string) => {
  return Number(id.substring(1))
}

export const reservations: ReservationDataType[] = [
  { timestamp: ts('13:30'), mainGuestId: '12151', tableId: 'T00000012', anonimousGuests: 1  },
  { timestamp: ts('14:30'), mainGuestId: '12149', tableId: 'T00000013', anonimousGuests: 2  },
  { timestamp: ts('15:00'), mainGuestId: '12150', tableId: 'T00000014', anonimousGuests: 2  },
  { timestamp: ts('16:00'), mainGuestId: '12152', tableId: 'T00000015', anonimousGuests: 1  },
].map((v, ind) => 
  ({
    ...v, 
    publicId: createNewId('R', 10, ind + 1),
    sailingId: sailing.publicId, 
    venueId: sailing.venues[0].publicId 
}))

