const { query } = require("./config/db");
const { generateHash } = require("./services/hashService");

async function main() {
    try {
        console.log("Fetching completed donations...");
        const [donations] = await query(`
            SELECT id, display_name, amount, created_at, previous_hash, current_hash
            FROM donations
            WHERE status = 'Completed'
            ORDER BY created_at ASC
        `);

        console.log(`Found ${donations.length} completed donations.\n`);

        let valid = true;
        let lastHash = "GENESIS";

        for (let i = 0; i < donations.length; i++) {
            const donation = donations[i];
            const timestampStr = new Date(donation.created_at).toISOString();
            
            const calculatedHash = generateHash(
                donation.amount,
                donation.display_name,
                timestampStr,
                donation.previous_hash
            );

            console.log(`Block ${i + 1} (ID: ${donation.id}):`);
            console.log(`  Donor:           ${donation.display_name}`);
            console.log(`  Amount:          ${donation.amount}`);
            console.log(`  Created At (DB): ${donation.created_at}`);
            console.log(`  ISO Timestamp:   ${timestampStr}`);
            console.log(`  Prev Hash (DB):  ${donation.previous_hash}`);
            console.log(`  Expected Prev:   ${lastHash}`);
            console.log(`  Curr Hash (DB):  ${donation.current_hash}`);
            console.log(`  Calculated:      ${calculatedHash}`);

            if (donation.previous_hash !== lastHash) {
                console.log(`  ❌ Link broken! Expected previous_hash to be ${lastHash}, but got ${donation.previous_hash}`);
                valid = false;
            }

            if (donation.current_hash !== calculatedHash) {
                console.log(`  ❌ Hash mismatch! Stored: ${donation.current_hash}, Calculated: ${calculatedHash}`);
                valid = false;
            } else {
                console.log(`  ✅ Hash matches!`);
            }
            console.log();

            lastHash = donation.current_hash;
        }

        console.log(`Final chain validity: ${valid ? "VALID" : "INVALID"}`);
        process.exit(valid ? 0 : 1);
    } catch (error) {
        console.error("Error running test:", error);
        process.exit(1);
    }
}

main();
