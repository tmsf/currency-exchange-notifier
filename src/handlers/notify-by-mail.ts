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

const notifyByMail = async (): Promise<any> => {
  
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

const sendEmail = (email: Email) => {
  const transporter = createTransport({
    SES: new AWS.SES()
  })

  return transporter.sendMail(email)
}

export {
  notifyByMail as handler
}
