import nodemailer from 'nodemailer';
import fs from 'fs';

export const sendMail = async (req, res) => {
  try {
    const { 
      email, 
      appPassword, 
      subject, 
      html, 
      to, 
      description,
      attachment 
    } = req.body;

    // Validate required fields
    if (!email || !appPassword || !to || !subject) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: email, appPassword, to, and subject are required'
      });
    }

    // Determine SMTP host from email domain
    const getSMTPConfig = (emailAddress) => {
      const domain = emailAddress.split('@')[1]?.toLowerCase();
      
      const smtpConfigs = {
        'gmail.com': { host: 'smtp.gmail.com', port: 587, secure: false },
        'outlook.com': { host: 'smtp-mail.outlook.com', port: 587, secure: false },
        'hotmail.com': { host: 'smtp-mail.outlook.com', port: 587, secure: false },
        'yahoo.com': { host: 'smtp.mail.yahoo.com', port: 587, secure: false },
        'yahoo.co.uk': { host: 'smtp.mail.yahoo.co.uk', port: 587, secure: false },
      };

      return smtpConfigs[domain] || { 
        host: process.env.SMTP_HOST || 'smtp.gmail.com', 
        port: parseInt(process.env.SMTP_PORT) || 587, 
        secure: false 
      };
    };

    const smtpConfig = getSMTPConfig(email);

    // Create transporter with dynamic credentials
    const transporter = nodemailer.createTransport({
      host: smtpConfig.host,
      port: smtpConfig.port,
      secure: smtpConfig.secure,
      auth: {
        user: email,
        pass: appPassword,
      },
    });

    // Prepare attachments
    const attachments = [];
    
    // Handle file uploads from multer
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        attachments.push({
          filename: file.originalname,
          path: file.path,
        });
      });
    }
    
    // Handle base64 attachment from request body
    if (attachment) {
      try {
        const attachmentData = typeof attachment === 'string' ? JSON.parse(attachment) : attachment;
        
        if (Array.isArray(attachmentData)) {
          attachmentData.forEach(att => {
            if (att.content && att.filename) {
              attachments.push({
                filename: att.filename,
                content: att.content,
                encoding: att.encoding || 'base64',
              });
            }
          });
        } else if (attachmentData.content && attachmentData.filename) {
          attachments.push({
            filename: attachmentData.filename,
            content: attachmentData.content,
            encoding: attachmentData.encoding || 'base64',
          });
        }
      } catch (parseError) {
        console.error('Error parsing attachment:', parseError);
      }
    }

    // Email options
    const mailOptions = {
      from: email,
      to: Array.isArray(to) ? to.join(', ') : to,
      subject: subject,
      text: description || html?.replace(/<[^>]*>/g, '') || '', // Strip HTML tags if no description
      html: html || description || '',
      attachments: attachments.length > 0 ? attachments : undefined,
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);

    // Clean up uploaded files after sending
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        if (file.path && fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    }

    res.status(200).json({
      success: true,
      message: 'Email sent successfully',
      messageId: info.messageId,
    });
  } catch (error) {
    // Clean up uploaded files even if email sending fails
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        if (file.path && fs.existsSync(file.path)) {
          try {
            fs.unlinkSync(file.path);
          } catch (unlinkError) {
            console.error('Error deleting file:', unlinkError);
          }
        }
      });
    }
    
    console.error('Error sending email:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send email',
      error: error.message,
    });
  }
};
