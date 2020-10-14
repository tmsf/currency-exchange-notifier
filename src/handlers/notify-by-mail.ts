import middy from 'middy'
import { jsonBodyParser, httpEventNormalizer } from 'middy/middlewares'
import { APIGatewayProxyResult } from 'aws-lambda'
import { Messenger } from './foo'
import axios from 'axios'

/**
 * Function that has all the business logic
 *
 * @returns Promise<APIGatewayProxyResult>
 */
async function notifyByMail(): Promise<APIGatewayProxyResult> {

    const apiKey = process.env.fixer_api_key

    const url = `http://data.fixer.io/api/latest?access_key=${apiKey}&symbols=USD,GBP`
    
    const result = await axios.get(url)

    const foo = result.data
    const date = foo.date
    const time = new Date(foo.timestamp * 1000)
    const gbpEur = 1 / foo.rates.GBP * 1000
    const UsdEur = foo.rates.USD * 1000
    
    await Messenger.sendEmail({
        from: 'compras@urze.be',
        to: 'compras@urze.be',
        subject: `Exchange rates - ${date}`,
        html: `<h1>Exchange rates</h1> \
        <h4>${time}</h4>\
        <div>1000 GBP = ${gbpEur.toFixed(2)} EUR </div>\
        <div>1000 EUR = ${UsdEur.toFixed(2)} USD </div>`
    })

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
