function convertToId(e){var t="";for(i=0;i<e.length;i++){var s=e.charAt(i),a=s.charCodeAt(0);t+=s.match(/[a-z0-9\u0080-\uFFFF]/)?s:16>a?"_0"+a.toString(16):"_"+a.toString(16)}return t}function getXPos(e){var t=0;if(e.offsetWidth)for(;e&&e!=document.body;)t+=e.offsetLeft,e=e.offsetParent;return t}function getYPos(e){var t=0;if(e.offsetWidth)for(;e&&e!=document.body;)t+=e.offsetTop,e=e.offsetParent;return t}function SearchBox(e,t,s,a){e&&t||alert("Missing parameters to SearchBox."),this.name=e,this.resultsPath=t,this.keyTimeout=0,this.keyTimeoutLength=500,this.closeSelectionTimeout=300,this.lastSearchValue="",this.lastResultsPage="",this.hideTimeout=0,this.searchIndex=0,this.searchActive=!1,this.insideFrame=s,this.searchLabel=a,this.DOMSearchField=function(){return document.getElementById("MSearchField")},this.DOMSearchSelect=function(){return document.getElementById("MSearchSelect")},this.DOMSearchSelectWindow=function(){return document.getElementById("MSearchSelectWindow")},this.DOMPopupSearchResults=function(){return document.getElementById("MSearchResults")},this.DOMPopupSearchResultsWindow=function(){return document.getElementById("MSearchResultsWindow")},this.DOMSearchClose=function(){return document.getElementById("MSearchClose")},this.DOMSearchBox=function(){return document.getElementById("MSearchBox")},this.OnSearchFieldFocus=function(e){this.Activate(e)},this.OnSearchSelectShow=function(){var e=this.DOMSearchSelectWindow(),t=this.DOMSearchSelect();if(this.insideFrame){var s=getXPos(t),i=getYPos(t);s+=t.offsetWidth+6,i+=t.offsetHeight,e.style.display="block",s-=e.offsetWidth,e.style.left=s+"px",e.style.top=i+"px"}else{var s=getXPos(t),i=getYPos(t);i+=t.offsetHeight,e.style.display="block",e.style.left=s+"px",e.style.top=i+"px"}return this.hideTimeout&&(clearTimeout(this.hideTimeout),this.hideTimeout=0),!1},this.OnSearchSelectHide=function(){this.hideTimeout=setTimeout(this.name+".CloseSelectionWindow()",this.closeSelectionTimeout)},this.OnSearchFieldChange=function(e){this.keyTimeout&&(clearTimeout(this.keyTimeout),this.keyTimeout=0);var t=e?e:window.event;if(40==t.keyCode||13==t.keyCode){if(1==t.shiftKey){this.OnSearchSelectShow();var s=this.DOMSearchSelectWindow();for(i=0;i<s.childNodes.length;i++){var a=s.childNodes[i];if("SelectItem"==a.className)return void a.focus()}return}if(window.frames.MSearchResults.searchResults){var n=window.frames.MSearchResults.searchResults.NavNext(0);n&&n.focus()}}else if(27==t.keyCode)return this.DOMSearchField().blur(),this.DOMPopupSearchResultsWindow().style.display="none",this.DOMSearchClose().style.display="none",this.lastSearchValue="",void this.Activate(!1);var r=this.DOMSearchField().value.replace(/ +/g,"");r!=this.lastSearchValue&&(""!=r?this.keyTimeout=setTimeout(this.name+".Search()",this.keyTimeoutLength):(this.DOMPopupSearchResultsWindow().style.display="none",this.DOMSearchClose().style.display="none",this.lastSearchValue=""))},this.SelectItemCount=function(e){var t=0,s=this.DOMSearchSelectWindow();for(i=0;i<s.childNodes.length;i++){var a=s.childNodes[i];"SelectItem"==a.className&&t++}return t},this.SelectItemSet=function(e){var t,s=0,i=this.DOMSearchSelectWindow();for(t=0;t<i.childNodes.length;t++){var a=i.childNodes[t];if("SelectItem"==a.className){var n=a.firstChild;s==e?n.innerHTML="&#8226;":n.innerHTML="&#160;",s++}}},this.OnSelectItem=function(e){this.searchIndex=e,this.SelectItemSet(e);var t=this.DOMSearchField().value.replace(/ +/g,"");""!=t&&this.searchActive&&this.Search()},this.OnSearchSelectKey=function(e){var t=e?e:window.event;return 40==t.keyCode&&this.searchIndex<this.SelectItemCount()?(this.searchIndex++,this.OnSelectItem(this.searchIndex)):38==t.keyCode&&this.searchIndex>0?(this.searchIndex--,this.OnSelectItem(this.searchIndex)):(13==t.keyCode||27==t.keyCode)&&(this.OnSelectItem(this.searchIndex),this.CloseSelectionWindow(),this.DOMSearchField().focus()),!1},this.CloseResultsWindow=function(){this.DOMPopupSearchResultsWindow().style.display="none",this.DOMSearchClose().style.display="none",this.Activate(!1)},this.CloseSelectionWindow=function(){this.DOMSearchSelectWindow().style.display="none"},this.Search=function(){this.keyTimeout=0;var e=this.DOMSearchField().value.replace(/^ +/,""),t=e.toLowerCase().charCodeAt(0),s=e.substr(0,1).toLowerCase();t>=55296&&56319>=t&&e>1&&(s=e.substr(0,2));var i,a,n,r=indexSectionsWithContent[this.searchIndex].indexOf(s);if(-1!=r){var l=r.toString(16);i=this.resultsPath+"/"+indexSectionNames[this.searchIndex]+"_"+l+".html",a=i+"?"+escape(e),n=!0}else i=this.resultsPath+"/nomatches.html",a=i,n=!1;window.frames.MSearchResults.location=a;var h=this.DOMPopupSearchResultsWindow();if("block"!=h.style.display){var o=this.DOMSearchBox();if(this.DOMSearchClose().style.display="inline",this.insideFrame){var c=this.DOMPopupSearchResults();h.style.position="relative",h.style.display="block";var d=document.body.clientWidth-8;h.style.width=d+"px",c.style.width=d+"px"}else{var c=this.DOMPopupSearchResults(),u=getXPos(o)+150,m=getYPos(o)+20;h.style.display="block",u-=c.offsetWidth,h.style.top=m+"px",h.style.left=u+"px"}}this.lastSearchValue=e,this.lastResultsPage=i},this.Activate=function(e){if(e||"block"==this.DOMPopupSearchResultsWindow().style.display){this.DOMSearchBox().className="MSearchBoxActive";var t=this.DOMSearchField();t.value==this.searchLabel&&(t.value="",this.searchActive=!0)}else e||(this.DOMSearchBox().className="MSearchBoxInactive",this.DOMSearchField().value=this.searchLabel,this.searchActive=!1,this.lastSearchValue="",this.lastResultsPage="")}}function SearchResults(e){this.lastMatchCount=0,this.lastKey=0,this.repeatOn=!1,this.FindChildElement=function(e){for(var t=document.getElementById(e),s=t.firstChild;s&&s!=t;){if("DIV"==s.nodeName&&"SRChildren"==s.className)return s;if("DIV"==s.nodeName&&s.hasChildNodes())s=s.firstChild;else if(s.nextSibling)s=s.nextSibling;else{do s=s.parentNode;while(s&&s!=t&&!s.nextSibling);s&&s!=t&&(s=s.nextSibling)}}},this.Toggle=function(e){var t=this.FindChildElement(e);t&&("block"==t.style.display?t.style.display="none":t.style.display="block")},this.Search=function(e){e||(e=window.location.search,e=e.substring(1),e=unescape(e)),e=e.replace(/^ +/,""),e=e.replace(/ +$/,""),e=e.toLowerCase(),e=convertToId(e);for(var t=document.getElementsByTagName("div"),s=0,i=0;i<t.length;){var a=t.item(i);if("SRResult"==a.className){var n=a.id.toLowerCase();n=n.replace(/^sr\d*_/,""),e.length<=n.length&&n.substr(0,e.length)==e?(a.style.display="block",s++):a.style.display="none"}i++}return document.getElementById("Searching").style.display="none",0==s?document.getElementById("NoMatches").style.display="block":document.getElementById("NoMatches").style.display="none",this.lastMatchCount=s,!0},this.NavNext=function(e){for(var t;;){var s="Item"+e;if(t=document.getElementById(s),t&&"block"==t.parentNode.parentNode.style.display)break;if(!t)break;t=null,e++}return t},this.NavPrev=function(e){for(var t;;){var s="Item"+e;if(t=document.getElementById(s),t&&"block"==t.parentNode.parentNode.style.display)break;if(!t)break;t=null,e--}return t},this.ProcessKeys=function(e){if("keydown"==e.type)this.repeatOn=!1,this.lastKey=e.keyCode;else if("keypress"==e.type){if(!this.repeatOn)return this.lastKey&&(this.repeatOn=!0),!1}else"keyup"==e.type&&(this.lastKey=0,this.repeatOn=!1);return 0!=this.lastKey},this.Nav=function(e,t){var s=e?e:window.event;if(13==s.keyCode)return!0;if(!this.ProcessKeys(s))return!1;if(38==this.lastKey){var i=t-1,a=this.NavPrev(i);if(a){var n=this.FindChildElement(a.parentNode.parentNode.id);if(n&&"block"==n.style.display)for(var r,l=0;;){if(r=document.getElementById("Item"+i+"_c"+l),!r)break;a=r,l++}}a?a.focus():parent.document.getElementById("MSearchField").focus()}else if(40==this.lastKey){var a,i=t+1,h=document.getElementById("Item"+t),o=this.FindChildElement(h.parentNode.parentNode.id);o&&"block"==o.style.display&&(a=document.getElementById("Item"+t+"_c0")),a||(a=this.NavNext(i)),a&&a.focus()}else if(39==this.lastKey){var h=document.getElementById("Item"+t),o=this.FindChildElement(h.parentNode.parentNode.id);o&&(o.style.display="block")}else if(37==this.lastKey){var h=document.getElementById("Item"+t),o=this.FindChildElement(h.parentNode.parentNode.id);o&&(o.style.display="none")}else if(27==this.lastKey)parent.searchBox.CloseResultsWindow(),parent.document.getElementById("MSearchField").focus();else if(13==this.lastKey)return!0;return!1},this.NavChild=function(e,t,s){var i=e?e:window.event;if(13==i.keyCode)return!0;if(!this.ProcessKeys(i))return!1;if(38==this.lastKey)if(s>0){var a=s-1;document.getElementById("Item"+t+"_c"+a).focus()}else document.getElementById("Item"+t).focus();else if(40==this.lastKey){var a=s+1,n=document.getElementById("Item"+t+"_c"+a);n||(n=this.NavNext(t+1)),n&&n.focus()}else if(27==this.lastKey)parent.searchBox.CloseResultsWindow(),parent.document.getElementById("MSearchField").focus();else if(13==this.lastKey)return!0;return!1}}function setKeyActions(e,t){e.setAttribute("onkeydown",t),e.setAttribute("onkeypress",t),e.setAttribute("onkeyup",t)}function setClassAttr(e,t){e.setAttribute("class",t),e.setAttribute("className",t)}function createResults(){for(var e=document.getElementById("SRResults"),t=0;t<searchData.length;t++){var s=searchData[t][0],i=document.createElement("div");i.setAttribute("id","SR_"+s),setClassAttr(i,"SRResult");var a=document.createElement("div");setClassAttr(a,"SREntry");var n=document.createElement("a");if(n.setAttribute("id","Item"+t),setKeyActions(n,"return searchResults.Nav(event,"+t+")"),setClassAttr(n,"SRSymbol"),n.innerHTML=searchData[t][1][0],a.appendChild(n),2==searchData[t][1].length){n.setAttribute("href",searchData[t][1][1][0]),searchData[t][1][1][1]&&n.setAttribute("target","_parent");var r=document.createElement("span");setClassAttr(r,"SRScope"),r.innerHTML=searchData[t][1][1][2],a.appendChild(r)}else{n.setAttribute("href",'javascript:searchResults.Toggle("SR_'+s+'")');var l=document.createElement("div");setClassAttr(l,"SRChildren");for(var h=0;h<searchData[t][1].length-1;h++){var o=document.createElement("a");o.setAttribute("id","Item"+t+"_c"+h),setKeyActions(o,"return searchResults.NavChild(event,"+t+","+h+")"),setClassAttr(o,"SRScope"),o.setAttribute("href",searchData[t][1][h+1][0]),searchData[t][1][h+1][1]&&o.setAttribute("target","_parent"),o.innerHTML=searchData[t][1][h+1][2],l.appendChild(o)}a.appendChild(l)}i.appendChild(a),e.appendChild(i)}}function init_search(){var e=document.getElementById("MSearchSelectWindow");for(var t in indexSectionLabels){var s=document.createElement("a");s.setAttribute("class","SelectItem"),s.setAttribute("onclick","searchBox.OnSelectItem("+t+")"),s.href="javascript:void(0)",s.innerHTML='<span class="SelectionMark">&#160;</span>'+indexSectionLabels[t],e.appendChild(s)}searchBox.OnSelectItem(0)}