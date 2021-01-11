import React from 'react'
import Loader from 'react-loader-spinner'
import _ from 'lodash'

export const getLoaderOrErrorElement = values => {
  const [emptyValues, errors] = values.reduce(([emptyValues, errors], value) => {
    if (!value) 
      emptyValues.push(value)
    else if (_.isError(value)) 
      errors.push(value.toString())

    return [emptyValues, errors]
  }, [[], []])

  if (errors.length) {
    return <h4>
      {errors.join('\n')}
    </h4>
  }

  if (emptyValues.length) {
    return <Loader type="Circles" />
  }
} 

