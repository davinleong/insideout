import bcrypt from 'bcrypt';

const saltRounds = 10;

export async function resetPasswordHandler(token, newPassword, supabase) {
  try {
    // Find the user with the provided token
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('reset_token', token)
      .single();

    if (error || !user) {
      throw new Error('Invalid or expired token');
    }

    // Check if the token is expired
    if (Date.now() > user.reset_token_expiration) {
      throw new Error('Token has expired');
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update the user's password and clear the reset token and expiration
    await supabase
      .from('users')
      .update({ password: hashedPassword, reset_token: null, reset_token_expiration: null })
      .eq('id', user.id);

    return { message: 'Password has been reset successfully' };
  } catch (error) {
    console.error('Error in resetPasswordHandler:', error);
    throw new Error(error.message);
  }
}