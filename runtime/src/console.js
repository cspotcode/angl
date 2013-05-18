// Provides basic console logging support to Angl code

module.exports = {
    console: {
        log: function(other, message) {
            console.log(message);
        },
        dir: function(other, value) {
            console.dir(message);
        }
    }
};