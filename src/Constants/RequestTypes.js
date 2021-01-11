import RequestType from "../Classes/RequestType"

export const REQUEST_TYPE_ALLERGY = new RequestType({ 
  id: 'allergy', 
  requireText: true 
})

export const REQUEST_TYPE_SEAT = new RequestType({ 
  id: 'seating', 
  requireText: true 
})

export const REQUEST_TYPE_GENERAL = new RequestType({ 
  id: 'general', 
  requireText: true 
})

export const REQUEST_TYPE_WHEELCHAIR = new RequestType({ 
  id: 'wheelchair', 
  view: 'wheel chair' 
})

export const REQUEST_TYPE_HIGHCHAIR = new RequestType({ 
  id: 'highchair', 
  view: 'high chair' 
})

export const REQUEST_TYPE_VIP = new RequestType({ 
  id: 'isVIP', 
  view: 'VIP guest',
  showByDefault: false
})