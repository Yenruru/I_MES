//common function
define(["app"], function (app) {
	
	app.constant('DB_CONFIG', {
        client: {
            id: 'key',
            name: { type: 'text', null: false },
            email: { type: 'text' },
            id_zone: { type: 'integer' }
        },
        zone: {
            id: 'key',
            name: { type: 'text', null: false }
        }
    }).run(function ($SQLite) {
        $SQLite.dbConfig({
            name: 'kmi-sqlite-db',
            description: 'KMI local file DB',
            version: '1.0'
        });
    }).run(function ($SQLite, DB_CONFIG) {
        $SQLite.init(function (init) {
        	/*
            angular.forEach(DB_CONFIG, function (config, name) {
                init.step();
                $SQLite.createTable(name, config).then(init.done);
            });
            */
            init.finish();
        });
    });
	/*
	app.factory('exampleClient', function ($SQLite) {
		  $SQLite.ready(function () { // The DB is created and prepared async. 
			    this.selectAll(o.sql, o.params).then(o.onEmpty, o.onError,
			        function (result) {
			          if (angular.isFunction(o.onResult)) o.onResult.apply(this, [ result.rows, result.count, result.result ]);
			        }
			      );
		  });
		  var clientID = 1;
		  $SQLite.ready(function () { // The DB is created and prepared async. 
		        this
		            .selectFirst('SELECT * FROM client WHERE id = ? LIMIT 1', [ clientID ])
		            .then(
		        function () { console.log('Empty Result!'); },
		        function () { console.err('Error!'); },
		        function (data) {
		  				// Result! 
		          // data.item 
		          // data.count 
		          // data.result 
		  			}
		      );
		    });
		 
		    var newClientData = {
		    name: 'Eduardo Daniel Cuomo',
		    email: 'eduardo.cuomo.ar@gmail.com',
		    id_zone: 123
		  };
		  $SQLite.ready(function () {
		        this.insert('client', newClientData) // this.replace 
		            //.then(onResult, onError) 
		  });
		 
		  $SQLite.ready(function () {
		        this.execute('UPDATE zone SET name = ? WHERE id = ?', [ 'foo', 123 ])
		            //.then(onFinish, onError) 
		  });
	});
	*/
});