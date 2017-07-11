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

  extractResources(stack, resources) {
    return this.cloudformation.describeStackResources({ StackName: stack }).promise()
      .then( response => this.filterResources(response.StackResources, resources) )
  }

  extractOutputs(stack, outputs) {
    return this.cloudformation.describeStacks({ StackName: stack }).promise()
      .then( response => response.Stacks[0].Outputs ? this.filterOutputs(response.Stacks[0].Outputs, outputs) : {} )
  }

  extract(payload) {
    return new Promise( (resolve, reject ) => {
      try {
        let operations = []
        operations.push(payload.Outputs ? this.extractOutputs(payload.StackName, payload.Outputs) : {})
        operations.push(payload.Resources ? this.extractResources(payload.StackName, payload.Resources) : {})

        let promises = Promise.all(operations)
          .then( values => {
            let outputs = Object.keys(values[0]).map( key => { return { [`Outputs::${key}`]: values[0][key] } } )
            let resources = Object.keys(values[1]).map( key => { return { [`Resources::${key}`]: values[1][key] } } )
            resolve(outputs.concat(resources).reduce( (acc, n) => Object.assign({}, acc, n) ))
          })
          .catch( reason => reject(reason))
      } catch(err) {
        reject(err)
      }
    })
  }
}

module.exports = CloudformationPlugin
