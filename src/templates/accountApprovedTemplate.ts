import type { TTemplateData } from './emailTemplate';

export const accountApprovedTemplate = (data: TTemplateData) => /* html */ `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${data.companyName} - Account Approved</title>
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
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      padding: 40px 24px;
      text-align: center;
    }
    
    .success-icon {
      width: 80px;
      height: 80px;
      background-color: rgba(255, 255, 255, 0.2);
      border-radius: 50%;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 16px;
    }
    
    .checkmark {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      background-color: #ffffff;
      position: relative;
    }
    
    .checkmark:after {
      content: '✓';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: #10b981;
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
    
    .highlight-box {
      background-color: #f0fdf4;
      border-left: 4px solid #10b981;
      padding: 16px 20px;
      margin: 24px 24px 0 24px;
      border-radius: 6px;
    }
    
    .highlight-text {
      color: #065f46;
      font-size: 14px;
      line-height: 22px;
      margin: 0;
    }
    
    .button-section {
      padding: 28px 24px;
      text-align: center;
    }
    
    .button {
      display: inline-block;
      background-color: #10b981;
      color: #ffffff !important;
      font-size: 15px;
      font-weight: 600;
      border-radius: 8px;
      padding: 14px 32px;
      text-decoration: none;
      transition: background-color 0.2s;
    }
    
    .button:hover {
      background-color: #059669;
    }
    
    .divider {
      border: none;
      border-top: 1px solid #e5e7eb;
      margin: 0 24px;
    }
    
    .features-section {
      padding: 24px;
    }
    
    .features-title {
      color: #1f2937;
      font-size: 17px;
      font-weight: 600;
      margin: 0 0 20px 0;
      text-align: center;
    }
    
    .feature-item {
      display: flex;
      align-items: flex-start;
      margin-bottom: 16px;
    }
    
    .feature-icon {
      width: 24px;
      height: 24px;
      background-color: #d1fae5;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 12px;
      flex-shrink: 0;
      margin-top: 2px;
    }
    
    .feature-content {
      flex: 1;
    }
    
    .feature-title {
      color: #1f2937;
      font-size: 14px;
      font-weight: 600;
      margin: 0 0 4px 0;
    }
    
    .feature-text {
      color: #6b7280;
      font-size: 13px;
      line-height: 20px;
      margin: 0;
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
      color: #10b981;
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
      
      .success-icon {
        width: 64px;
        height: 64px;
      }
      
      .checkmark {
        width: 40px;
        height: 40px;
      }
      
      .checkmark:after {
        font-size: 24px;
      }
      
      .content, .button-section, .features-section, .help-section, .footer {
        padding-left: 16px;
        padding-right: 16px;
      }
      
      .highlight-box {
        margin-left: 16px;
        margin-right: 16px;
      }
    }
  </style>
</head>
<body>
  <div class="email-container">
    <!-- Header -->
    <div class="header">
      <div class="success-icon">
        <div class="checkmark"></div>
      </div>
      <h1>Account Approved!</h1>
      <p>Your account has been successfully verified</p>
    </div>
    
    <!-- Greeting -->
    <div class="content">
      <p class="greeting">Hello <strong>${data.userName}</strong>,</p>
      <p class="paragraph">
        Great news! Your account has been approved by our admin team. You now have full access to all 
        <strong>${data.companyName}</strong> features and can start exploring everything we have to offer.
      </p>
    </div>
    
    <!-- Highlight Box -->
    <div class="highlight-box">
      <p class="highlight-text">
        <strong>🎉 You're all set!</strong> Your account is ready to use. Login now to get started with your journey.
      </p>
    </div>
    
    <hr class="divider">
    
    <!-- Help Section -->
    <div class="help-section">
      <p class="help-text">
        Need help getting started?<br>
        <a href="${data.supportUrl}" class="link">Visit our help center</a> or check out our 
      </p>
    </div>
    
    <!-- Footer -->
    <div class="footer">
      <hr class="footer-divider">
      <p class="footer-text">© ${data.currentYear} ${data.companyName}. All rights reserved.</p>
      <p class="footer-links">
        <a href="${data.privacyUrl}" class="footer-link">Privacy Policy</a> · 
        <a href="${data.unsubscribeUrl}" class="footer-link">Unsubscribe</a>
      </p>
    </div>
  </div>
</body>
</html>
`;
