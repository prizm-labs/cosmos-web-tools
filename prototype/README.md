## Google+ PHP Quickstart

The instructions for getting started are available at:
https://developers.google.com/+/quickstart/php


//sample json 

{"template":"appstore","title":"Blades","company":"Scopely","price":"1.99","inapp":"In-app purchases","score":"3","scorers":"449","thumb":"http://www.google.com","screen":"http://www.google.com","description":"foo bar lorem ipsum","url":"http://www.google.com","url2":"http://www.google.com","reviews":[{"by":"Garrido","score":"4","date":"Mar 4, 2014","summary":"Awesome Update!!!!","review":"Loving it"}]}


//sample embed URL

http://localhost/cosmos/abtester/embed/index.html?json=[URL-OF-JSON-FILE-WITH THE ABOVE CONTENT]

http://localhost/cosmos-web-tools/prototype/embed/index.html?p=qihRGZ1HER&g=2lRZIGmXFk

//sample template

http://localhost/cosmos/abtester/embed/index.html?data=%7B%22template%22%3A%22appstore%22%2C%22title%22%3A%22Blades%22%2C%22company%22%3A%22Scopely%22%2C%22price%22%3A%221.99%22%2C%22inapp%22%3A%22In-app%20purchases%22%2C%22score%22%3A%223%22%2C%22scorers%22%3A%22449%22%2C%22thumb%22%3A%22http%3A%2F%2Fwww.google.com%22%2C%22screen%22%3A%22http%3A%2F%2Fwww.google.com%22%2C%22description%22%3A%22foo%20bar%20lorem%20ipsum%22%2C%22url%22%3A%22http%3A%2F%2Fwww.google.com%22%2C%22url2%22%3A%22http%3A%2F%2Fwww.google.com%22%2C%22reviews%22%3A%5B%7B%22by%22%3A%22Garrido%22%2C%22score%22%3A%224%22%2C%22date%22%3A%22Mar%204%2C%202014%22%2C%22summary%22%3A%22Awesome%20Update!!!!%22%2C%22review%22%3A%22Loving%20it%22%7D%5D%7D


//sample Variant

  /*
        active: false,
      frequency: 0,
      alias:"Variant A",
      gameObjectId:"",
      template:"appstore"
     //  appstore, playstore
     //  title:"Blades",
     //  company:"Scopely",
     //  price:1.99,
     //  //Princing model
     //  //  In-app purchases, Offers In-App Purchases
     //  inapp:"In-app purchases",
     //  score:3,
     //  scorers:449,

     //  // Google Play only
     //  size:0,
     //  downloads:0,

     //  thumb:"http://www.google.com",
     //  screen:"http://www.google.com",
     //  description:"foo bar lorem ipsum",
     //  //"BUY" button redirect tracking URL:
     //  url:"http://www.google.com",
     //  //Rest of page redirect tracking URL:
     //  url2:"http://www.google.com",
     //  reviews:[
     //   {
     //     by:"Garrido",
      //    score:"4",
      //    date:"Mar 4, 2014",
      //    summary:"Awesome Update!!!!",
      //    review:"Loving it"
     //   }
     //  ]
  */
