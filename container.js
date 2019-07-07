const dependable = require('dependable');
const path = require('path');

const container = dependable.container();

const simpleDependecies = [
    ['_', 'lodash'],
    ['passport', 'passport'],
    ['formidable', 'formidable'],
    ['async', 'async'], 
    ['Club', './models/clubs'],
    ['Users', './models/user'],
    ['Message', './models/message'],
    ['Group', './models/groupmessage'],
    ['aws', './helpers/AWSUpload'],
    ['validator', 'express-validator']
];

simpleDependecies.forEach(function(val){
   container.register(val[0], function(){
       return require(val[1]);
   }) 
});

container.load(path.join(__dirname, '/controllers'));
container.load(path.join(__dirname, '/helpers'));

container.register('container', function(){
    return container;
});

module.exports = container;
















