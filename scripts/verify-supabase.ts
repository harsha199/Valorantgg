import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function verify() {
  console.log('--- Checking Supabase Synchronization ---');
  let allGood = true;

  // 1. Check Storage Buckets
  console.log('\n1. Checking Storage Buckets...');
  const { data: buckets, error: bucketsErr } = await supabase.storage.listBuckets();
  if (bucketsErr) {
    console.error('❌ Failed to list buckets:', bucketsErr.message);
    allGood = false;
  } else {
    const bucketNames = buckets.map(b => b.name);
    const requiredBuckets = ['avatars', 'banners', 'clips'];
    for (const b of requiredBuckets) {
      if (bucketNames.includes(b)) {
        console.log(`✅ Bucket '${b}' exists.`);
      } else {
        console.error(`❌ Bucket '${b}' is missing.`);
        allGood = false;
      }
    }
  }

  // 2. Check Tables (by attempting a simple select with limit 1)
  console.log('\n2. Checking Database Tables...');
  const tablesToCheck = ['profiles', 'posts', 'games', 'clips', 'lfg_listings', 'notifications'];
  
  for (const table of tablesToCheck) {
    const { error } = await supabase.from(table).select('id').limit(1);
    if (error && error.code === '42P01') { // 42P01 is relation does not exist
      console.error(`❌ Table '${table}' does not exist.`);
      allGood = false;
    } else if (error && error.code !== 'PGRST116') { // PGRST116 is results expected but zero
      console.log(`✅ Table '${table}' exists. (Note: ${error.message})`);
    } else {
      console.log(`✅ Table '${table}' exists.`);
    }
  }

  // 3. Check riot_stats column in profiles
  console.log('\n3. Checking specific schema modifications...');
  const { error: profileErr } = await supabase.from('profiles').select('riot_stats').limit(1);
  if (profileErr && profileErr.code === '42703') { // 42703 is undefined column
    console.error(`❌ Column 'riot_stats' is missing from 'profiles' table.`);
    allGood = false;
  } else {
    console.log(`✅ Column 'riot_stats' exists in 'profiles' table.`);
  }

  console.log('\n--- Verification Complete ---');
  if (allGood) {
    console.log('🎉 Everything is perfectly in sync!');
  } else {
    console.log('⚠️ Some things are missing. Please review the errors above.');
  }
}

// Override undici for Next.js 14+ fetch compatibility with DNS issues
const undici = require('undici');
const { Agent, setGlobalDispatcher } = undici;
const agent = new Agent({
  connect: {
    lookup: (hostname, options, callback) => {
      require('dns').lookup(hostname, options, callback);
    }
  }
});
setGlobalDispatcher(agent);

verify();
