import type { TTemplateData } from './emailTemplate';

export const accountRejectedTemplate = (data: TTemplateData) => /* html */ `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${data.companyName} - Account Review Required</title>
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
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
      padding: 40px 24px;
      text-align: center;
    }
    
    .alert-icon {
      width: 80px;
      height: 80px;
      background-color: rgba(255, 255, 255, 0.2);
      border-radius: 50%;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 16px;
    }
    
    .alert-symbol {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      background-color: #ffffff;
      position: relative;
    }
    
    .alert-symbol:after {
      content: '!';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: #ef4444;
      font-size: 32px;
      font-weight: 700;
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
      color: rgba(255, 255, 255, 0.95);
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
    
    .alert-box {
      background-color: #fef2f2;
      border-left: 4px solid #ef4444;
      padding: 16px 20px;
      margin: 24px 24px 0 24px;
      border-radius: 6px;
    }
    
    .alert-text {
      color: #991b1b;
      font-size: 14px;
      line-height: 22px;
      margin: 0;
    }
    
    .info-box {
      background-color: #eff6ff;
      border: 1px solid #bfdbfe;
      padding: 20px;
      margin: 24px 24px 0 24px;
      border-radius: 8px;
    }
    
    .info-title {
      color: #1e40af;
      font-size: 15px;
      font-weight: 600;
      margin: 0 0 12px 0;
      display: flex;
      align-items: center;
    }
    
    .info-icon {
      display: inline-block;
      margin-right: 8px;
      font-size: 18px;
    }
    
    .info-list {
      margin: 0;
      padding-left: 20px;
      color: #1e40af;
      font-size: 14px;
      line-height: 24px;
    }
    
    .info-list li {
      margin-bottom: 8px;
    }
    
    .info-list li:last-child {
      margin-bottom: 0;
    }
    
    .contact-section {
      padding: 24px;
      text-align: center;
    }
    
    .contact-title {
      color: #1f2937;
      font-size: 16px;
      font-weight: 600;
      margin: 0 0 16px 0;
    }
    
    .contact-card {
      background-color: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 20px;
      margin: 0 auto;
      max-width: 400px;
    }
    
    .contact-item {
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 12px;
    }
    
    .contact-item:last-child {
      margin-bottom: 0;
    }
    
    .contact-icon {
      width: 32px;
      height: 32px;
      background-color: #dbeafe;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 12px;
    }
    
    .contact-label {
      color: #6b7280;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin: 0 8px 0 0;
      font-weight: 600;
    }
    
    .contact-value {
      color: #1f2937;
      font-size: 14px;
      font-weight: 600;
      margin: 0;
    }
    
    .contact-link {
      color: #2563eb;
      text-decoration: none;
      font-weight: 600;
    }
    
    .contact-link:hover {
      text-decoration: underline;
    }
    
    .button-section {
      padding: 28px 24px;
      text-align: center;
    }
    
    .button {
      display: inline-block;
      background-color: #2563eb;
      color: #ffffff !important;
      font-size: 15px;
      font-weight: 600;
      border-radius: 8px;
      padding: 14px 32px;
      text-decoration: none;
      margin: 0 8px 8px 0;
    }
    
    .button-secondary {
      background-color: #f3f4f6;
      color: #1f2937 !important;
    }
    
    .divider {
      border: none;
      border-top: 1px solid #e5e7eb;
      margin: 0 24px;
    }
    
    .help-section {
      padding: 24px;
    }
    
    .help-title {
      color: #1f2937;
      font-size: 15px;
      font-weight: 600;
      margin: 0 0 12px 0;
    }
    
    .help-text {
      color: #6b7280;
      font-size: 14px;
      line-height: 22px;
      margin: 0 0 8px 0;
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
      
      .alert-icon {
        width: 64px;
        height: 64px;
      }
      
      .alert-symbol {
        width: 40px;
        height: 40px;
      }
      
      .alert-symbol:after {
        font-size: 24px;
      }
      
      .content, .contact-section, .button-section, .help-section, .footer {
        padding-left: 16px;
        padding-right: 16px;
      }
      
      .alert-box, .info-box {
        margin-left: 16px;
        margin-right: 16px;
      }
      
      .button {
        display: block;
        margin: 0 0 8px 0;
        width: 100%;
      }
      
      .button:last-child {
        margin-bottom: 0;
      }
    }
  </style>
</head>
<body>
  <div class="email-container">
    <!-- Header -->
    <div class="header">
      <div class="alert-icon">
        <div class="alert-symbol"></div>
      </div>
      <h1>Account Review Required</h1>
      <p>Additional verification needed</p>
    </div>
    
    <!-- Greeting -->
    <div class="content">
      <p class="greeting">Hello <strong>${data.userName}</strong>,</p>
      <p class="paragraph">
        Thank you for your interest in joining <strong>${data.companyName}</strong>. After reviewing your account 
        application, we regret to inform you that we were unable to approve your account at this time.
      </p>
    </div>
    
    <!-- Alert Box -->
    <div class="alert-box">
      <p class="alert-text">
        <strong>Action Required:</strong> Please upload proper documentation or contact our admin team for assistance.
      </p>
    </div>
    
    <!-- Info Box -->
    <div class="info-box">
      <p class="info-title">
        <span class="info-icon">ℹ️</span>
        Common Reasons for Review
      </p>
      <ul class="info-list">
        <li>Incomplete or unclear documentation</li>
        <li>Missing required identification documents</li>
        <li>Information mismatch or inconsistency</li>
        <li>Document quality issues (blurry or unreadable)</li>
      </ul>
    </div>
    
    <hr class="divider" style="margin-top: 24px;">
    
    <!-- Contact Section -->
    <div class="contact-section">
      <p class="contact-title">Need Help? Contact Our Admin Team</p>
      <div class="contact-card">
        <div class="contact-item">
          <div class="contact-icon">
            <span style="font-size: 16px;">📧</span>
          </div>
          <div>
            <p class="contact-value">
              <a href="mailto:cooolnice@hotmail.com" class="contact-link">cooolnice@hotmail.com</a>
            </p>
          </div>
        </div>
      </div>
    </div>
    
    <!-- CTA Buttons -->
    <div class="button-section">
      <a href="mailto:cooolnice@hotmail.com" class="button button-secondary">Contact Admin</a>
    </div>
    
    <hr class="divider">
    
    <!-- Help Section -->
    <div class="help-section">
      <p class="help-title">What Should I Do Next?</p>
      <p class="help-text">
        <strong>1. Review your documents:</strong> Ensure all required documents are clear, complete, and up-to-date.
      </p>
      <p class="help-text">
        <strong>2. Upload proper documentation:</strong> Submit valid identification and any other required documents.
      </p>
      <p class="help-text">
        <strong>3. Contact support:</strong> If you have questions or need clarification, reach out to our admin team at 
        <a href="mailto:cooolnice@hotmail.com" class="contact-link">cooolnice@hotmail.com</a>
      </p>
      <p class="help-text" style="margin-top: 16px;">
        We appreciate your patience and look forward to reviewing your updated submission.
      </p>
    </div>
    
    <!-- Footer -->
    <div class="footer">
      <hr class="footer-divider">
      <p class="footer-text">© ${data.currentYear} ${data.companyName}. All rights reserved.</p>
      <p class="footer-links">
        <a href="${data.privacyUrl}" class="footer-link">Privacy Policy</a> · 
        <a href="${data.supportUrl}" class="footer-link">Help Center</a>
      </p>
    </div>
  </div>
</body>
</html>
`;
