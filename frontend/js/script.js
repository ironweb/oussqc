/* Author:

*/


var oussqc = (function( $, undefined ) {
  var pub = {};

  pub.init = function() {
    //Refresh news when btnRefresh is clicked
    $( "#btnRefresh" ).live( "click", 
      function() {
        pub.getAndDisplayNews();
      });
        
    //When news updated, display items in list
    amplify.subscribe( "news.updated", 
      function( news ) {
          console.log('todo', 'display real items', news);

          item1 = { id: 666,
          img: "/oussqc/img/icon_activite/black.jpg",
          titre: "Expo permanente ste-foy",
          description: "more more text more text more more",
          url: "/empty"
          };

          item2 = { id: 667,
          img: "/oussqc/img/icon_activite/black.jpg",
          titre: "Expo permanente ste-foy",
          description: "more more text more text more more",
          url: "/empty"
          };

          items = [ item1, item2 ];
          console.log('fake items', items);

        displayNews(items);
      });


    //When news updated, then set item count
    amplify.subscribe( "news.updated", 
      function( news ) {
          console.log('todo', 'change item count');
        $("#itemCount").text( news.items.length );
      });    
  };
    
  pub.getAndDisplayNews = function() {
    //Starting loading animation
    //$.mobile.pageLoading();    

    //Get news and add success callback using then
    getNews().then( function() {
      //Stop loading animation on success
      //$.mobile.pageLoading( true );    
    });    
  };
    
  function getNews() {
    //Get news via ajax and return jqXhr
    return $.ajax({
      url: "http://api.ihackernews.com/" + 
         "page?format=jsonp",
      dataType: "jsonp"
    }).then( function( data, textStatus, jqXHR ) {
      //Publish that news has been updated & allow
      //the 2 subscribers to update the UI content
      amplify.publish( "news.updated", data );
      console.log(data);
    });
  }
    
  function displayNews(items) {
    var newsList = $( ".liste" ).find( ".results" );
        
    //Empty current list
    newsList.empty();

    //Use template to create items & add to list
    $( "#evenementItem" ).tmpl(items).appendTo(newsList);
        
    //Call listview jQuery UI Widget after adding 
    //items to the list for correct rendering
    newsList.listview( "refresh" );    
  }
    
  return pub;
}( jQuery ));

oussqc.init();
oussqc.getAndDisplayNews();
