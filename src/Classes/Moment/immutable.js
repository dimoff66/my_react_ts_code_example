const mutableMethods = ['startOf', 'endOf', 'add', 'subtract'] 
const immutableMethods = ['clone']
   
const immutableAPI = [
  ...mutableMethods.map(name => 
    [name, function (...args) {
       this[name + '_ORIGINAL_'](...args)
       return this.clone()
    }]
  ),
  
  ...immutableMethods.map(name => 
    [name, function (...args) { 
       return immuteMe(this[name + '_ORIGINAL_'](...args))
    }]
  ),
]

const immuteMe = object => {
   for (const [name, fn] of immutableAPI) {
     object[name + '_ORIGINAL_'] = object[name]
     object[name] = fn.bind(object)   
   }
   return object
}

const immutableMoment = param => immuteMe(moment(param))  
export default immutableMoment