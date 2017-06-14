const filterOutputs = (list, mask) => {
  return list.map( o => {
    if (mask.indexOf(o.OutputKey) > -1)
      return { [o.OutputKey]: o.OutputValue }
  }).reduce( (acc, newVal) => Object.assign({}, acc, newVal))
}

const filterResources = (list, mask) => {
  return list.map( r => {
    if (mask.indexOf(r.LogicalResourceId) > -1)
      return { [r.LogicalResourceId]: r.PhysicalResourceId }
  }).reduce( (acc, newVal) => Object.assign({}, acc, newVal))
}

exports.filterOutputs = filterOutputs
exports.filterResources = filterResources
