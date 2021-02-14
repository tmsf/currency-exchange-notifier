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

const notifyByMail = async () : Promise<any> => {
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
  const apiKey : string = process.env.fixer_api_key
  const url : string = `http://data.fixer.io/api/latest?access_key=${apiKey}&symbols=USD,GBP`

  const { data } = await axios.get(url)
  return data
}

const createEmail = (exchangeRatesPayload): Email => {
  const { date, timestamp, rates } = exchangeRatesPayload
  const time: Date = new Date(timestamp * 1000)

  // multiple conversions based on broker payload
  const UsdEur: number = rates.USD * 1000
  const eurGbp: number = rates.GBP * 1000
  const gbpEur: number = 1 / rates.GBP * 1000
  const eurUsd: number = 1 / rates.USD * 1000

  const emailAddress: string = process.env.email_address

  const emailPayload: Email = {
    from: emailAddress,
    to: emailAddress,
    subject: `Exchange rates - ${date}`,
    html: `<h1>Exchange rates</h1> \
        <h4>${time}</h4>\
        <h5>USD</h5>\
        <div>1000 USD = ${eurUsd.toFixed(2)} EUR </div>\
        <div>1000 EUR = ${UsdEur.toFixed(2)} USD </div>\
        <hr>
        <h5>GBP</h5>\
        <div>1000 GBP = ${gbpEur.toFixed(2)} EUR </div>\
        <div>1000 EUR = ${eurGbp.toFixed(2)} GBP </div>\
        `
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
