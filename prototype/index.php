<?php
/*
 * Sample application for Google+ client to server authentication.
 * Remember to fill in the OAuth 2.0 client id and client secret,
 * which can be obtained from the Google Developer Console at
 * https://code.google.com/apis/console
 *
 * Copyright 2013 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/*
 * Note (Gerwin Sturm):
 * Include path is still necessary despite autoloading because of the require_once in the libary
 * Client library should be fixed to have correct relative paths
 * e.g. require_once '../Google/Model.php'; instead of require_once 'Google/Model.php';
 */
set_include_path(get_include_path() . PATH_SEPARATOR . __DIR__ .'/vendor/google/apiclient/src');

require_once __DIR__.'/vendor/autoload.php';

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Simple server to demonstrate how to use Google+ Sign-In and make a request
 * via your own server.
 *
 * @author silvano@google.com (Silvano Luciani)
 */

/**
 * Replace this with the client ID you got from the Google APIs console.
 */
const CLIENT_ID = '32812622973-7i6jfo9vtqi7e6satftmkb6925i6f4e6.apps.googleusercontent.com';

/**
 * Replace this with the client secret you got from the Google APIs console.
 */
const CLIENT_SECRET = 'D184j_clPFLHZUqgJbBqzmyt';

/**
 * Optionally replace this with your application's name.
 */
const APPLICATION_NAME = "AB Test App Store Listing";

const PARSE_KEY = "CaW2RpEi1Y2MUnaXbTqJQuQ8oM8xURoVduHuHVzB";
const PARSE_SECRET = "2reYOcoxbcYxYggPuYqg7F9Gfw1X7WLPw7LeSvid";

$client = new Google_Client();
$client->setApplicationName(APPLICATION_NAME);
$client->setClientId(CLIENT_ID);
$client->setClientSecret(CLIENT_SECRET);
$client->setRedirectUri('postmessage');
//$client->addScope('email');

$plus = new Google_Service_Plus($client);

$app = new Silex\Application();
$app['debug'] = true;

$app->register(new Silex\Provider\TwigServiceProvider(), array(
    'twig.path' => __DIR__,
));
$app->register(new Silex\Provider\SessionServiceProvider());


// SIGN IN FLOW DOCS
// https://developers.google.com/+/web/signin/server-side-flow


// Initialize a session for the current user, and render index.html.
$app->get('/', function () use ($app) {
    $state = md5(rand());
    $app['session']->set('state', $state);
    return $app['twig']->render('views/home.html', array(
        'CLIENT_ID' => CLIENT_ID,
        'STATE' => $state,
        'APPLICATION_NAME' => APPLICATION_NAME
    ));
});

$app->get('/home', function () use ($app) {
    $state = md5(rand());
    $app['session']->set('state', $state);
    return $app['twig']->render('views/manage.html', array(
        'CLIENT_ID' => CLIENT_ID,
        'STATE' => $state,
        'APPLICATION_NAME' => APPLICATION_NAME,
        'PARSE_KEY' => PARSE_KEY,
        'PARSE_SECRET' => PARSE_SECRET
    ));
});

/*
INJECTION 

return mixpanel creds

return ga creds


API
return all variants
save a variant

render a variant 


*/

// Upgrade given auth code to token, and store it in the session.
// POST body of request should be the authorization code.
// Example URI: /connect?state=...&gplus_id=...
$app->post('/connect', function (Request $request) use ($app, $client) {
    $token = $app['session']->get('token');

    $account_valid = false;

    if (empty($token)) {
        // Ensure that this is no request forgery going on, and that the user
        // sending us this connect request is the user that was supposed to.
        if ($request->get('state') != ($app['session']->get('state'))) {
            return new Response('Invalid state parameter', 401);
        }

        // Normally the state would be a one-time use token, however in our
        // simple case, we want a user to be able to connect and disconnect
        // without reloading the page.  Thus, for demonstration, we don't
        // implement this best practice.
        //$app['session']->set('state', '');
        
    } else {
        $response = 'Already connected';
    }


    $code = $request->getContent();
    // Exchange the OAuth 2.0 authorization code for user credentials.
    $client->authenticate($code);
    $token = json_decode($client->getAccessToken());


    // You can read the Google user ID in the ID token.
    // https://developers.google.com/accounts/docs/OAuth2Login#obtainuserinfo

    // "sub" represents the ID token subscriber which in our case
    // is the user ID. This sample does not use the user ID.
    $attributes = $client->verifyIdToken($token->id_token, CLIENT_ID)
        ->getAttributes();

    //print_r($attributes);
    //return;

    // check if email@scopely.com
    $pattern = '/@scopely.com/';
    preg_match($pattern, $attributes["payload"]["email"], $matches, PREG_OFFSET_CAPTURE, 3);
    //print_r($matches);
    //return;

    $account_valid = (count($matches)==1 && $attributes["payload"]["email_verified"]);

    $gplus_id = $attributes["payload"]["sub"];

    // Store the token in the session for later use.
    $app['session']->set('token', json_encode($token));
    $response = 'Successfully connected with token: ' . print_r($token, true);

    //return new Response($response, 200);

    if ($account_valid) {
        return new Response($response, 200);
    } else {
        $response = 'Invalid email/account'; 
        return new Response($response, 400);
    }

    
});

// Get list of people user has shared with this app.
$app->get('/people', function () use ($app, $client, $plus) {
    $token = $app['session']->get('token');

    if (empty($token)) {
        return new Response('Unauthorized request', 401);
    }

    $client->setAccessToken($token);
    $people = $plus->people->listPeople('me', 'visible', array());

    /*
     * Note (Gerwin Sturm):
     * $app->json($people) ignores the $people->items not returning this array
     * Probably needs to be fixed in the Client Library
     * items isn't listed as public property in Google_Service_Plus_Person
     * Using ->toSimpleObject for now to get a JSON-convertible object
     */
    return $app->json($people->toSimpleObject());
});

// Revoke current user's token and reset their session.
$app->post('/disconnect', function () use ($app, $client) {
    $token = json_decode($app['session']->get('token'))->access_token;
    $client->revokeToken($token);
    // Remove the credentials from the user's session.
    $app['session']->set('token', '');
    return new Response('Successfully disconnected', 200);
});

$app->run();
