import crypto from 'crypto';
import nodemailer from 'nodemailer';

export async function forgotPasswordHandler(email, supabase) {
  try {
    // Check if the user exists
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      throw new Error('User not found');
    }

    // Generate a reset token and expiration time
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiration = Date.now() + 3600000; // Token valid for 1 hour

    // Save the token and expiration in the user's record
    await supabase
      .from('users')
      .update({ reset_token: resetToken, reset_token_expiration: expiration })
      .eq('email', email);

    // Set up Nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER, // Store credentials in environment variables
        pass: process.env.EMAIL_PASS,
      },
    });

    // Send password reset email with the token link
    const resetLink = `https://localhost:3000/dashboard/resetPassword?token=${resetToken}`;
    await transporter.sendMail({
      to: email,
      subject: 'Password Reset Request',
      html: `<p>Click <a href="${resetLink}">here</a> to reset your password. This link will expire in 1 hour.</p>`,
    });

    return { message: 'Password reset link sent' };
  } catch (error) {
    console.error('Error in forgotPasswordHandler:', error);
    throw new Error(error.message);
  }
}