const mongoose = require('mongoose');
const playerSchema = require('./player');

const roomSchma = new mongoose.Schema({
    occupancy: {
        type: Number,
        default: 2,
    },
    maxRounds: {
        type: Number,
        default:3,
    },
    currentRound: {
        required: true,
        type: Number,
        default: 1,
    },
    players: [playerSchema],
    isJoin: {
        type: Boolean,
        default: true,
    },
    turn: playerSchema,
    turnIndex: {
        type: Number,
        default: 0,
    },
});

const roomModel = mongoose.model('Room' , roomSchma);
module.exports = roomModel;