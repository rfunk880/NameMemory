<?php
/**
 * Email Sender Utility
 * Sends emails using PHP mail() or SMTP
 */
class EmailSender {

    /**
     * Send password reset email
     */
    public static function sendPasswordReset($email, $token) {
        $resetLink = APP_URL . '/reset-password?token=' . $token;

        $subject = 'Password Reset - NameMemory';

        $message = "
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .button {
                    display: inline-block;
                    padding: 12px 24px;
                    background-color: #4F46E5;
                    color: #ffffff;
                    text-decoration: none;
                    border-radius: 6px;
                    margin: 20px 0;
                }
                .footer { margin-top: 30px; font-size: 12px; color: #666; }
            </style>
        </head>
        <body>
            <div class='container'>
                <h2>Password Reset Request</h2>
                <p>You requested to reset your password for your NameMemory account.</p>
                <p>Click the button below to reset your password:</p>
                <a href='{$resetLink}' class='button'>Reset Password</a>
                <p>Or copy and paste this link into your browser:</p>
                <p>{$resetLink}</p>
                <p>This link will expire in 1 hour.</p>
                <p>If you didn't request this, please ignore this email.</p>
                <div class='footer'>
                    <p>NameMemory - Remember Names, Build Connections</p>
                </div>
            </div>
        </body>
        </html>
        ";

        return self::send($email, $subject, $message);
    }

    /**
     * Send group share notification email
     */
    public static function sendShareNotification($email, $groupName, $sharedByName, $permission) {
        $subject = "{$sharedByName} shared a group with you - NameMemory";

        $permissionText = $permission === 'edit' ? 'edit' : 'view';
        $loginLink = APP_URL . '/login';

        $message = "
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .button {
                    display: inline-block;
                    padding: 12px 24px;
                    background-color: #4F46E5;
                    color: #ffffff;
                    text-decoration: none;
                    border-radius: 6px;
                    margin: 20px 0;
                }
                .footer { margin-top: 30px; font-size: 12px; color: #666; }
            </style>
        </head>
        <body>
            <div class='container'>
                <h2>Group Shared With You</h2>
                <p><strong>{$sharedByName}</strong> has shared the group <strong>{$groupName}</strong> with you.</p>
                <p>You have <strong>{$permissionText}</strong> permission for this group.</p>
                <a href='{$loginLink}' class='button'>View Group</a>
                <div class='footer'>
                    <p>NameMemory - Remember Names, Build Connections</p>
                </div>
            </div>
        </body>
        </html>
        ";

        return self::send($email, $subject, $message);
    }

    /**
     * Generic send method
     */
    private static function send($to, $subject, $htmlMessage) {
        $headers = "MIME-Version: 1.0" . "\r\n";
        $headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
        $headers .= "From: " . SMTP_FROM_NAME . " <" . SMTP_FROM . ">" . "\r\n";

        // Use PHP mail() function
        // For production with SMTP, consider using PHPMailer library
        return mail($to, $subject, $htmlMessage, $headers);
    }
}
