module.exports = function(io, Global, _){
    const clients = new Global();
    
    io.on('connection', (socket) => {
        socket.on('global room', (global) => {
            socket.join(global.room);
            
            clients.EnterRoom(socket.id, global.name, global.room, global.img);
            
            const nameProp = clients.GetRoomList(global.room);
            const arr = _.uniqBy(nameProp, 'name');
            
            io.to(global.room).emit('loggedInUser', arr);
        });
        
        socket.on('disconnect', () => {
            const user = clients.RemoveUser(socket.id);
            
            if(user){
                var userData = clients.GetRoomList(user.room);
                const arr = _.uniqBy(userData, 'name');
                const removeData = _.remove(arr, {'name': user.name})
                io.to(user.room).emit('loggedInUser', arr);
            }
        })
    });
}