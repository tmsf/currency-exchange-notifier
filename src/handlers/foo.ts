import * as AWS from 'aws-sdk'
import { createTransport } from 'nodemailer'

export interface Email {
    from: string
    to: string
    subject: string
    html: string
    cc?: string[]
    bcc?: string[]
    attachments?: []
  }
  
  
  
/**
 * Class to help with sending notifications from your
 * lambda function through various channels.
 *
 * At the moment only Amazon Simple Email Service and
 * Slack Incoming Webhooks are supported.
 *
 * @example
 * ```
 * import Messenger from '@lambda/messenger'
 *
 * const slackMessage = {
 *   text: 'Message',
 *   color: 'success',
 *   fields: [
 *     { name: 'Stage', value: 'Test' },
 *     { name: 'Team', value: 'Deliver' }
 *   ],
 *   webhook: 'https://hooks.slack.com'
 * }
 *
 * Messenger.sendSlack(slackMessage)
 * ```
 */
export class Messenger {
  /**
   * Sends an email using AWS SES and nodemailer.
   */
  static sendEmail (email: Email) {
    const transporter = createTransport({
      SES: new AWS.SES()
    })

    return transporter.sendMail(email)
  }

}
