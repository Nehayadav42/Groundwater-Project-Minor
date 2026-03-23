const axios = require('axios');
const csv = require('csv-parser');
const { Readable } = require('stream');
const Station = require('../models/stationModel');

/**
 * A reusable function to fetch, parse, and transform data from a single source.
 * @param {string} sourceName - A friendly name for the source (e.g., "data.gov.in")
 * @param {string} apiUrl - The URL of the API endpoint to fetch data from.
 * @param {string} apiKey - The API key for authentication (optional)
 * @param {string} apiKeyType - The type of API key auth: 'header', 'query', 'bearer' (default: 'header')
 */
const processDataSource = async (sourceName, apiUrl, apiKey = null, apiKeyType = 'header') => {
    console.log(`Processing data source: ${sourceName}${apiKey ? ' (with API key)' : ''}`);
    try {
        // Prepare request config with API key
        const config = {
            responseType: 'stream',
            headers: {}
        };

        // Add API key based on type
        if (apiKey) {
            if (apiKeyType === 'bearer') {
                config.headers['Authorization'] = `Bearer ${apiKey}`;
            } else if (apiKeyType === 'header') {
                // Common header names - adjust based on your API requirements
                config.headers['X-API-Key'] = apiKey;
                config.headers['API-Key'] = apiKey;
            } else if (apiKeyType === 'query') {
                // For query parameter, append to URL
                const separator = apiUrl.includes('?') ? '&' : '?';
                apiUrl = `${apiUrl}${separator}api_key=${apiKey}`;
            }
        }

        const response = await axios.get(apiUrl, config);
        const results = [];
        const stream = response.data.pipe(csv());

        for await (const row of stream) {
            results.push(row);
        }

        if (results.length === 0) {
            console.log(`No new data from ${sourceName}.`);
            return [];
        }

        // --- IMPORTANT: Data Transformation Logic ---
        // Different APIs will have different column names and data structures.
        // You MUST customize the transformation for each source.
        const operations = results.map(record => {
            let transformedStation;
            
            if (sourceName === 'data.gov.in') {
                transformedStation = {
                    id: record['Sl. No.'],
                    name: record['State/UT'],
                    location: { lat: 0, lng: 0 },
                    status: 'Normal',
                    time_series: [{
                        date: new Date().toISOString().split('T')[0],
                        water_level: parseFloat(record['Current Total Ground Water Extraction'])
                    }]
                };
            } else if (sourceName === 'new-source') {
                // Example for a hypothetical new source
                transformedStation = {
                    id: record['stationId'],
                    name: record['stationName'],
                    location: {
                        lat: parseFloat(record['latitude']),
                        lng: parseFloat(record['longitude'])
                    },
                    status: record['currentStatus'],
                    time_series: [{
                        date: record['readingDate'],
                        water_level: parseFloat(record['waterLevel'])
                    }]
                };
            } else {
                // Skip unknown sources
                return null;
            }

            return {
                updateOne: {
                    filter: { id: transformedStation.id },
                    update: { $set: transformedStation },
                    upsert: true
                }
            };
        }).filter(op => op !== null); // Filter out any skipped records

        return operations;

    } catch (error) {
        console.error(`Error processing source ${sourceName}:`, error.message);
        if (error.response) {
            console.error(`  HTTP Status: ${error.response.status} - ${error.response.statusText}`);
            if (error.response.status === 401 || error.response.status === 403) {
                console.error(`  ⚠ Authentication failed - check your API key configuration in .env`);
            }
        }
        return []; // Return an empty array on error to not break the main process
    }
};

/**
 * The main synchronization function that orchestrates fetching from all sources.
 */
const syncAllDataSources = async () => {
    console.log(' Starting data synchronization for all sources...');
    
    // Define your sources here with API keys from environment variables
    const sources = [
        { 
            name: 'data.gov.in', 
            url: process.env.API_SOURCE_1_URL,
            apiKey: process.env.API_SOURCE_1_KEY,
            apiKeyType: process.env.API_SOURCE_1_KEY_TYPE || 'header' // 'header', 'query', or 'bearer'
        },
        { 
            name: 'new-source', 
            url: process.env.API_SOURCE_2_URL,
            apiKey: process.env.API_SOURCE_2_KEY,
            apiKeyType: process.env.API_SOURCE_2_KEY_TYPE || 'header'
        }
        // Add more sources here
    ];

    let allOperations = [];

    // Process each source one by one
    for (const source of sources) {
        if (source.url) {
            console.log(`Fetching from ${source.name}...`);
            const operations = await processDataSource(
                source.name, 
                source.url, 
                source.apiKey,
                source.apiKeyType
            );
            allOperations = allOperations.concat(operations);
            console.log(`  ✓ Processed ${operations.length} records from ${source.name}`);
        } else {
            console.log(`  ⚠ Skipping ${source.name} - URL not configured`);
        }
    }

    if (allOperations.length > 0) {
        const result = await Station.bulkWrite(allOperations);
        console.log(` Database synchronized. Total operations: ${allOperations.length}. Matched: ${result.matchedCount}, Modified: ${result.modifiedCount}, Inserted: ${result.upsertedCount}`);
    } else {
        console.log('No operations to perform on the database.');
    }
};

module.exports = { syncAllDataSources };