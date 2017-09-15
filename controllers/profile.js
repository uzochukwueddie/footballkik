module.exports = function(async, Users, Message, aws, formidable, FriendResult){
    return {
        SetRouting: function(router){
            router.get('/settings/profile', this.getProfilePage);
            
            router.post('/userupload', aws.Upload.any(), this.userUpload);
            router.post('/settings/profile', this.postProfilePage);
            
            router.get('/profile/:name', this.overviewPage);
            router.post('/profile/:name', this.overviewPostPage);
        },
        
        getProfilePage: function(req, res){
            async.parallel([
                function(callback){
                    Users.findOne({'username': req.user.username})
                        .populate('request.userId')
                        .exec((err, result) => {
                            callback(err, result);
                        })
                },
                
                function(callback){
                    const nameRegex = new RegExp("^" + req.user.username.toLowerCase(), "i")
                    Message.aggregate(
                        {$match:{$or:[{"senderName":nameRegex}, {"receiverName":nameRegex}]}},
                        {$sort:{"createdAt":-1}},
                        {
                            $group:{"_id":{
                            "last_message_between":{
                                $cond:[
                                    {
                                        $gt:[
                                        {$substr:["$senderName",0,1]},
                                        {$substr:["$receiverName",0,1]}]
                                    },
                                    {$concat:["$senderName"," and ","$receiverName"]},
                                    {$concat:["$receiverName"," and ","$senderName"]}
                                ]
                            }
                            }, "body": {$first:"$$ROOT"}
                            }
                        }, function(err, newResult){
                            const arr = [
                                {path: 'body.sender', model: 'User'},
                                {path: 'body.receiver', model: 'User'}
                            ];
                            
                            Message.populate(newResult, arr, (err, newResult1) => {
                                callback(err, newResult1);
                            });
                        }
                    )
                }
            ], (err, results) => {
                const result1 = results[0];
                const result2 = results[1];
                
                res.render('user/profile', {title: 'Footballkik - Profile', user:req.user, data: result1, chat:result2});
            });
        },
        
        postProfilePage: function(req, res){
            FriendResult.PostRequest(req, res, '/settings/profile');
            
            async.waterfall([
                function(callback){
                    Users.findOne({'_id':req.user._id}, (err, result) => {
                        callback(err, result);
                    })
                },
                
                function(result, callback){
                    if(req.body.upload === null || req.body.upload === ''){
                        Users.update({
                            '_id':req.user._id
                        },
                        {
                            username: req.body.username,
                            fullname: req.body.fullname,
                            mantra: req.body.mantra,
                            gender: req.body.gender,
                            country: req.body.country,
                            userImage: result.userImage
                        },
                        {
                            upsert: true
                        }, (err, result) => {
                            res.redirect('/settings/profile');
                        })
                    } else if(req.body.upload !== null || req.body.upload !== ''){
                        Users.update({
                            '_id':req.user._id
                        },
                        {
                            username: req.body.username,
                            fullname: req.body.fullname,
                            mantra: req.body.mantra,
                            gender: req.body.gender,
                            country: req.body.country,
                            userImage: req.body.upload
                        },
                        {
                            upsert: true
                        }, (err, result) => {
                            res.redirect('/settings/profile');
                        })
                    }
                }
            ]);
        },
        
        userUpload: function(req, res){
            const form = new formidable.IncomingForm();
            
            form.on('file', (field, file) => {});
            
            form.on('error', (err) => {});
            
            form.on('end', () => {});
            
            form.parse(req);
        },
        
        overviewPage: function(req, res){
            async.parallel([
                function(callback){
                    Users.findOne({'username': req.params.name})
                        .populate('request.userId')
                        .exec((err, result) => {
                            callback(err, result);
                        })
                },
                
                function(callback){
                    const nameRegex = new RegExp("^" + req.user.username.toLowerCase(), "i")
                    Message.aggregate(
                        {$match:{$or:[{"senderName":nameRegex}, {"receiverName":nameRegex}]}},
                        {$sort:{"createdAt":-1}},
                        {
                            $group:{"_id":{
                            "last_message_between":{
                                $cond:[
                                    {
                                        $gt:[
                                        {$substr:["$senderName",0,1]},
                                        {$substr:["$receiverName",0,1]}]
                                    },
                                    {$concat:["$senderName"," and ","$receiverName"]},
                                    {$concat:["$receiverName"," and ","$senderName"]}
                                ]
                            }
                            }, "body": {$first:"$$ROOT"}
                            }
                        }, function(err, newResult){
                            const arr = [
                                {path: 'body.sender', model: 'User'},
                                {path: 'body.receiver', model: 'User'}
                            ];
                            
                            Message.populate(newResult, arr, (err, newResult1) => {
                                callback(err, newResult1);
                            });
                        }
                    )
                }
            ], (err, results) => {
                const result1 = results[0];
                const result2 = results[1];
                
                res.render('user/overview', {title: 'Footballkik - Overview', user:req.user, data: result1, chat:result2});
            });
        },
        
        overviewPostPage: function(req, res){
            FriendResult.PostRequest(req, res, '/profile/'+req.params.name);
        }
    }
}



















