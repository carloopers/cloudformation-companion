const AWS             = require('aws-sdk-mock')
const cloudformation  = require('lib/cloudformation')

describe('CloudformationPlugin', () => {
  let plugin

  describe('filterOutputs', () => {
    beforeAll( () => plugin = new cloudformation())
    it('should only return outputs present in the mask', () => {
      let mask = [ 'Output1', 'Output2', 'Output3' ]
      let ret = { 'Output1': 'Value1', 'Output3': 'Value3' }
      let listToFilter = [
        { OutputKey: 'Output1', OutputValue: 'Value1' },
        { OutputKey: 'Output4', OutputValue: 'Value4' },
        { OutputKey: 'Output3', OutputValue: 'Value3' }
      ]

      expect(plugin.filterOutputs(listToFilter, mask)).toEqual(ret)
    })
  })

  describe('filterResources', () => {
    it('should only return resources present in the mask', () => {
      let mask = [ 'log1', 'log2', 'log3' ]
      let ret = { 'log1': 'phys1', 'log3': 'phys3' }
      let listToFilter = [
        { LogicalResourceId: 'log1', PhysicalResourceId: 'phys1' },
        { LogicalResourceId: 'log4', PhysicalResourceId: 'phys4' },
        { LogicalResourceId: 'log3', PhysicalResourceId: 'phys3' }
      ]

      expect(plugin.filterResources(listToFilter, mask)).toEqual(ret)
    })
  })

  describe('extractOutputs', () => {
    it('should call filterOutputs with list of outputs and the mask', (done) => {
      let stack = 'test'
      let mask = [ 'key1', 'key2', 'key3' ]

      let paramTest = { Outputs: [ { OutputKey: 'key1', OutputValue: 'val1' } ] }
      let describeStacks = Promise.resolve({
        Stacks: [  paramTest ]
      })

      AWS.mock('CloudFormation', 'describeStacks', describeStacks)
      plugin = new cloudformation()
      plugin.filterOutputs = jest.fn()

      plugin.extractOutputs(stack, mask).then( res => {
        expect(plugin.filterOutputs).toBeCalledWith(paramTest.Outputs, mask)
        plugin.filterOutputs.mockClear()
        done()
      })
    })
  })

  describe('extractResources', () => {
    it('should call filterResources with list of resources and the mask', (done) => {
      let stack = 'test'
      let mask = [ 'key1', 'key2', 'key3' ]
      let paramTest = { StackResources: [ { LogicalResourceId: 'log1', PhysicalResourceId: 'phys1' } ] }
      let describeStackResources = Promise.resolve(paramTest)

      AWS.mock('CloudFormation', 'describeStackResources', describeStackResources)
      plugin = new cloudformation()
      plugin.filterResources = jest.fn()

      plugin.extractResources(stack, mask).then( res => {
        expect(plugin.filterResources).toBeCalledWith(paramTest.StackResources, mask)
        plugin.filterResources.mockClear()
        done()
      })
    })
  })

  describe('extract', () => {
    let stack, attributes, retvalues

    beforeEach(() => {
      stack = 'test'
      plugin = new cloudformation()
      plugin.extractOutputs = jest.fn(() => mockValues.Outputs)
      plugin.extractResources = jest.fn(() => mockValues.Resources)
    })

    afterEach(() => {
      plugin.extractResources.mockClear()
      plugin.extractOutputs.mockClear()
    })

    it('should resolves to extracted values', (done) => {
      expect.assertions(3)
      attributes = {
        Resources: [ 'log1', 'log2', 'log3' ],
        Outputs: [ 'key1', 'key2', 'key3' ]
      }
      mockValues = {
        Outputs: { log1: 'test1' },
        Resources: { key1: 'test2' }
      }

      plugin.extract({ StackName: stack, Outputs: attributes.Outputs, Resources: attributes.Resources}).then( res => {
        expect(plugin.extractResources).toBeCalledWith(stack, attributes.Resources)
        expect(plugin.extractOutputs).toBeCalledWith(stack, attributes.Outputs)
        expect(res).toEqual({
          [ `Cloudformation::${stack}::Outputs::log1` ]: 'test1',
          [ `Cloudformation::${stack}::Resources::key1` ]: 'test2'
        })
        done()
      })
    })

    it('should return only Outputs when no resources specified', (done) => {
      expect.assertions(3)
      attributes = {
        Outputs: [ 'key1', 'key2', 'key3' ]
      }
      mockValues = {
        Outputs: { key1: 'test2' },
        Resources: {}
      }

      plugin.extract({ StackName: stack, Outputs: attributes.Outputs, Resources: attributes.Resources}).then( res => {
        expect(plugin.extractResources).not.toBeCalled()
        expect(plugin.extractOutputs).toBeCalledWith(stack, attributes.Outputs)
        expect(res).toEqual({
          [ `Cloudformation::${stack}::Outputs::key1` ]: 'test2'
        })
        done()
      })
    })

    it('should return only Resources when no outputs specified', (done) => {
      expect.assertions(3)
      attributes = {
        Resources: [ 'log1', 'log2', 'log3' ]
      }
      mockValues = {
        Resources: { log1: 'test'},
        Outputs: {}
      }

      plugin.extract({ StackName: stack, Outputs: attributes.Outputs, Resources: attributes.Resources}).then( res => {
        expect(plugin.extractOutputs).not.toBeCalled()
        expect(plugin.extractResources).toBeCalledWith(stack, attributes.Resources)
        expect(res).toEqual({
          [ `Cloudformation::${stack}::Resources::log1` ]: 'test'
        })
        done()
      })
    })
  })
})
