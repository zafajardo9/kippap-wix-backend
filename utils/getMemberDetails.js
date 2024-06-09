import { wixClient } from '../wixClient.js';

export async function getMemberData(memberId) {
  try {
    const response = await wixClient.members.getMember(memberId);
    return response;
  } catch (error) {
    console.error('Error getting member:', error);
    throw error; 
  }
}
