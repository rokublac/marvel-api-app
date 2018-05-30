
// ### Charactes names text file request ###
function readTextFile(file, callback){

    var data = new XMLHttpRequest();
    data.open("GET", file, true);

    data.onload = function(){
        if(this.status == 200){
        	// Text file has name that is delimited by new line. Split each name by /n.
        	var charactersRAW = (this.responseText).toString().toUpperCase().split("\n");

        	// letter object that corresponds the array index value below.
        	var letterDictionary = {'#':26};
        	for (value = 0, letterASCII = 65; value <= 25, letterASCII <= 90; value++, letterASCII++){
				letterDictionary[String.fromCharCode(letterASCII)] = value;
			}

        	/* creating a multi-dimensional array to store character names in alphabetical order.
        		characters[0] will store A's, character[1] stores B's.. etc
			*/
        	var characters = [];
			for (var i = 0; i <= 26; i++){
				characters[i] = [];
			}

        	charactersRAW.forEach(function(character) {
				// using the ASCII uppercase code ie. 65 = A, 90 = Z
				for (var index = 0, j = 65; index < characters.length, j <= 90; index++, j++){
					if (character.startsWith(String.fromCharCode(j))){
						characters[index].push(character);
					}
					// check if first character is a number, using regular expression.
					else if (character.match(/^\d/)) {
						// last index store names that start with a number
						characters[26].push(character);
						break;
					} 
					else {
						continue;
					}
				}
			});
			//  return the sorted character name array and the dictionary when the main function is called
			callback(characters, letterDictionary);
        } 
        else if (this.status == 404){
            console.log('404: File not found :(');
        }
    };
    data.send();
}


// ### mouse over background movement ###
var windowWith = $(window).width();
var windowHeight = $(window).height();

$('.container').mousemove(function(e){

	var moveX = ((windowWith / 2) - e.pageX) * 0.02;
	var moveY = ((windowHeight / 2) - e.pageY) * 0.02;

	$('.background').css('margin-left', moveX + 'px');
	$('.background').css('margin-top', moveY + 'px');
});



// ### Search bar ###
$('#search').on('keypress', function(e) {
    if (e.which == 13){
    	e.preventDefault();
      	searchInput = e.target.value;

      var marvelAPI = {
        render: function() {
           // title case function since marvel uses title case for their character names in the URL
          function toTitleCase(str) {
                  return str.replace(/(?:^|\s)\w/g, function(match) {
                      return match.toUpperCase();
                  });
              }

          var marvelLink = document.getElementById('marvelLink');
          var outputMessage = document.getElementById('callmsg');
          var characterName = document.getElementById('charName');
          var characterInfo = document.getElementById('charInfo');
          // api url
          var url = `http://gateway.marvel.com/v1/public/characters?name=${toTitleCase(searchInput)}&ts=1&apikey=5cd4e65f4ea8f9b76d128f5d107fe223&hash=0827b7b7461633e71c1133db26e773a2`;

          // get call
          $.ajax({
            url: url,
            beforeSend: function(){
              outputMessage.innerHTML = 'Connecting to MARVEL API...';
            },
            complete: function(xhr) {
              if (xhr.status == 200){
                marvelLink.innerHTML = 'Data sourced from MARVEL.COM';
              }
            },
            success: function(charactersDATA){
    
              characters = charactersDATA.data.results;
              if (characters.length == 0){
                	outputMessage.innerHTML = 'Unable to find character.';
              } else {
                // not sure why I have to access it at 0 index and not just characters.thumbnail.path . Might be because it returns only one array.
                // outputMessage.innerHTML = `<img src='${characters[0].thumbnail.path}/portrait_incredible.jpg' />`;
                characterName.innerHTML = characters[0].name;
                if (characters[0].description == ""){
                	characterInfo.innerHTML = 'No character description.';
                } else {
                	characterInfo.innerHTML = characters[0].description;
                }
                
                $(".box").css({"background-image": `url(${characters[0].thumbnail.path}/portrait_incredible.jpg)`});
                $('.outputContainer').show(function(){
                	$(this).fadeIn(1000);
                });
             
              }
              
            },
            error: function(){
              outputMessage.innerHTML = "Error retrieving data. Please try again.";
            }
          });
        } 
      };
      // Run the render
      marvelAPI.render();
    }
  });

// Close button when character profile pops up.
$('#closeButton').on('click', function(){
	$('.outputContainer').hide(function(){
		$(this).fadeOut(1000);
	});
	document.getElementById('callmsg').innerHTML = '';
});

// Can also closed if user clicks outside the profile card.
$('.outputContainer').on('click', function(e){
	if (e.target == this){
		$('.outputContainer').hide(function(){
		$(this).fadeOut(1000);
		});
		document.getElementById('callmsg').innerHTML = '';
	}
});

// input suggestion
// hide suggestions on click
$('#search').on('mouseover', function(e){
	e.target.removeAttribute('list');
});


// call the api
readTextFile('./characters/charactersList.txt', function(characters, letterDictionary){
	$('#search').on('keypress',function(e){
		if (e.target.value.charAt(0) == ""){
			// empty input - do nothing
		}
		// 3-d man is the only character that starts with a number
		else if (e.target.value.charAt(0) == '3'){
			$(this).autocomplete({
				lookup: characters[26]
			});
		}
		else {
			$(this).autocomplete({
				lookup: characters[letterDictionary[e.target.value.toUpperCase().charAt(0)]]
			});
		}
	});
});
