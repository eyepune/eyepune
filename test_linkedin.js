import { config } from 'dotenv';
config({ path: '.env.local' });

import { generateAndPostToLinkedin } from './src/lib/linkedin-automation.js';
import { syndicateBlog } from './src/lib/syndication.js';

async function run() {
    console.log("Testing LinkedIn...");
    const res = await generateAndPostToLinkedin('educational');
    console.log("LinkedIn Result:", res);
}

run();
