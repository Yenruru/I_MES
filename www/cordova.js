var http = require('http')
var fs = require('fs')
var server = http.createServer((request, response) => {
response.writeHead(200, {'Content-Type': 'text/html'});
console.log('');//如果沒設定寫入權限在這行就會出錯
response.end('');
})
server.listen(process.env.PORT)