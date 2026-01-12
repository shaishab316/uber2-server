import type { TTemplateData } from './emailTemplate';

export const resetPasswordTemplate = (data: TTemplateData) => /* html */ `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${data.companyName} - Reset Your Password</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    
    body {
      margin: 0;
      padding: 0;
      font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
      background-color: #f5f5f5;
    }
    
    .email-container {
      max-width: 600px;
      margin: 32px auto;
      background-color: #ffffff;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      overflow: hidden;
    }
    
    .header {
      background-color: #1e40af;
      padding: 40px 24px;
      text-align: center;
    }
    
    .header h1 {
      margin: 0;
      color: #ffffff;
      font-size: 28px;
      font-weight: 700;
      line-height: 36px;
    }
    
    .header p {
      margin: 8px 0 0 0;
      color: rgba(255, 255, 255, 0.9);
      font-size: 15px;
      font-weight: 500;
    }
    
    .content {
      padding: 32px 24px 20px 24px;
    }
    
    .greeting {
      font-size: 16px;
      color: #1f2937;
      line-height: 24px;
      margin: 0;
    }
    
    .paragraph {
      color: #4b5563;
      font-size: 15px;
      line-height: 26px;
      margin: 12px 0 0 0;
    }
    
    .otp-section {
      padding: 0 24px 24px 24px;
      text-align: center;
    }
    
    .otp-label {
      color: #6b7280;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 1.2px;
      font-weight: 600;
      margin: 0 0 16px 0;
    }
    
    .otp-code {
      color: #1f2937;
      font-size: 24px;
      font-weight: 700;
      margin: 0;
      letter-spacing: 4px;
    }
    
    .expiry-text {
      color: #6b7280;
      font-size: 13px;
      margin: 14px 0 0 0;
    }
    
    .expiry-highlight {
      color: #dc2626;
      font-weight: 600;
    }
    
    .button-section {
      padding: 0 24px 28px 24px;
      text-align: center;
    }
    
    .button {
      display: inline-block;
      background-color: #2563eb;
      color: #ffffff !important;
      font-size: 15px;
      font-weight: 600;
      border-radius: 8px;
      padding: 14px 28px;
      text-decoration: none;
      width: 100%;
      max-width: 400px;
      box-sizing: border-box;
      decoration: none;
    }
    
    .button-helper {
      color: #9ca3af;
      font-size: 13px;
      margin: 10px 0 0 0;
    }
    
    .divider {
      border: none;
      border-top: 1px solid #e5e7eb;
      margin: 0 24px;
    }
    
    .security-section {
      padding: 24px;
    }
    
    .security-table {
      width: 100%;
    }
    
    .icon-box {
      background-color: #fef2f2;
      border-radius: 8px;
      padding: 10px;
      display: inline-block;
      width: 40px;
      text-align: center;
    }
    
    .security-title {
      margin: 0;
      color: #1f2937;
      font-size: 15px;
      font-weight: 600;
      line-height: 22px;
    }
    
    .security-text {
      margin: 4px 0 0 0;
      color: #6b7280;
      font-size: 14px;
      line-height: 22px;
    }
    
    .help-section {
      padding: 20px 24px;
      background-color: #f8fafc;
      text-align: center;
    }
    
    .help-text {
      color: #4b5563;
      font-size: 14px;
      line-height: 22px;
      margin: 0;
    }
    
    .link {
      color: #2563eb;
      text-decoration: none;
      font-weight: 600;
    }
    
    .footer {
      padding: 24px;
      background-color: #fafafa;
      text-align: center;
    }
    
    .footer-divider {
      border: none;
      border-top: 1px solid #e5e7eb;
      margin: 0 0 20px 0;
    }
    
    .footer-text {
      color: #9ca3af;
      font-size: 13px;
      line-height: 20px;
      margin: 0;
    }
    
    .footer-links {
      color: #9ca3af;
      font-size: 12px;
      line-height: 18px;
      margin: 8px 0 0 0;
    }
    
    .footer-link {
      color: #9ca3af;
      text-decoration: underline;
    }
    
    @media only screen and (max-width: 480px) {
      .header h1 {
        font-size: 24px;
      }
      
      .header p {
        font-size: 13px;
      }
      
      .content, .otp-section, .button-section, .security-section, .help-section, .footer {
        padding-left: 16px;
        padding-right: 16px;
      }
      
      .otp-code {
        font-size: 20px;
      }
      
      .icon-box {
        width: 36px;
        padding: 8px;
      }
    }
  </style>
</head>
<body>
  <div class="email-container">
    <!-- Header -->
    <div class="header">
      <h1>Reset Your Password</h1>
      <p>We received a request to reset your password</p>
    </div>
    
    <!-- Greeting -->
    <div class="content">
      <p class="greeting">Hello <strong>${data.userName}</strong>,</p>
      <p class="paragraph">
        We noticed that you requested to reset your <strong>${data.companyName}</strong> account password. 
        Use the verification code below to proceed with resetting your password.
      </p>
    </div>
    
    <!-- OTP Section -->
    <div class="otp-section">
      <p class="otp-label">Reset Code</p>
      <p class="otp-code">${data.otp}</p>
      <p class="expiry-text">
        This code will expire in <span class="expiry-highlight">${data.expiryTime}</span>
      </p>
    </div>
    
    <!-- CTA Button -->
    <div class="button-section">
      <a href="${data.resetUrl}" class="button">Reset Password</a>
      <p class="button-helper">Or copy and paste the code on the password reset page</p>
    </div>
    
    <hr class="divider">
    
    <!-- Security Notice -->
    <div class="security-section">
      <table class="security-table">
        <tr>
          <td style="width: 48px; vertical-align: top; padding-right: 12px;">
            <div class="icon-box">
              <span style="font-size: 22px;">🔒</span>
            </div>
          </td>
          <td style="vertical-align: top;">
            <p class="security-title">Security Reminder</p>
            <p class="security-text">
              This code is confidential. If you didn't request a password reset, please ignore this email or 
              contact support immediately to keep your account secure.
            </p>
          </td>
        </tr>
      </table>
    </div>
    
    <!-- Help Section -->
    <div class="help-section">
      <p class="help-text">
        Having trouble resetting your password?<br>
        <a href="${data.supportUrl}" class="link">Contact our support team</a> for assistance
      </p>
    </div>
    
    <!-- Footer -->
    <div class="footer">
      <hr class="footer-divider">
      <p class="footer-text">© ${data.currentYear} ${data.companyName}. All rights reserved.</p>
      <p class="footer-links">
        You're receiving this email because you have an account with ${data.companyName}.<br>
        <a href="${data.privacyUrl}" class="footer-link">Privacy Policy</a> · 
        <a href="${data.unsubscribeUrl}" class="footer-link">Unsubscribe</a>
      </p>
    </div>
  </div>
</body>
</html>
`;
