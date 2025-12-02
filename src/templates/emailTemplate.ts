import fs from 'fs';
import path from 'path';
import config from '../config';
import ms from 'ms';
import Handlebars, { TemplateDelegate } from 'handlebars';
import mjml2html from 'mjml';

type TTemplate = {
  userName: string;
  otp: string;
  template: 'reset_password' | 'account_verify';
};

// Cache only compiled Handlebars MJML templates per template name (NOT per otp)
const compiledTemplates = new Map<string, TemplateDelegate>();

async function getCompiledTemplate(name: string) {
  const existing = compiledTemplates.get(name);
  if (existing) return existing;

  const filePath = path.join(
    process.cwd(),
    `public/templates/emails/${name}.mjml`,
  );
  const rawMjml = await fs.promises.readFile(filePath, 'utf-8');
  const compiled = Handlebars.compile(rawMjml);
  compiledTemplates.set(name, compiled);
  return compiled;
}

/**
 * Returns rendered email HTML by compiling MJML and inserting dynamic data.
 * Uses per-template compilation cache to avoid unbounded memory growth from user-specific keys.
 */
export const emailTemplate = async ({ otp, template, userName }: TTemplate) => {
  const compiled = await getCompiledTemplate(template);

  const data = {
    companyName: config.server.name,
    userName,
    otp,
    expiryTime: ms(ms(config.otp.exp), { long: true }),
    verificationUrl: `http://localhost:3000/verify?email`,
    supportUrl: config.email.support,
    privacyUrl: `http://localhost:3000/privacy`,
    unsubscribeUrl: `http://localhost:3000/unsubscribe?email`,
    currentYear: new Date().getFullYear(),
  };

  // Todo: use valid urls in the above links

  const mjmlContent = compiled(data);
  const { html } = mjml2html(mjmlContent);
  return html || 'no content';
};
