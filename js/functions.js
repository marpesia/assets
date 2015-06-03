//useful if your login is by ajax and has a logout and redirect by ajax
(function() { //by Benjamin Rabadan
	
	//	Wrapper function to use $.ajax to send and get data, detects if result is JSON, TEXT and verify error messages
	
	var ajaxRequest = function(opt) { 

	    var defaults = {
		  type : 'GET',
		  url : '',
		  data : { },
		  processData : true,
		  dataType : "text", // xml, html, text, json, jsonp, script, text
		  cache : true,
		  timeout : 30000, // ms
		  disableWarnings : false,
		  
		  done : function() {},
		  fail : function() {},
		  always : function() {}
	    };
	    
	    // Prevent old system fail
	    if (typeof opt.method != 'undefined') {
		defaults.type = opt.method;
	    }

	    var options = $.extend( defaults, opt );
			
	    var JXHR = $.ajax(options)
	    .done(function(data) { 
		  
		  if (typeof data != 'object') {
			
			try {
			   data = JSON.parse(data);
			}catch(e) {  }
			
		  }
		  
			if (data == 'reload' || (data.reload == true && Object.keys(data).length > 0)) {
				location.href = control.url;
				return;
			} else {
				
				if (typeof options.done != 'undefined' && typeof options.done == 'function') {
				    options.done(data);
				}
				
			}
	
	    })
	    .fail(function(JXHR, textStatus) { 
		  
		  if (typeof options.fail != 'undefined' && typeof options.fail == 'function') {
			options.fail(JXHR, textStatus);
		  }
	    })
	    .always(function(data) { 
		  if (typeof options.always != 'undefined' && typeof options.always == 'function') {
			options.always(data);
		  }
	    });
	    
	    return JXHR;
	}
      
	window.ajaxRequest = ajaxRequest;
        
})(window);

//check if is Mobile agent
var isMobile = { 
    Android: function() {
       return navigator.userAgent.match(/Android/i);
    },
    BlackBerry: function() {
       return navigator.userAgent.match(/BlackBerry/i);
    },
    iOS: function() {
       return navigator.userAgent.match(/iPad|iPod/i);
    }, 
    iOSIphone: function() {
       return navigator.userAgent.match(/iPhone/i);
    },
    Opera: function() {
       return navigator.userAgent.match(/Opera Mini/i);
    },
    Windows: function() {
       return navigator.userAgent.match(/IEMobile/i);
    },
    any: function() {
       return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOSIphone() || isMobile.Opera() || isMobile.Windows() || isMobile.iOS());
    } 
};

var web = {
	url : '',
	init : function(url) {
		web.url = url;
		web.mobile = 1024;
		web.user.init();		
		popup.init();	
	},	
	user : {
		loader : null,
		init : function() {
			$('body').on('click','#login .send',function(event){
				event.preventDefault();
				var form = web.cleanForm.cleanSerialize($('#login form'));
				web.user.login(form, this);
			});	
		},
		// Login example function by ajax
		login : function(form, sender){		
			var loader = new Loader(sender, {zIndex: 501});			
			$.ajax({
				url: web.url + "users/login",
				method: 'POST',
				data: { form : form },
				dataType: 'json'
			}).done(function( data ) {	
				loader.stop();
				if (data.result > 0) {

				}else{
					$('#UserLogin .error_text').remove();
					$('#UserLogin .error').removeClass('error');
					var errors_txt = '';
					$.each(data.errors, function(i, index) {
						errors_txt += index +'<br />';
							var field = web.cleanForm.cleanFields(i);
						$('#UserLogin #User'+ field).addClass('error');
					});		
					$('#UserLogin').prepend('<span class="error_text">'+ errors_txt +'</span>');	
				}
			})
		},
		handlebars : function() {
			ajaxRequest({
				url : web.url + 'example/handlebars_data',
				method : 'GET',
				dataType : 'html',
				done: function(template_page){
					//get template passing by controller
					var template = Handlebars.compile(template_page);
					var html = template();
					$('body > div').append(html);	
				}
			});

		},
		//format data form in order to pass to CakePHP 2.x controller
		cleanForm = {
			//get result array from controller by ajax and format to set back errors in the form
			cleanFields : function(value){
				var field = value.substring(0, 1).toUpperCase() + value.substring(1).toLowerCase();
				var slash = field.indexOf('_');
				if(slash > 0){
					field = value.substring(0, 1).toUpperCase() + value.substring(1, slash).toLowerCase() + value.substring(slash+1, slash+2).toUpperCase() + value.substring(slash+2).toLowerCase();
					var slash2 = field.indexOf('_');
					if(slash2 > 0){
						field = value.substring(0, 1).toUpperCase() + value.substring(1, slash).toLowerCase() + value.substring(slash+1, slash+2).toUpperCase() + value.substring(slash+2,slash2+1).toLowerCase() + value.substring(slash2+2, slash2+3).toUpperCase() + value.substring(slash2+3).toLowerCase();
					}
				}	
				return field;		
			},
			//get data form and process to get an array to pass to the controller by ajax
			cleanSerialize : function(form){
			    var o = {};
			    var a = form.serializeArray();
			    $.each(a, function(i, index) {
			        if (index.name.match(/(\[\])$/)) { //Miro si viene un array en la cadena
			        	if(!$.isArray(o[index.name.replace('data[','')])){
				        	o[index.name.replace('data[','')] = [];
			        	}
			        	o[index.name.replace('data[','')].push(index.value);
			        } else {
			            o[index.name.replace('data[','')] = index.value || '';
			        }
			    });
			    return o;
			}
		}
	}
}

var popup = {
	init : function(){
		$('body').on('click','.closePopup',function(){
			popup.hide();
		})
		$('body').on('click','div.nc-shade',function(){
			popup.hide();
		})	
	},		
	shade : function(){
		var $shade = $('<div class="nc-shade"></div>');
		if($('div.nc-shade').is(":visible") == true){
			$('div.nc-shade').remove();
		}
		$shade.prependTo('body');
		$shade.css(	{'opacity': 0.7, width: $(window).width(), height: $(window).height() });
		$shade.fadeIn();
		$( window ).resize(function() {
			$shade.css(
				{ width: $(window).width(), height: $(window).height() }
			);
		})

	},
	show : function(div){
	
		popup.hide();			
		popup.shade();			

		$('#' + div).fadeIn();
		var h = $('#' + div).outerHeight();
		$('#' + div).css({'height' : h +'px', 'margin-top' : '-'+ h/2 + 'px' });
	},
	hide : function(){
		$('.popup_contain').fadeOut().remove();
		$('div.nc-shade').remove();
	},
	sms : function(text, titulo){
		popup.hide();			
		popup.shade();	

		var div = '<div id="sms" class="section-wrapper popup_contain">';
				div += '<div class="popup-header">';
					div += '<h3>' + titulo + '</h3>';
					div += '<a class="btn-close-header closePopup" title="Close"></a>';
				div += '</div>';
				div += '<div class="hightlight">';
					div += '<p>' +  text + '</p>';
				div += '</div>';
			div += '</div>';

		$('body').append(div);
		var h = $('#sms').outerHeight();
		$('#sms').css({'height' : h +'px', 'margin-top' : '-'+ h/2 + 'px' });
	},
	positionPopup: function(){
		var h_popup = $('.popup_contain').outerHeight() + 100;
		var h_screen = $(window).height();
		$('.popup_contain').css({
			position : 'fixed',
			top: '50%',
			marginTop: -(h_popup/2)
		});

		if (h_screen <= h_popup) {
			$('.popup_contain').css({
				position : 'absolute',
				top: 0,
				marginTop: '20px'
			});
			$("html, body").animate({ scrollTop: 0 }, "slow");
		  	return false;
		};

		if(!isMobile.any()){
			if (h_screen <= h_popup) {
				$('.popup_contain').css({
					position : 'absolute',
					top: 0,
					marginTop: '20px'
				});				
				$("html, body").animate({ scrollTop: 0 }, "slow");
			  	return false;
			};
		}
	}
}


var Loader = function(where, opts){
	var $loader = $('<div class="nc-loading" />');
	var $where = $(where);

	if(opts && opts.zIndex){
		$loader.css('z-index', opts.zIndex);
	}

	this.stop = function(){
		$where.css('visibility', 'visible');
		$loader.hide().remove();
	};

	$('body').append($loader);
	
	var position = $where.offset();
	var left = position.left;
	var top = position.top + (($where.height() - $loader.height())/2);

	$loader.css({top: position.top, left: left, width : $where.outerWidth(), height : $where.outerHeight() });

	if($where.width() > 32 && $where.height > 32){
		$loader.css({width:$where.width(), height: $where.height()});
	}
	
	$loader.show();
	$where.css('visibility', 'hidden');
}
