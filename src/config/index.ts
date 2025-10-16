/* eslint-disable no-useless-escape */
import './configure';
import env from '../utils/env/env';
import type ms from 'ms';
import { genSecret } from '../utils/crypto/genSecret';
import path from 'path';
import { enum_decode } from '../utils/transform/enum';
import Stripe from 'stripe';
import { stripePaymentMethods } from '../app/modules/payment/Payment.constant';
import { capitalize } from '../utils/transform/capitalize';

export const ms_regex = '^\\d+(ms|s|m|h|d|w|y)$';

const node_env = enum_decode(process.env.NODE_ENV) ?? 'development';
const isDevelopment = node_env !== 'production';

const server_name =
  process.env.SERVER_NAME ??
  capitalize(path.basename(process.cwd())) ??
  'Server';

const admin_email =
  process.env.ADMIN_EMAIL ?? `admin@${server_name.toLowerCase()}.com`;

const user_email =
  process.env.EMAIL_USER ?? `${server_name.toLowerCase()}@gmail.com`;

const support_email =
  process.env.EMAIL_SUPPORT ?? `support@${server_name.toLowerCase()}.com`;

const db_name = server_name.toLowerCase().replace(' ', '-');

const port = Number(
  process.env.PORT ?? Math.floor(Math.random() * 1000) + 3000,
);

/**
 * Configuration object for the application
 *
 * This object contains various configuration settings for the application,
 * including server details, database connection, allowed origins, and authentication settings.
 */
const config = {
  server: {
    node_env: env<string>('node env', node_env, {
      up: 'Server info - start',
      regex: '^(development|production)$',
    }),
    allowed_origins: env('allowed origins', ['*'], {
      regex: '^\\*$|^$|^(https?:\\/\\/[^,\\s]+)(,https?:\\/\\/[^,\\s]+)*$',
    }),
    port: env('port', port, {
      regex: '^\\d{4,5}$',
    }),
    developer: {
      name: 'Shaishab Chandra Shil',
      github: 'https://github.com/shaishab316',
    },
    name: env('server name', server_name, {
      regex: '^\\w[\\w\\s-]{1,50}$',
    }),
    isDevelopment,
    logo: env('logo', '/images/logo.png', {
      regex: '^\\/.*\\.(png|jpg|jpeg|svg)$',
    }),
    default_avatar: env('default avatar', '/images/placeholder.png', {
      regex: '^\\/.*\\.(png|jpg|jpeg|svg)$',
    }),
    db_name: env('db name', db_name, {
      regex: '^\\w[\\w\\s-]{1,50}$',
    }),
    mock_mail: env('mock mail', true, {
      regex: '^(true|false)$',
      down: 'Server info - end',
    }),
  },

  url: {
    database: env('database url', `mongodb://127.0.0.1:27017/${db_name}`, {
      up: 'Database info - start',
      regex: '^mongodb(\\+srv)?://.*$',
    }),
    ui: env('ui url', `http://localhost:${port}`, {
      regex: '^https?:\\/\\/.*$|^$',
    }),
    href: env('href url', `http://localhost:${port}`, {
      regex: '^https?:\\/\\/.*$|^$',
      down: 'Database info - end',
    }),
  },

  bcrypt_salt_rounds: env('bcrypt salt rounds', 10, {
    up: 'Authentication - start',
    regex: '^\\d+$',
  }),

  otp: {
    length: env('otp length', 6, { regex: '^\\d{1,2}$' }),
    exp: env<ms.StringValue>('otp expire in', '5m', { regex: ms_regex }),
    limit: env('otp limit', 2, { regex: '^\\d+$' }),
    window: env<ms.StringValue>('otp window', '10s', { regex: ms_regex }),
  },

  jwt: {
    access_token: {
      secret: env('jwt access secret', genSecret(), { regex: '^.{10,}$' }),
      expire_in: env<ms.StringValue>('jwt access expire in', '1d', {
        regex: ms_regex,
      }),
    },
    refresh_token: {
      secret: env('jwt refresh secret', genSecret(), { regex: '^.{10,}$' }),
      expire_in: env<ms.StringValue>('jwt refresh expire in', '30d', {
        regex: ms_regex,
      }),
    },
    reset_token: {
      secret: env('jwt reset secret', genSecret(), { regex: '^.{10,}$' }),
      expire_in: env<ms.StringValue>('jwt reset expire in', '10m', {
        regex: ms_regex,
        down: 'Authentication - end',
      }),
    },
  },

  email: {
    user: env('email user', user_email, {
      regex: '^[\\w.-]+@[\\w.-]+\\.\\w+$',
      up: 'Email info - start',
    }),
    from: `${server_name} <${user_email}>`,
    port: env('email port', 587, { regex: '^\\d{2,5}$' }),
    host: env('email host', 'smtp.gmail.com', {
      regex: '^[\\w.-]+\\.[a-z]{2,}$',
    }),
    pass: env('email pass', genSecret(4), { regex: '^.{4,}$' }),
    support: env('support email', support_email, {
      regex: '^[\\w.-]+@[\\w.-]+\\.\\w+$',
      down: 'Email info - end',
    }),
  },

  admin: {
    name: env('admin name', 'Mr. Admin', {
      regex: '^.{2,100}$',
      up: 'Admin info - start',
    }),
    email: env('admin email', admin_email, {
      regex: '^[\\w.-]+@[\\w.-]+\\.\\w+$',
    }),
    password: env('admin password', genSecret(4), {
      regex: '^.{6,32}$',
      down: 'Admin info - end',
    }),
  },

  payment: {
    currency: env('payment currency', 'usd', {
      regex: '^[a-z]{3}$',
      up: 'Payment info - start',
    }),
    stripe: {
      secret_key: env('stripe secret key', `sk_test_${genSecret(24)}`, {
        regex: `^sk_${isDevelopment ? 'test' : 'live'}_[0-9a-zA-Z]{24,}$`,
        up: '\n',
      }),
      web_hook_secret: process.env.STRIPE_WEB_HOOK_SECRET ?? '',
      webhook_endpoint: env(
        'payment webhook endpoint',
        `http://localhost:${port}/api/v1/payments/stripe/webhook`,
        {
          regex: '^https?:\\/\\/.*\\/payments\\/stripe\\/webhook$|^$',
        },
      ),
      methods: Array.from(
        new Set(
          env<Stripe.Checkout.SessionCreateParams.PaymentMethodType[]>(
            'payment methods',
            ['card'],
            {
              regex: `^(${stripePaymentMethods.join('|')})(,(${stripePaymentMethods.join('|')}))*$`,
            },
          ),
        ),
      ),
    },
  },

  google_map_key: env('google map key', genSecret(8), {
    regex: '^.{10,}$',
    up: 'Google map key - start',
    down: 'Google map key - end',
  }),

  uber: {
    max_distance: env('max distance', 1000, {
      regex: '^\\d+$',
      // comment: 'in meters',
      up: 'Uber info - start',
    }),

    fare: {
      adult_fare: env('adult fare', 1, {
        regex: '^\\d+$',
        comment: 'in km',
      }),
      non_adult_fare: env('non adult fare', 0.5, {
        regex: '^\\d*\\.?\\d*$',
        comment: 'in km',
      }),
      time_fare: env('time fare', 1.2, {
        regex: '^\\d*\\.?\\d*$',
        comment: 'in minutes',
      }),
      distance_fare: env('distance fare', 20, {
        regex: '^\\d+$',
        comment: 'in km',
        down: 'Uber info - end',
      }),
    },
  },
};

export default config;
