import middy from 'middy'
import { jsonBodyParser, httpEventNormalizer } from 'middy/middlewares'
import { APIGatewayProxyResult } from 'aws-lambda'
import axios from 'axios'
import * as AWS from 'aws-sdk'
import { createTransport } from 'nodemailer'

interface Email {
  from: string
  to: string
  subject: string
  html: string
  cc?: string[]
  bcc?: string[]
  attachments?: []
}

/**
 * Sends an email using AWS SES and nodemailer.
 */
const sendEmail = (email: Email) => {
  const transporter = createTransport({
    SES: new AWS.SES()
  })

  return transporter.sendMail(email)
}

const fetchExchangeRates = async () => {
  const apiKey = process.env.fixer_api_key
  const url = `http://data.fixer.io/api/latest?access_key=${apiKey}&symbols=USD,GBP`

  const { data } = await axios.get(url)
  return data
}

const createEmail = (exchangeRatesPayload): Email => {
  const { date, timestamp, rates } = exchangeRatesPayload
  const time = new Date(timestamp * 1000)
  const gbpEur = 1 / rates.GBP * 1000
  const UsdEur = rates.USD * 1000
  
  const emailPayload: Email = {
    from: 'compras@urze.be',
    to: 'compras@urze.be',
    subject: `Exchange rates - ${date}`,
    html: `<h1>Exchange rates</h1> \
        <h4>${time}</h4>\
        <div>1000 GBP = ${gbpEur.toFixed(2)} EUR </div>\
        <div>1000 EUR = ${UsdEur.toFixed(2)} USD </div>`
  }

  return emailPayload
}

/**
 * Function that has all the business logic
 *
 * @returns Promise<APIGatewayProxyResult>
 */
async function notifyByMail (): Promise<APIGatewayProxyResult> {
  
  const exchangeRates = await fetchExchangeRates()
  const emailPayload: Email = createEmail(exchangeRates)
  await sendEmail(emailPayload)

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'email sent successfully!'
    })
  }
}

/**
 * Wrapping hello function with middlewares using middy.
 *
 * @see https://github.com/middyjs/middy
 */
const handler = middy(notifyByMail)
  .use(jsonBodyParser())
  .use(httpEventNormalizer())

export {
  handler,
  notifyByMail
}
