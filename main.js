import { MapParser } from "./src/MapParser.js";
import { GalaxyQueueDispatcher } from "./src/GalaxyQueueDispatcher.js";
import { GalaxyEntityBuilder } from "./src/GalaxyEntityBuilder.js";
import mapsData from "./data/maps.json" with { type: "json" };

const mapParser = new MapParser();
const galaxyEntityBuilderInstance = new GalaxyEntityBuilder(
  "https://challenge.crossmint.io/api/",
  "f1dcbbdd-c354-4d0d-99ab-c6d5abc3e750",
  750
);
const galaxyBuilder = new GalaxyQueueDispatcher(galaxyEntityBuilderInstance);

console.log("🚀 Building X pattern with Polyanets...");

// Show the map
console.log('\n🗺️ MAP:');
console.log(`Description: ${mapsData.map2.description}`);
console.log(`Size: ${mapsData.map2.size.rows}x${mapsData.map2.size.columns}`);
console.log('Map visualization:');
console.log(mapParser.visualizeMap(mapsData.map2.map));

const cleanMap = false;
const commands = mapParser.parseMapData(mapsData.map2, cleanMap);

// Show the commands
console.log('\n📋 COMMANDS GENERATED:');
console.log(`Total commands: ${commands.length}`);
commands.forEach((cmd, i) => {
  console.log(`  ${(i+1).toString().padStart(2)}: ${cmd.type.toUpperCase()} ${cmd.entity} at (${cmd.row}, ${cmd.column})`);
});

console.log('\n🚀 EXECUTING COMMANDS...');
const results = await galaxyBuilder.executeCommands(commands, { mockCalls: false });
  
const successCount = results.filter(r => r.success).length;
console.log(`✨ Completed: ${successCount}/${results.length} successful`);
  
const failures = results.filter(r => !r.success);
if (failures.length > 0) {
    console.log(`❌ ${failures.length} failures`);
}