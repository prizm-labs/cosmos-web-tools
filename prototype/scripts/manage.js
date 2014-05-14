$(function() {

  var lookupCache = {
    games: [],
    variants: [],
    campaigns: []
  }

	function preview(url) {
		console.log('preview');
		var iframeUrl = (typeof url === "undefined") ? get_embed_code():  url;

		console.log(iframeUrl);

		$('iframe').attr('src', iframeUrl);
		}
		
	function embed_url() {
		//return document.location.href.substring(0, document.location.href.lastIndexOf('/')) + '/embed/index.html';
      return '../embed/index.html';
		}
	
	function get_embed_code(return_json) {
		var frm = $('form').serializeArray();
		var frmObj = {};
		var frmRev = [];
		$.each(frm, function(i, v) {
			if (v.name.substr(0,7)=='reviews') {
				var rrr = v.name.match(/\['(.+)'\]$/);
				var nam = rrr[1];
				if (nam=='by') { rev = {}; }
				rev[nam] = v.value;
				if (nam=='review' && rev.by.length>0) { console.log(rev);	frmRev.push(rev); }
				} else {
				if (v.value.length > 0) {
						frmObj[v.name] = v.value;
					}
				}
		});
		frmObj['reviews'] = frmRev;
		if (typeof(return_json) != undefined && return_json == true) { return JSON.stringify(frmObj); }
		return embed_url() + '?data=' + encodeURIComponent(JSON.stringify(frmObj));
		}

		function getVariant() {
			var frm = $('form').serializeArray();
			var frmObj = {};
			var frmRev = [];
			$.each(frm, function(i, v) {
				if (v.name.substr(0,7)=='reviews') {
					var rrr = v.name.match(/\['(.+)'\]$/);
					var nam = rrr[1];
					if (nam=='by') { rev = {}; }
					rev[nam] = v.value;
					if (nam=='review' && rev.by.length>0) { console.log(rev);	frmRev.push(rev); }
					} else {
					if (v.value.length > 0) {
						//score, scorers, size, downloads
						//price
						switch (v.name) {
							case "score":
							case "scorers":
							case "downloads":
								v.value = parseInt(v.value,10);
								break;
							case "price":
              case "frequency":
								v.value = parseFloat(v.value);
						}

							frmObj[v.name] = v.value;
						}
					}
			});
			frmObj['reviews'] = frmRev;

			return frmObj;
		}

		function loadVariant(variantData) {

			console.log(currentVariantId);

			// clear form 
			$("#reviews").html("");

			// load form
			var frm = $('form').serializeArray();
			console.log(variantData);

			_.each(variantData, function(value, key) {

				if (key == 'reviews') {

					var reviews = value;

					_.each(reviews, function(reviewData) {
						console.log(reviewData);

						var reviewView = $('.review:eq(0)').clone();

						_.each(reviewData, function(value, key) {
							$(reviewView).find('[name="reviews[][\''+key+'\']"]').first().val(value);
						});

						reviewView.appendTo('#reviews').slideDown('fast');

					});
			
				} else if (key == 'template') {
					// switch store template type
					$('input:radio[value='+value+']').prop("checked",true);
					updateFormFields(value);

				} else {

					$('form [name="'+key+'"]').val(value);
				}
				

			});
			// load preview

			var previewUrl = embed_url() + '?data=' + encodeURIComponent(JSON.stringify(variantData));

			preview(previewUrl);
		}

		function updateFormFields(formClass) {
			// Hide playstore fields
			$('form').removeClass().addClass(formClass);
		}


	


	$('form').on('change', 'input, textarea', function() {
		preview();
		});
		
	$('form').on('change', 'input[name=template]', function() {		

		updateFormFields($(this).val());

		});
		
	$('#embedcode textarea').focus(function() {
		var $this = $(this);
		$this.select();
		$this.mouseup(function() {		// Work around Chrome's little problem; prevent further mouseup intervention
			$this.unbind("mouseup");
			return false;
			});
		});
	/*
	$('input[name=url], input[name=url2], input[name=thumb], input[name=screen]').on('change', function() {
		if ($(this).val().toLowerCase().substr(0,4) != 'http') {
			$(this).val('http://' + $(this).val());
			}
		});
	*/
		
	$('form input[name=template]:first-child').trigger('click');


	// MANUAL EVENT BINDINGS

	$("#new-variant").click(function() {
    $('form').find("input[type=text], textarea").val("");
    currentVariantId = null;
    //clear all reviews
    $("#reviews").html("");
    preview();
	});


	$('input#addreview').on('click', function() {
		$('.review:eq(0)').clone().appendTo('#reviews').slideDown('fast');
		});

	$('#reviews').on('click', 'img.close', function() {
		$(this).closest('.review').slideUp('fast', function() {
			$(this).remove();
			preview();
			});
		});

	function saveObject(object){

		object.save(null, {
			  success: function(point) {
			    // Saved successfully.
			    alert('save successful');
			  },
			  error: function(point, error) {
			    // The save failed.
			    alert('save error: '+error);
			    // error is a Parse.Error with an error code and description.
			  }
			});

	}
	
  //TODO REFACTOR PARSE CLASSES INTERFACE
    
  var Publisher = Parse.Object.extend("Publisher", {});
  var PublisherList = Parse.Collection.extend({model: Publisher});

  var Game = Parse.Object.extend("Game", {});
  var GameList = Parse.Collection.extend({model: Game});

	var Campaign = Parse.Object.extend("Campaign", {});
	var CampaignList = Parse.Collection.extend({model: Campaign});

  var Variant = Parse.Object.extend("Variant", {
    defaults: {
      active: false,
      frequency: 0,
      alias:"Variant A",
      gameObjectId:"",
      template:"appstore"
    }
  });

  var VariantList = Parse.Collection.extend({ model: Variant });

  // This is the transient application state, not persisted on Parse
  var AppState = Parse.Object.extend("AppState", {
    defaults: {
      filter: "all"
    }
  });

  var CampaignView = Parse.View.extend({
    tagName: 'li',
        // Cache the template function for a single item.
    template: _.template($('#campaign-template').html()),

    initialize: function(model) {
      console.log(model);
      //this.model.set("id",this.model.id);
    },

    events: {
      'click .save-frequencies':'saveCampaign',
      'click .balance-frequencies':'balanceFrequencies',
    },

    render: function() {

      var context = this.model.toJSON();
      //context.id = this.model.id;
      console.log(context);

      $(this.el).html(this.template(context));
      //this.input = this.$('.edit');
      this.createVariantSliders();
      return this;
    },

    createVariantSliders: function() {
      var self = this;
      var variants = this.model.get("variants");

      $.each(variants,function(index,variant){
        console.log(variant);
        //TODO map variant names to ids
        var percent = variant.frequency*100;
        var variantId = variant.id;
        var sliderHtml = '<li><div class="slider-info">'+variantId+'</div><div class="slider">'+percent+'</div><span class="value">0</span>%</li>';

        $(self.el).find('.campaign-variants').append(sliderHtml);
      });

    },

    initSliders: function() {
      var self = this;
      var sliders = $(this.el).find(".slider");
      var availableTotal = 100;

      function cacheFrequency(id,frequency) {

        return {
          id: id,
          frequency: parseFloat(frequency/100)
        }

      }

      sliders.each(function() {
          var init_value = parseInt($(this).text());

          $(this).siblings('.value').text(init_value);

          $(this).empty().slider({
              value: init_value,
              min: 0,
              max: availableTotal,
              range: "max",
              step: 1,
              animate: 0,
              slide: function(event, ui) {
                  //debugger;
                  console.log(sliders.length-1);

                  var frequencyCache = [];

                  // Update display to current value
                  $(this).siblings('.value').text(ui.value);
                  var variantId = $(this).siblings('.slider-info').html();

                  frequencyCache.push(cacheFrequency(variantId,ui.value));

                  // Get current total
                  var total = 0;

                  sliders.not(this).each(function() {
                      total += $(this).slider("option", "value");
                  });

                  // Need to do this because apparently jQ UI
                  // does not update value until this event completes
                  total += ui.value;

                  var delta = availableTotal - total;
                  console.log(delta);
                  
                  // Update each slider
                  sliders.not(this).each(function() {
                      //debugger;
                      var t = $(this),
                          value = t.slider("option", "value");

                      var relativeDelta = delta/(sliders.length-1);
                      console.log(relativeDelta);
                      var new_value = value + relativeDelta;
                      console.log(new_value);
                      
                      if (new_value < 0 || ui.value == 100) 
                          new_value = 0;
                      if (new_value > 100) 
                          new_value = 100;

                      t.siblings('.value').text(new_value);
                      t.slider('value', new_value);
                      var variantId = t.siblings('.slider-info').html();
                      frequencyCache.push(cacheFrequency(variantId,new_value));
                  });

                  console.log(frequencyCache);
                  self.model.set('variants',frequencyCache);
              }
          });

        
      });


    },

    saveCampaign: function() {

      var campaignId = this.model.id;
      console.log(this.model);

      saveObject(this.model);

    },

    balanceFrequencies: function() {


    }
  });

  var ManageCampaignsView = Parse.View.extend({
    
    el: $("#campaign-list"),

    initialize: function() {
      var self = this;
    },

    events: {
      'click .new-campaign':'initNewCampaignForm'
    },

    addOne: function(campaign) {
      console.log(campaign);
      console.log(this);
      var view = new CampaignView({model: campaign});
      console.log($(this.el));
      console.log(view.render().el);

      $(this.el).append(view.render().el);
      view.initSliders();
    },

    // Add all items in the Todos collection at once.
    addAll: function(collection, filter) {
      var self = this;
      $(this.el).html("");
      collection.each(function(campaign){
        self.addOne(campaign);
      });
    },

    initNewCampaignForm: function() {

      // create games select

      // create variant select 

      // create publishers select

      // create OS radio buttons

      // set active 

    },

    createNewCampaign: function() {

      // https://parse.com/questions/how-can-i-add-objects-to-a-relation
      // var post = ...;

      // var user = Parse.User.current();
      // var relation = user.relation("posts");
      // relation.add(post);
      // user.save();


    }
    
  });

  // FORM ELEMENT GENERATOR

  function createSelectOptions(parseObject) {

    var className = parseObject.getClassName();

    // map display name and value by class

  }


  // VIEWS
  //======

  var currentVariantId = null;

   var VariantView = Parse.View.extend({

    //... is a list tag.
    tagName:  "li",
    events: {
    	"click .variant-preview":"loadPreview",
    	"click .variant-options":"saveOptions"
    },

    // Cache the template function for a single item.
    template: _.template($('#variant-template').html()),

    initialize: function(model) {
      console.log(model);
      //this.model.set("id",this.model.id);
    },

    render: function() {

      var context = this.model.toJSON();
      //context.id = this.model.id;
      console.log(context);

      $(this.el).html(this.template(context));
      //this.input = this.$('.edit');
      return this;
    },

    loadPreview: function() {
    	currentVariantId = this.model.id;

    	console.log('loading variant');
    	loadVariant(this.model.attributes);
    },

    saveOptions: function() {
    	console.log('saving variant options');

   		
			var alias = this.$('.variant-alias').val();
			var active = this.$('.variant-active').val()=="on"?true:false;
			var frequency = parseFloat(this.$('.variant-frequency').val());

			// variant.set('title',title);
			// variant.set('active',active);
			// variant.set('frequency',frequency);

			var variant = new Variant({
				'alias':alias,
				'active':active,
				'frequency':frequency
			});

			variant.id = this.model.id;

			console.log(variant);

			saveObject(variant);
    }
  });

  var ManageVariantsView = Parse.View.extend({

  	el: ".variants",

		initialize: function() {
      var self = this;

      // Create our collection of Todos
      // this.variants = new VariantList();

      // Setup the query for the collection to look for todos from the current user
      
      // this.todos.query = new Parse.Query(Todo);
      // this.todos.query.equalTo("user", Parse.User.current());
        
      // this.todos.bind('add',     this.addOne);
      // this.todos.bind('reset',   this.addAll);
      // this.todos.bind('all',     this.render);

      // Fetch all the todo items for this user
      // this.variants.fetch({success:function(){
      // 	self.addAll();
      // }});

      // state.on("change", this.filter, this);
      // console.log(this.variants);
    },

    addOne: function(variant) {
    	console.log(variant);
      var view = new VariantView({model: variant});
      this.$("#variant-list").append(view.render().el);
    },

    // Add all items in the Todos collection at once.
    addAll: function(collection, filter) {
      this.$("#variant-list").html("");
      collection.each(this.addOne);
    }

   });


  var variantsView = new ManageVariantsView();
  var campaignsView = new ManageCampaignsView();


  lookupCache.publishers = new PublisherList();
  lookupCache.publishers.fetch({success:function(){
    console.log(lookupCache.publishers);
    //variantsView.addAll(lookupCache.games);
  }});


  lookupCache.games = new GameList();
  lookupCache.games.fetch({success:function(){
    console.log(lookupCache.games);
    //variantsView.addAll(lookupCache.games);
  }});


  lookupCache.variants = new VariantList();
  lookupCache.variants.fetch({success:function(){
    variantsView.addAll(lookupCache.variants);
  }});

  lookupCache.campaigns = new CampaignList();
  lookupCache.campaigns.fetch({success:function(){
    campaignsView.addAll(lookupCache.campaigns);
  }});

  

  $('form #getcode').on('click', function() {

		var variantData = getVariant();
    console.log(variantData);

		//https://parse.com/questions/updating-a-field-without-retrieving-the-object-first

		var variant = new Variant(variantData);

		if (currentVariantId!=null) {
			console.log('updating variant '+currentVariantId);
			variant.id = currentVariantId;
		} else {
			console.log('creating new variant');
		}

		saveObject(variant);

		/*$('div#embedcode textarea:eq(0)').val(get_embed_code());
		$('div#embedcode textarea:eq(1)').val(get_embed_code(true));
		$('div#embedcode textarea:eq(2)').val(embed_url() + '?json=[URL-OF-JSON-FILE-WITH THE ABOVE CONTENT]');
		$.colorbox({width:'50%', inline:true, href:'#embedcode'});
		return false;
		*/
	});
	


});