const AWS             = require('aws-sdk-mock')
const cloudformation  = require('lib/cloudformation')

describe('cloudformation', () => {
  describe('filterOutputs', () => {
    it('should only return outputs present in the mask', () => {
      let mask = [ 'Output1', 'Output2', 'Output3' ]
      let ret = { 'Output1': 'Value1', 'Output3': 'Value3' }
      let listToFilter = [
        { OutputKey: 'Output1', OutputValue: 'Value1' },
        { OutputKey: 'Output4', OutputValue: 'Value4' },
        { OutputKey: 'Output3', OutputValue: 'Value3' }
      ]

      expect(cloudformation.filterOutputs(listToFilter, mask)).toEqual(ret)
    })
  })
})
