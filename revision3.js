/**
 * Revision3 plugin for showtime version 0.4  by NP
 *
 *  Copyright (C) 2011 NP
 *
 * 	ChangeLog:
 *  0.4
 *  New API support
 * 	Support for Show Notes in old episodes
 * 	0.3
 * 	Major rewrite
 * 	Add support to Archives
 * 	Add suport to all episodes 
 * 
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

//TODO : Clean up

(function(plugin) {


//settings 

  var service =
    plugin.createService("Revision3", "revision3:start", "tv", true,
			   plugin.path + "logo_large.png");
  
  var settings = plugin.createSettings("Revision3",
					  plugin.path + "logo_large.png",
					 "Revison3: The Best TV Shows on the net");

  settings.createInfo("info",
			     plugin.path + "logo_large.png",
			     "Internet Television any way you want it.\n\n"+
				 "Revision3 is the leading television network for the internet generation.\n"+
				 "We create and produce all-original episodic community driven programs watched\n"+
				 "by a super-committed and passionate fan base. Learn more on wwww.revision3.com \n" + 
				 "Plugin developed by NP \n");

    settings.createBool("hd", "HD", false, function(v) {
    service.hd = v;
  });


function startPage(page) {      	
		
		var content = showtime.httpGet("http://revision3.com/shows").toString();
		var inicio = content.indexOf('<ul id="shows">');
		var fim = content.indexOf('</ul>', inicio);
		var nice = content.slice(inicio, fim+6);
		var split = nice.split('</li>');
	
		for each (var show in split) {
			if(show.toString().match('<h3><a href="/.*">.*</a></h3>') != null){
			var metadata = {
				title: show.toString().match('<h3><a href="/.*">.*</a></h3>').toString().match('">.*</a></h3>').toString().replace('</a></h3>',"").replace('">',""),
				icon: show.toString().match('<img src=".*" /></a>').toString().replace('<img src="',"").replace('" /></a>',"")
			};
			
			var url = show.toString().match('<h3><a href="/.*">').toString().replace('<h3><a href="/',"").replace('">','');
			page.appendItem("revision3:show:feed:" + url,"directory", metadata);
		}
		}
		
		//Archives	
		page.appendItem("revision3:archives", "directory", {
		  title: "Archived Shows",
		  icon:  plugin.path + "logo_large.png"
		  });
	
			
	page.type = "directory";
    page.contents = "items";
    page.loading = false;

    page.metadata.logo = plugin.path + "icon.png";
    page.metadata.title = "Revision3";

  }


plugin.addURI("revision3:archives", function(page) {

   page.type = "directory";
   page.contents = "items";
   page.loading = false;

   page.metadata.logo = plugin.path + "icon.png";
   page.metadata.title = "Archived Shows";

   var content = showtime.httpGet("http://revision3.com/shows/archive").toString();
		var inicio = content.indexOf('<ul id="shows">');
		var fim = content.indexOf('</ul>', inicio);
		var nice = content.slice(inicio, fim+6);
		var split = nice.split('</li>');
	
		for each (var show in split) {
			if(show.toString().match('<h3><a href="/.*">.*</a></h3>') != null){
			var metadata = {
				title: show.toString().match('<h3><a href="/.*">.*</a></h3>').toString().match('">.*</a></h3>').toString().replace('</a></h3>',"").replace('">',""),
				icon: show.toString().match('<img src=".*" /></a>').toString().replace('<img src="',"").replace('" /></a>',"")
			};
			
			var url = show.toString().match('<h3><a href="/.*">').toString().replace('<h3><a href="/',"").replace('">','');
			page.appendItem("revision3:show:feed:" + url,"directory", metadata);
		}
		}
 


  page.loading = false; 
});



plugin.addURI("revision3:main:([a-z0-9,]*)", function(page, channelId) {
   
   if(service.hd == "1"){ var VideoQuality ="MP4-hd30"; }else{ var VideoQuality ="MP4-Large"; }
		
   page.contents = "video";
   page.type = "directory";
   
   page.metadata.logo = plugin.path + "icon.png";
   page.metadata.title = channelId;
   var doc = new XML(showtime.httpGet("http://revision3.com/" + channelId + "/feed/" + VideoQuality).toString());
		   

   for each (var arg in doc.channel.item) {
		  
	var metadata = {
	      title: arg.title,
	      description: arg.description
	  };
	var url = "http://videos.revision3.com/revision3/web" + arg.guid;
	page.appendItem(url,"video", metadata);
   }
    
  page.loading = false; 
});



plugin.addURI("revision3:show:feed:([a-z0-9,]*)", function(page, show) {
   
   if(service.hd == "1"){ var VideoQuality ="MP4-hd30"; }else{ var VideoQuality ="MP4-Large"; }
		
   page.contents = "video";
   page.type = "directory";
   
   page.metadata.logo = plugin.path + "icon.png";
   
   var doc = new XML(showtime.httpGet("http://revision3.com/" + show + "/feed/" + VideoQuality).toString());
   page.metadata.title = doc.channel.title;
	   

   for each (var arg in doc.channel.item) {
		  
	var metadata = {
	      title: arg.title,
	      description: arg.description,
	      icon:  doc.channel.image.url
	  };
	var url = "http://videos.revision3.com/revision3/web" + arg.guid;
	page.appendItem(url,"video", metadata);
   }
   
   //All Episodes
   page.appendItem("revision3:show:" + show, "directory", {
		  title: "All Episodes",
		  icon:  "http://videos.revision3.com/revision3/images/shows/unboxingporn/unboxingporn_160x160.jpg"
		  });
 
   
  page.loading = false; 
});

plugin.addURI("revision3:show:([a-z0-9,]*)", function(page, show) {
	
   page.contents = "video";
   page.type = "directory";
   page.metadata.logo = plugin.path + "icon.png";
   
   
   var content = showtime.httpGet("http://revision3.com/" + show).toString();
   var img = content.match('src="http://videos.revision3.com/revision3/images/shows/.*.jpg"').toString().replace('src="',"").replace('"',""); 
   var inicio = content.indexOf('<tbody>');
   var fim = content.indexOf('</tbody>', inicio);
   var nice = content.slice(inicio, fim+8);
   var split = nice.split('</tr>');
      
   var name = split[1].toString().match('<td class="show" nowrap>.*</td>').toString().replace('<td class="show" nowrap>',"").replace('</td>',"");
   page.metadata.title = name.toString();
   
   for each (var episode in split) {
	   if(episode.toString().match('<td class="title"><a href="/.*">.*</a></td>') != null){
		   var metadata = {
			   title: episode.toString().match('<td class="episode-number" nowrap>.*</td>').toString().replace('<td class="episode-number" nowrap>',"").replace('</td>',"") + '  '+ episode.toString().match('<td class="title"><a href="/.*">.*</a></td>').toString().replace('<td class="title"><a href="',"").match('">.*</a></td>').toString().replace('</a></td>',"").replace('">',""),
			   description: episode.toString().match('<td class="title"><a href="/.*">.*</a></td>').toString().replace('<td class="title"><a href="',"").match('">.*</a></td>').toString().replace('</a></td>',"").replace('">',""), 
			   icon: img,
			   duration: episode.toString().match('<td class="running-time">.*</td>').toString().replace('<td class="running-time">',"").replace('</td>',""),
			   rating: 3 / 5.0
			};
			   
			   var url = episode.toString().match('<td class="title"><a href="/.*"').toString().replace('<td class="title"><a href="/',"").replace('">','');
			   page.appendItem('revision3:link:' + url ,"video", metadata);
			   
	   }
	}

  page.loading = false; 
});


plugin.addURI("revision3:link:(.*)", function(page, link) {
   	
   page.metadata.logo = plugin.path + "icon.png";
   
   var content = showtime.httpGet("http://revision3.com/" + link.toString().replace('"','')).toString();
   page.metadata.title = content.match('<title>.*</title>').toString().replace('<title>','').replace('</title>','');  

   var runtime = content.match('running time .*</div>').toString().replace('running time ','').replace('</div>','');
   var subtext = content.match('<div class="subtext">.*\\d{4}').toString().replace('<div class="subtext">','');
   var url = content.match('href=".*">Tablet</a>');
   if(url != null)
	   url = url.toString().replace('href="','').replace('">Tablet</a>','');

	var img ="http://videos.revision3.com/revision3/images/shows/"+ url.slice(0,url.lastIndexOf("-")).replace("http://videos.revision3.com/revision3/web/","") +"-large.thumb.jpg";
	   
	var descrip = null;
	
	if(descrip == null && content.match('<div class="description">.*</div>') != null)
		descrip = content.match('<div class="description">.*</div>').toString().replace('<div class="description">','').replace('</div>','');
	
	if(descrip == null && content.match('<div class="summary">.*</div>') != null)
		descrip = content.match('<div class="summary">.*</div>').toString().replace('<div class="summary">','').replace('</div>','');
	
	if(descrip == null && content.match('<div class="segmentSummary">.*</div>') != null){
		while(content.match('<div class="segmentSummary">.*</div>') !=null){
		var aux=content.match('<div class="segmentSummary">.*</div>').toString();
		content = content.replace(aux, "");
		descrip = aux.replace('<div class="segmentSummary">','').replace('</div>','');
		}
		
	}
 
  page.metadata.icon = img ;
  page.appendPassiveItem("label", subtext);
  page.appendPassiveItem("label", runtime, { title: "Duration"});
  page.appendPassiveItem("bodytext", new showtime.RichText(descrip)); 

  page.appendAction("navopen", url, true, { title: "Watch" });
	
  url = content.match('href=".*">HD</a>');
  if(url != null)
	page.appendAction("navopen", url.toString(), true, { title: "Watch in HD" });
	
  page.loading = false;
  page.type = "item";
});


plugin.addURI("revision3:present:(.*):(.*)", function(page, link, url) {


});


function getVideo(url){
	url = url.replace('"','');
	var content = showtime.httpGet("http://revision3.com/" + url.toString()).toString();
	if(service.hd == "1"){
		 return content.match('href=".*">HD</a>').toString().replace('href="','').replace('">HD</a>',''); 
		 }else{ 
			 return content.match('href=".*">Tablet</a>').toString().replace('href="','').replace('">Tablet</a>','');
			 }
	}
	
plugin.addURI("revision3:start", startPage);
})(this);
