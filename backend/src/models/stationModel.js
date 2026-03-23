const mongoose = require('mongoose');

const timeSeriesSchema = new mongoose.Schema(
    {
        date: { type: String, required: true },
        water_level: { type: Number, required: true }
    }, 
    { _id: false } // Prevents Mongoose from creating an _id for subdocuments
);

const stationSchema = new mongoose.Schema(
    {
        id: { type: String, required: true, unique: true, index: true },
        name: { type: String, required: true },
        location: {
            lat: { type: Number, required: true },
            lng: { type: Number, required: true }
        },
        status: { type: String, required: true, enum: ['Normal', 'Warning', 'Alert'] },
        wellDepth: { type: Number, default: null },
        aquifer: { type: String, default: 'Unknown' },
        time_series: [timeSeriesSchema]
    },
    {
        timestamps: true // Adds createdAt and updatedAt timestamps
    }
);

const Station = mongoose.model('Station', stationSchema);

module.exports = Station;