let io;

module.exports = {
    init: httpServer => {
      io =  require('socket.io')(httpServer,  {
        cors: {
            origin: "http://localhost:3000", //origin from frontend
            methods: ["GET", "POST", "PUT", "DELETE"],
            allowHeaders: ["*"],
            credentials: true
        }
    })
        return io;
    },
    getIo: () => {
        if(!io) {
            throw new Error('Socket.io is not initialized')
        }
        return io;
    }
} //you can use this to interact with io in every part of the app it is needed