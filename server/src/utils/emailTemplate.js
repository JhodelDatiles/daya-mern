export const verificationEmailTemplate = (username, verificationUrl) => {
  return `
    <div style="background-color: #0a0a0a; color: #ffffff; font-family: 'Helvetica', sans-serif; padding: 40px; text-align: center; border-radius: 20px;">
      <h1 style="font-style: italic; font-weight: 900; text-transform: uppercase; letter-spacing: -2px; font-size: 40px; margin-bottom: 10px;">
        Verify Your Identity
      </h1>
      <p style="text-transform: uppercase; font-size: 10px; letter-spacing: 5px; opacity: 0.5; margin-bottom: 30px;">
        Verify within 24 hours or registration fails and must be redone.
      </p>
      
      <div style="background-color: #1a1a1a; padding: 30px; border: 1px solid #333; border-radius: 15px; margin-bottom: 30px;">
        <p style="font-size: 16px; line-height: 1.6; color: #cccccc;">
          Hi!, <strong style="color: #ffffff;">${username}</strong>. Welcome daya. 
          To activate your account and start your journey with us, hit the secure link below.
        </p>
        
        <a href="${verificationUrl}" 
           style="display: inline-block; background-color: #ffffff; color: #000000; padding: 18px 35px; margin-top: 20px; text-decoration: none; font-weight: 900; text-transform: uppercase; font-style: italic; border-radius: 5px; font-size: 14px;">
          Verify Account →
        </a>
      </div>

      <p style="font-size: 10px; color: #555555; text-transform: uppercase; letter-spacing: 1px;">
        Verify now! and let's start catching those rascals      
      </p>
      
      <hr style="border: 0; border-top: 1px solid #222; margin: 30px 0;">
      
      <p style="font-size: 12px; font-weight: 900; italic; opacity: 0.3;">
        Daya. &copy; 2026
      </p>
    </div>
  `;
};
