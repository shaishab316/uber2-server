/* eslint-disable no-console */
import nodemailer from 'nodemailer';
import config from '../config';
import chalk from 'chalk';
import type { TSendMail } from '../types/utils.types';
import ora from 'ora';

const { host, port, user, pass, from } = config.email;
const { mock_mail } = config.server;

/**
 * Nodemailer transporter
 *
 * used to send emails
 */
let transporter = nodemailer.createTransport({
  host,
  port,
  secure: false, //! true for 465, false for other ports
  auth: {
    user,
    pass,
  },
});

/**
 * If mock mail is enabled, use a mock transporter
 *
 * used for testing
 */
if (mock_mail) {
  console.info(chalk.yellow('Mock mail enabled'));
  transporter = {
    sendMail: ({ to = 'mock_mail' }) => {
      console.info(chalk.green('Mock mail sent'));
      return {
        accepted: [to],
      };
    },
    verify: () => true,
  } as any;
}

/**
 * Send email using nodemailer
 *
 * @param {TSendMail} { to, subject, html }
 *
 * @deprecated use emailQueue
 */
export const sendEmail = async ({
  to,
  subject,
  html,
}: TSendMail): Promise<void> => {
  if (mock_mail) {
    console.log(chalk.blue('sent mail'), {
      to,
      subject,
    });
  }

  const spinner = ora({
    color: 'yellow',
    text: `📧 Sending email to ${chalk.cyan(to)}...`,
  }).start();

  try {
    //? Send email
    const { accepted } = await transporter.sendMail({
      from,
      to,
      subject,
      html,
    });

    if (!accepted.length) {
      spinner.fail(chalk.red(`Email not accepted by server.`));
    } else {
      spinner.succeed(chalk.green(`Email sent successfully to ${accepted[0]}`));
    }
  } catch (error) {
    if (error instanceof Error) {
      spinner.fail(chalk.red(`Failed to send email to ${to}`));
    }
  }
};
