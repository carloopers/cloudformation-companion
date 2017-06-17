const AWS = require('aws-sdk')
let cloudformation

class CloudformationPlugin {
  constructor() {
    this.cloudformation = new AWS.CloudFormation()
  }

  filterOutputs(list, mask) {
    return list.map( o => {
      if (mask.indexOf(o.OutputKey) > -1)
        return { [o.OutputKey]: o.OutputValue }
    }).reduce( (acc, newVal) => Object.assign({}, acc, newVal))
  }

  filterResources(list, mask) {
    return list.map( r => {
      if (mask.indexOf(r.LogicalResourceId) > -1)
        return { [r.LogicalResourceId]: r.PhysicalResourceId }
    }).reduce( (acc, newVal) => Object.assign({}, acc, newVal))
  }
}

module.exports = CloudformationPlugin
