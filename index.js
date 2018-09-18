var http = require('http')
var path = require('path')
var fs = require('fs')
var url = require('url')

var routes = {                                  //req.query对应get数据
	'/a': function(req, res){		//req.body对应post数据 req.body.username
		res.end(JSON.stringify(req.query))
	},

	'/b': function(req, res){
		res.end('match /b')
	},

	'/a/c': function(req, res){
		res.end('match /a/c')
	},

	'/search': function(req, res){
		res.end('username='+req.body.username+',password='+req.body.password)
	},
	'/test': function(req, res){
		res.end('<h1>match /test</h1>')
	}
}

var server = http.createServer(function(req, res){         //入口
	routePath(req, res)
})

server.listen(8080)
console.log('visit http://localhost:8080')

function routePath(req, res){
	var pathObj = url.parse(req.url, true)             //解析URL

	var handleFn = routes[pathObj.pathname]            //得到pathname
	if(handleFn){                                      //在routes内根据pathname匹配
		req.query = pathObj.query                  //找到了

		var body = ''
		req.on('data', function(chunk){            //得到数据
			body += chunk
		}).on('end', function(){
			req.body = parseBody(body)
			handleFn(req, res)
		})

	}else{
		staticRoot(path.resolve(__dirname, 'sample'), req, res)  //找不到把请求当做静态文件处理
	}								 //path.resolve()方法的作用相当于把第一个参数当成父目录，而把第二个参数当成子目录或是其中的文件，进行解析之后得到一个新路径。之所这样是因为linux等下的文件路径和windows不一样，直接+'\static'拼接会有兼容性问题。
}

function staticRoot(staticPath, req, res){
	var pathObj = url.parse(req.url, true)
	var filePath = path.join(staticPath, pathObj.pathname)		 //path.join()用于连接路径。该方法的主要用途在于，会正确使用当前系统的路径分隔符，Unix系统是/，Windows系统是\。
	fs.readFile(filePath, 'binary', function(err, content){
		if(err){
			res.writeHead('404', 'Not Found')
			return res.end()
		}

		res.writeHead(200, 'OK')
		res.write(content, 'binary')
		res.end()
	})
}

function parseBody(body){                          //将数据变成对象
	console.log(body)
	var obj ={}
	body.split('&').forEach(function(str){
		obj[str.split('=')[0]] = str.split('=')[1]
	})
	return obj
}
