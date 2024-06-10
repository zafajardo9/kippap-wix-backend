import { wixClient } from '../wixClient.js';

export async function getMemberData(memberId) {
  try {
    const options = {
      fieldsets: "FULL"
    };
    const response = await wixClient.members.getMember(memberId, options);

    return response;
  } catch (error) {
    console.error('Error getting member:', error);
    throw error;
  }
}
