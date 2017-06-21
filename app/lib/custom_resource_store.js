class CustomResourceStore {
  constructor(event, logStreamName) {
    this.logStreamName = logStreamName
    this.event         = event
  }

  sendResponse(Status, Data) {
    return new Promise( (resolve, reject) => {
      let responseBody = JSON.stringify({
        Status, Data,
        Reason: `See the details in CloudWatch Log Stream:  ${this.logStreamName}`,
        PhysicalResourceId: this.logStreamName,
        StackId: this.event.StackId,
        RequestId: this.event.RequestId,
        LogicalResourceId: this.event.LogicalResourceId,
      })

      console.info("Storing following data:")
      console.info(responseBody)

      let https = require("https")
      let url = require("url")

      let parsedUrl = url.parse(this.event.ResponseURL)
      let options = {
        hostname: parsedUrl.hostname,
        port: 443,
        path: parsedUrl.path,
        method: "PUT",
        headers: {
          "content-type": "",
          "content-length": responseBody.length
        }
      }

      let request = https.request(options, res => resolve(res))
      request.on("error", err => reject(err))
      request.write(responseBody)
      request.end()
    })
  }
}

module.exports = CustomResourceStore
