import { createClient, ApiKeyStrategy } from "@wix/sdk";
import { orders } from "@wix/pricing-plans";
import { members } from "@wix/members";
import ImageKit from 'imagekit';
import dotenv from 'dotenv';

dotenv.config();

const wixClient = createClient({
    modules: { orders, members },
    auth: ApiKeyStrategy({
        siteId: process.env.SITE_ID,
        apiKey: process.env.API_KEY,
    }),
});


const imagekit = new ImageKit({
    publicKey: process.env.publicKey,
    privateKey: process.env.privateKey,
    urlEndpoint: process.env.urlEndpoint,
});

export { wixClient, imagekit };