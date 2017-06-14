const filterOutputs = (list, mask) => {
  return list.map( o => {
    if (mask.indexOf(o.OutputKey) > -1)
      return { [o.OutputKey]: o.OutputValue }
  }).reduce( (acc, newVal) => Object.assign({}, acc, newVal))
}

exports.filterOutputs = filterOutputs
