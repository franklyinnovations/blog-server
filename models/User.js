/**
 * Created by Administrator on 2017/7/6.
 */
var mongoose = require('mongoose')
var db = require('./db.js')
var async = require('async')
var Page = require('./Page.js')

var UserSchema = mongoose.Schema({
    "userName": {type:String, unique:true},
    "password": String,
    "gender": String,
    "tel": Number,
    "role": String,
    "rTime": Date,
    "remark": String
})

// 分页查询
UserSchema.statics.queryByPage = function (page, cb) {
    var Model = this
    var pageSize = page.pageSize || 10
    var query = page.query
    var currentPage = page.currentPage || 1
    var start = (currentPage-1) * pageSize
    var pageResult = new Page()
    // 查询条件
    queryParams = {
        userName: new RegExp(query.userName),
        role: query.role ? query.role : new RegExp(query.role),
        $and: query.rangeTime[0] ? [{rTime:{"$gt":query.rangeTime[0]}},{rTime:{"$lt":query.rangeTime[1]}}] : [{},{}]
    }
    async.parallel({
        total: function (done) {  // 查询数量
            Model.count(queryParams).exec(function (err, total) {
                done(err, total);
            })
        },
        rows: function (done) {   // 查询一页的记录
            Model.find(queryParams).skip(start).limit(pageSize).sort('_id').exec(function (err, rows) {
                done(err, rows);
            });
        },
    },function (err, result) {
        pageResult.setRows(result.rows)
        pageResult.setTotal(result.total)
        pageResult.setPageCount(Math.ceil(result.total / pageSize))
        pageResult.setCurrentPage(currentPage)
        cb(err,pageResult)
    })
}

module.exports = db.model('User', UserSchema)