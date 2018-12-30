<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

use \Psr\Http\Message\ServerRequestInterface as Request;
use \Psr\Http\Message\ResponseInterface as Response;

require '../../vendor/autoload.php';
require '../models/zone.php';

$config = require '../config.php';

$c = new \Slim\Container($config);
$app = new \Slim\App($c);

$container = $app->getContainer();

$connFactory = new \Illuminate\Database\Connectors\ConnectionFactory(new Illuminate\Container\Container);
$conn = $connFactory->make($config['settings']['db']);
$conn->enableQueryLog();
$resolver = new \Illuminate\Database\ConnectionResolver();
$resolver->addConnection('default', $conn);
$resolver->setDefaultConnection('default');
\Illuminate\Database\Eloquent\Model::setConnectionResolver($resolver);

$container['view'] = new \Slim\Views\PhpRenderer('./templates/');

$app->get('/', function (Request $request, Response $response) {
//    $zones = \Zone::all();
    $zones = \Zone::select( \Illuminate\Database\Connection::raw('id, ST_AsGeoJSON(geom) AS geom') )->get();
    $response = $this->view->render($response, 'map.php', ['zones' => $zones]);
});

$app->post('/', function (Request $request, Response $response) {
    $allPostPutVars = $request->getParsedBody();
    
    	foreach( $allPostPutVars['zone'] as $id => $geom ) {
            $zone = \Zone::find( $id );
            if( !$zone ) {
                $zone = new \Zone();
            }
            $zone->geom = \Illuminate\Database\Connection::raw('ST_GeomFromGeoJSON(\''.$geom.'\')');
            if( !$zone->geom ) {
		$zone->delete();
            } else {
		$zone->save();
            }
        }
    return $response->withStatus(302)->withHeader('Location', '/');
});
$app->run();

