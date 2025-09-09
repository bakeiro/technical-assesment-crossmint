import { GalaxyQueueDispatcher } from "./src/GalaxyQueueDispatcher.ts";
import { GalaxyEntityBuilder } from "./src/GalaxyEntityBuilder.ts";
import type { MapsCollection } from "./types/types.ts";
import { MapParser } from "./src/MapParser.ts";

import mapsData from "./data/maps.json" with { type: "json" };

const typedMapsData = mapsData as MapsCollection;

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
console.log(`Description: ${typedMapsData.map2.description}`);
console.log(`Size: ${typedMapsData.map2.size.rows}x${typedMapsData.map2.size.columns}`);
console.log('Map visualization:');
console.log(mapParser.visualizeMap(typedMapsData.map2.map));

const cleanMap: boolean = false;
const commands = mapParser.parseMapData(typedMapsData.map2, cleanMap);

// Show the commands
console.log('\n📋 COMMANDS GENERATED:');
console.log(`Total commands: ${commands.length}`);
commands.forEach((cmd, i) => {
  console.log(`  ${(i + 1).toString().padStart(2)}: ${cmd.type.toUpperCase()} ${cmd.entity} at (${cmd.row}, ${cmd.column})`);
});

console.log('\n🚀 EXECUTING COMMANDS...');
const results = await galaxyBuilder.executeCommands(commands, { mockCalls: false });

const successCount: number = results.filter(r => r.success).length;
console.log(`✨ Completed: ${successCount}/${results.length} successful`);

const failures = results.filter(r => !r.success);
if (failures.length > 0) {
  console.log(`❌ ${failures.length} failures`);
}
