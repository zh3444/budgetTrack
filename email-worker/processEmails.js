import { google } from 'googleapis';
import dotenv from 'dotenv';
import { Buffer } from 'node:buffer';

import { User } from './models/User.js';
import { Transaction } from './models/Transaction.js';

dotenv.config({ path: '../.env' });

export async function processEmails() {
  try {
    // fetch all users with gmail access
    const users = await User.find({ gmailRefreshToken: {
      $exists: true,
      $ne: null,
      $nin: ['error']
    }});

    console.log('printing all users ', users);
    // process emails for each user
    for (const user of users) {
      const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
      );

      oauth2Client.setCredentials({
        refresh_token: user.gmailRefreshToken
      });

      // check if refresh token is valid
      if (!await testTokenValidity(oauth2Client)) {
        console.log(`Token for user ${user.email} is invalid, skipping...`);
        user.gmailRefreshToken = 'error';
        await user.save();
        continue; // Skip this user if token is invalid
      }

      const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

      // fetch only new emails since last check
      const query = 'subject:transaction' + (user.lastEmailCheck ? ` after:${Math.floor(user.lastEmailCheck.getTime() / 1000)}` : '');

      const response = await gmail.users.messages.list({
        userId: 'me',
        q: query
      });

      const messages = response.data.messages || [];

      // Process each email
      for (const message of messages) {
        const msg = await gmail.users.messages.get({
          userId: 'me',
          id: message.id,
          format: 'full'
        });
        const payload = msg.data.payload;
        const content = getEmailBody(payload);
        console.log('Processing email content: ', content);

        if (content) {
          const transaction = extractTransactionFromText(content);

          if (transaction) {
            console.log('Extracted transaction: ', transaction);
            await Transaction.create({
              ...transaction,
              userId: user._id
            });
          }
        }
      }
      // update last email check time
      user.lastEmailCheck = new Date();
      await user.save();
    }
    console.log('Emails processed successfully for all users');
  } catch (error) {
    console.error('Error processing emails:', error);
    throw new Error('Failed to process emails');
  }

}

/**
 * Checks the validity of an OAuth2 token by attempting to get the Gmail user profile.
 * 
 * @param {object} oauth2Client - The OAuth2 client containing the token to be validated.
 * @returns {Promise<boolean>} - Returns a promise that resolves to true if the token is valid,
 *                               or false if the token is invalid (401 Unauthorized).
 */

async function testTokenValidity(oauth2Client) {
  try {
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
    await gmail.users.getProfile({
      userId: 'me'
    });
    return true; // Token is valid
  } catch (error) {
    if (error.code === 401) {
      return false; // Token is invalid
    }
  }
}

/**
 * Attempts to extract a transaction from a given text.
 * 
 * The following fields are extracted:
 * - `amount`: The transaction amount, in SGD.
 * - `date`: The date of the transaction, in the format "DD MMM YYYY".
 * - `merchant`: The name of the merchant, if present in the text.
 * - `category`: A default category of "Uncategorized", which can be improved with more logic.
 * 
 * The text is searched for the following patterns:
 * - Amount: "SGD <number>" or "SGD <number>.<number>".
 * - Date: "DD MMM" or "MMM DD" (with the current year appended if necessary).
 * - Merchant: "To: <name>".
 * 
 * If any of the above patterns are found, the corresponding values are extracted and returned as an object.
 * If no patterns are found, the function returns `null`.
 * 
 * @param {string} text - The text to extract the transaction from.
 * @returns {object|null} - The extracted transaction, or `null` if no transaction was found.
 */
function extractTransactionFromText(text) {
  // matches literal SGD with optional space
  const amountMatch = text.match(/SGD\s?[\d,]+(\.\d{2})?/i);
  // matches date in format "1 Jan" or "Jan 1"
  const dateMatch = text.match(/\b(?:\d{1,2}\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)|(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2})\b/i);
  // matches merchant name, assuming it follows "To: "
  const merchantMatch = text.match(/To:\s+([A-Za-z0-9\s'&.-]+)/i);

  let parsedDate = new Date();
  if (dateMatch) {
    const currentYear = new Date().getFullYear();
    let dateString = dateMatch[0];
    if (/^\d/.test(dateString)) {
      // Format "DD MMM" -> convert to "DD MMM YYYY"
      dateString = `${dateString} ${currentYear}`;
    } else {
      // Format "MMM DD" -> convert to "MMM DD YYYY"
      dateString = `${dateString} ${currentYear}`;
    }

    const tempDate = new Date(dateString);
    if (!isNaN(tempDate)) {
      parsedDate = tempDate;
    }
  }

  if (amountMatch) {
    const amountStr = amountMatch[0].replace(/SGD\s?/i, '').replace(',', '');
    const amount = parseFloat(amountStr);
    return {
      amount,
      date: parsedDate,
      merchant: merchantMatch?.[1] || 'Unknown',
      category: 'Uncategorized', // Default category, can be improved with more logic
    };
  }
  return null;
}

/**
 * Extracts the body of a Gmail message from its payload.
 * 
 * Looks for the message body in the payload, and if found, decodes it from base64 and returns it.
 * If the body is not found, looks for a part with a text/plain or text/html MIME type, and if found,
 * decodes and returns that part's body. If no body is found, returns null.
 * 
 * @param {object} payload - The Gmail message payload.
 * @returns {string|null} - The decoded message body, or null if no body was found.
 */
function getEmailBody(payload) {
  if (payload?.body?.size > 0 && payload?.body?.data) {
    return decodeSandwich(payload.body.data);
  }

  if (payload?.parts) {
    const textPart = payload.parts.find(part => part.mimeType === 'text/plain');
    if (textPart && textPart?.body && textPart?.body?.data) {
      return decodeSandwich(textPart.body.data);
    }

    const htmlPart = payload.parts.find(part => part.mimeType === 'text/html');
    if (htmlPart && htmlPart?.body && htmlPart?.body?.data) {
      return removeFancyDecorations(decodeSandwich(htmlPart.body.data));
    }
  }

  return null; // No body found
}

/**
 * Decodes a base64 encoded string with URL-safe characters.
 * 
 * @param {string} wrappedSandwich - The string to decode.
 * @returns {string|null} - The decoded string, or null if decoding fails.
 */
function decodeSandwich(wrappedSandwich) {
  try {
    wrappedSandwich = wrappedSandwich
      .replace(/-/g, '+') // Replace URL-safe characters
      .replace(/_/g, '/'); // Replace URL-safe characters
    
    while (wrappedSandwich.length % 4) {
      wrappedSandwich += '=';
    }

    return Buffer.from(wrappedSandwich, 'base64').toString('utf8');
  } catch (error) {
    console.error('Error decoding sandwich:', error);
    return null; // Return null if decoding fails
  }
}

/**
 * Removes HTML tags from a string, given as a parameter.
 * The function takes a string containing HTML tags, and returns a new string with all HTML tags removed.
 * @param {string} fancySandwich - The string to remove HTML tags from.
 * @returns {string} - The string with HTML tags removed.
 */
function removeFancyDecorations(fancySandwich) {
  // remove HTML tags
  return fancySandwich.replace(/<[^>]+>/g, '');
}

