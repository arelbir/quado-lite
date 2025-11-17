/**
 * WORKFLOW EMAIL TEMPLATES
 * Beautiful, responsive email templates for workflow events
 */

interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

const baseStyles = `
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
  .container { max-width: 600px; margin: 0 auto; padding: 20px; }
  .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; }
  .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
  .footer { background: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; border-radius: 0 0 8px 8px; }
  .button { display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 6px; margin: 10px 0; }
  .info-box { background: #f0f9ff; border-left: 4px solid #0ea5e9; padding: 15px; margin: 15px 0; border-radius: 4px; }
  h1 { margin: 0; font-size: 24px; }
  h2 { color: #1f2937; font-size: 20px; margin-top: 0; }
`;

/**
 * Task Assigned Email
 */
export function taskAssignedEmail(data: {
  recipientName: string;
  taskName: string;
  workflowName: string;
  deadline?: string;
  assignedBy: string;
  viewUrl: string;
}): EmailTemplate {
  return {
    subject: `New Task Assigned: ${data.taskName}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head><style>${baseStyles}</style></head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📋 New Task Assigned</h1>
          </div>
          <div class="content">
            <h2>Hello ${data.recipientName},</h2>
            <p>You have been assigned a new task in the workflow:</p>
            
            <div class="info-box">
              <strong>Task:</strong> ${data.taskName}<br>
              <strong>Workflow:</strong> ${data.workflowName}<br>
              ${data.deadline ? `<strong>Deadline:</strong> ${data.deadline}<br>` : ''}
              <strong>Assigned by:</strong> ${data.assignedBy}
            </div>
            
            <p>Please review and complete this task at your earliest convenience.</p>
            
            <a href="${data.viewUrl}" class="button">View Task</a>
          </div>
          <div class="footer">
            <p>This is an automated notification from Quado Lite.</p>
            <p>If you have questions, please contact your workflow administrator.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
New Task Assigned

Hello ${data.recipientName},

You have been assigned a new task:
- Task: ${data.taskName}
- Workflow: ${data.workflowName}
${data.deadline ? `- Deadline: ${data.deadline}` : ''}
- Assigned by: ${data.assignedBy}

View task: ${data.viewUrl}
    `,
  };
}

/**
 * Approval Required Email
 */
export function approvalRequiredEmail(data: {
  recipientName: string;
  itemName: string;
  workflowName: string;
  requestedBy: string;
  viewUrl: string;
}): EmailTemplate {
  return {
    subject: `Approval Required: ${data.itemName}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head><style>${baseStyles}</style></head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✋ Approval Required</h1>
          </div>
          <div class="content">
            <h2>Hello ${data.recipientName},</h2>
            <p>Your approval is required for the following item:</p>
            
            <div class="info-box">
              <strong>Item:</strong> ${data.itemName}<br>
              <strong>Workflow:</strong> ${data.workflowName}<br>
              <strong>Requested by:</strong> ${data.requestedBy}
            </div>
            
            <p>Please review and approve or reject this request.</p>
            
            <a href="${data.viewUrl}" class="button">Review & Approve</a>
          </div>
          <div class="footer">
            <p>This is an automated notification from Quado Lite.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Approval Required

Hello ${data.recipientName},

Your approval is required:
- Item: ${data.itemName}
- Workflow: ${data.workflowName}
- Requested by: ${data.requestedBy}

Review: ${data.viewUrl}
    `,
  };
}

/**
 * Task Completed Email
 */
export function taskCompletedEmail(data: {
  recipientName: string;
  taskName: string;
  workflowName: string;
  completedBy: string;
  viewUrl: string;
}): EmailTemplate {
  return {
    subject: `Task Completed: ${data.taskName}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head><style>${baseStyles}</style></head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Task Completed</h1>
          </div>
          <div class="content">
            <h2>Hello ${data.recipientName},</h2>
            <p>A task in your workflow has been completed:</p>
            
            <div class="info-box">
              <strong>Task:</strong> ${data.taskName}<br>
              <strong>Workflow:</strong> ${data.workflowName}<br>
              <strong>Completed by:</strong> ${data.completedBy}
            </div>
            
            <a href="${data.viewUrl}" class="button">View Details</a>
          </div>
          <div class="footer">
            <p>This is an automated notification from Quado Lite.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Task Completed

Hello ${data.recipientName},

Task completed:
- Task: ${data.taskName}
- Workflow: ${data.workflowName}
- Completed by: ${data.completedBy}

View: ${data.viewUrl}
    `,
  };
}

/**
 * Deadline Reminder Email
 */
export function deadlineReminderEmail(data: {
  recipientName: string;
  taskName: string;
  deadline: string;
  hoursRemaining: number;
  viewUrl: string;
}): EmailTemplate {
  return {
    subject: `⏰ Deadline Reminder: ${data.taskName}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head><style>${baseStyles}</style></head>
      <body>
        <div class="container">
          <div class="header" style="background: linear-gradient(135deg, #f59e0b 0%, #dc2626 100%);">
            <h1>⏰ Deadline Reminder</h1>
          </div>
          <div class="content">
            <h2>Hello ${data.recipientName},</h2>
            <p>This is a reminder that your task deadline is approaching:</p>
            
            <div class="info-box" style="border-left-color: #f59e0b; background: #fef3c7;">
              <strong>Task:</strong> ${data.taskName}<br>
              <strong>Deadline:</strong> ${data.deadline}<br>
              <strong>Time Remaining:</strong> ${data.hoursRemaining} hours
            </div>
            
            <p>Please complete this task before the deadline.</p>
            
            <a href="${data.viewUrl}" class="button" style="background: #f59e0b;">Complete Task</a>
          </div>
          <div class="footer">
            <p>This is an automated reminder from Quado Lite.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Deadline Reminder

Hello ${data.recipientName},

Your task deadline is approaching:
- Task: ${data.taskName}
- Deadline: ${data.deadline}
- Time Remaining: ${data.hoursRemaining} hours

Complete task: ${data.viewUrl}
    `,
  };
}

/**
 * Workflow Status Update Email
 */
export function workflowStatusEmail(data: {
  recipientName: string;
  workflowName: string;
  status: string;
  message: string;
  viewUrl: string;
}): EmailTemplate {
  return {
    subject: `Workflow ${data.status}: ${data.workflowName}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head><style>${baseStyles}</style></head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📊 Workflow Update</h1>
          </div>
          <div class="content">
            <h2>Hello ${data.recipientName},</h2>
            <p>A workflow status has been updated:</p>
            
            <div class="info-box">
              <strong>Workflow:</strong> ${data.workflowName}<br>
              <strong>Status:</strong> ${data.status}<br>
              <strong>Message:</strong> ${data.message}
            </div>
            
            <a href="${data.viewUrl}" class="button">View Workflow</a>
          </div>
          <div class="footer">
            <p>This is an automated notification from Quado Lite.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Workflow Update

Hello ${data.recipientName},

Workflow status updated:
- Workflow: ${data.workflowName}
- Status: ${data.status}
- Message: ${data.message}

View: ${data.viewUrl}
    `,
  };
}
