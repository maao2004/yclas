// selectize for category and location selects
$(function(){
    
    // create 1st category select
    category_select = createCategorySelect();
    // remove hidden class
    $('#category-chained .select-category[data-level="0"]').parent('div').removeClass('hidden');
    
    // load options for 1st category select
    category_select.load(function(callback) {
        $.ajax({
            url: $('#category-chained').data('apiurl'),
            type: 'GET',
            data: { 
                "id_category_parent": 1,
                "sort": 'order',
            },
            success: function(results) {
                callback(results.categories);
            },
            error: function() {
                callback();
            }
        });
    });
    
    // create 1st location select
    location_select = createLocationSelect();
    // remove hidden class
    $('#location-chained .select-location[data-level="0"]').parent('div').removeClass('hidden');
    
    // load options for 1st location select
    location_select.load(function(callback) {
        $.ajax({
            url: $('#location-chained').data('apiurl'),
            type: 'GET',
            data: { 
                "id_location_parent": 1,
                "sort": 'order',
            },
            success: function(results) {
                callback(results.locations);
            },
            error: function() {
                callback();
            }
        });
    });
});

function createCategorySelect () {
    
    // count how many category selects we have rendered
    num_category_select = $('#category-chained .select-category[data-level]').length;
    
    // clone category select from template
    $('#select-category-template').clone().attr('id', '').insertBefore($('#select-category-template')).find('select').attr('data-level', num_category_select);
    
    // initialize selectize on created category select
    category_select = $('.select-category[data-level="'+ num_category_select +'"]').selectize({
        valueField:  'id_category',
        labelField:  'name',
        searchField: 'name',
        onChange: function (value) {
            
            if (!value.length) return;
            
            // get current category level
            current_level = $('#category-chained .option[data-value="'+ value +'"]').closest('.selectize-control').prev().data('level');
            
            // is allowed to post on selected category?
            if ( current_level > 0 || (current_level == 0 && $('#category-chained').is('[data-isparent]')))
            {
                // update #category-selected input value
                $('#category-selected').attr('value', value);
                
                //get category price
                $.ajax({
                    url: $('#category-chained').data('apiurl') + '/' + value,
                    success: function(results) {
                        if (results.category.price != $('#category-chained').data('price0')) {
                            price_txt = $('#paid-category .help-block').data('title').replace(/%s/g, results.category.name).replace(/%d/g, results.category.price);
                            $('#paid-category').removeClass('hidden').find('.help-block span').text(price_txt);
                        }
                        else {
                            $('#paid-category').addClass('hidden');
                        }
                    }
                });
            }
            else
            {
                // set empty value
                $('#category-selected').attr('value', '');
                $('#paid-category').addClass('hidden');
            }
            
            // get current category level
            current_level = $('#category-chained .option[data-value="'+ value +'"]').closest('.selectize-control').prev().data('level');
            
            destroyCategoryChildSelect(current_level);
            
            // create category select
            category_select = createCategorySelect();
            
            // load options for category select
            category_select.load(function (callback) {
                $.ajax({
                    url: $('#category-chained').data('apiurl'),
                    data: { 
                        "id_category_parent": value,
                        "sort": 'order',
                    },
                    type: 'GET',
                    success: function (results) {
                        if (results.categories.length > 0)
                        {
                            callback(results.categories);
                            $('#category-chained .select-category[data-level="' + (current_level + 1) + '"]').parent('div').removeClass('hidden');
                        }
                        else
                        {
                            destroyCategoryChildSelect(current_level);
                        }
                    },
                    error: function () {
                        callback();
                    }
                });
            });
        }
    });
    
    // return selectize control
    return category_select[0].selectize;
}

function createLocationSelect () {
    
    // count how many location selects we have rendered
    num_location_select = $('#location-chained .select-location[data-level]').length;
    
    // clone location select from template
    $('#select-location-template').clone().attr('id', '').insertBefore($('#select-location-template')).find('select').attr('data-level', num_location_select);
    
    // initialize selectize on created location select
    location_select = $('.select-location[data-level="'+ num_location_select +'"]').selectize({
        valueField:  'id_location',
        labelField:  'name',
        searchField: 'name',
        onChange: function (value) {
            
            if (!value.length) return;
            
            // update #location-selected input value
            $('#location-selected').attr('value', value);
            
            // get current location level
            current_level = $('#location-chained .option[data-value="'+ value +'"]').closest('.selectize-control').prev().data('level');
            
            destroyLocationChildSelect(current_level);
            
            // create location select
            location_select = createLocationSelect();
            
            // load options for location select
            location_select.load(function (callback) {
                $.ajax({
                    url: $('#location-chained').data('apiurl'),
                    data: { 
                        "id_location_parent": value,
                        "sort": 'order',
                    },
                    type: 'GET',
                    success: function (results) {
                        if (results.locations.length > 0)
                        {
                            callback(results.locations);
                            $('#location-chained .select-location[data-level="' + (current_level + 1) + '"]').parent('div').removeClass('hidden');
                        }
                        else
                        {
                            destroyLocationChildSelect(current_level);
                        }
                    },
                    error: function () {
                        callback();
                    }
                });
            });
        }
    });
    
    // return selectize control
    return location_select[0].selectize;
}

function destroyCategoryChildSelect (level) {
    if (level === undefined) return;
    $('#category-chained .select-category[data-level]').each(function () {
        if ($(this).data('level') > level) {
            $(this).parent('div').remove();
        }
    });
}

function destroyLocationChildSelect (level) {
    if (level === undefined) return;
    $('#location-chained .select-location[data-level]').each(function () {
        if ($(this).data('level') > level) {
            $(this).parent('div').remove();
        }
    });
}

$('#category-edit button').click(function(){
    $('#category-chained').removeClass('hidden');
    $('#category-edit').addClass('hidden');
});
    
$('#location-edit button').click(function(){
    $('#location-chained').removeClass('hidden');
    $('#location-edit').addClass('hidden');
});

// sceditor
$('textarea[name=description]:not(.disable-bbcode)').sceditorBBCodePlugin({
    toolbar: "bold,italic,underline,strike,|left,center,right,justify|" +
    "bulletlist,orderedlist|link,unlink,youtube|source",
    resizeEnabled: "true",
    emoticonsEnabled: false,
    style: $('meta[name="application-name"]').data('baseurl') + "themes/default/css/jquery.sceditor.default.min.css",
});
	
// paste plain text in sceditor
$(".sceditor-container iframe").contents().find("body").bind('paste', function(e) {
    e.preventDefault();
    var text = (e.originalEvent || e).clipboardData.getData('text/plain');
    $(".sceditor-container iframe")[0].contentWindow.document.execCommand('insertText', false, text);
});	

// google map set marker on address
if ($('#map').length !== 0){
    new GMaps({
        div: '#map',
        zoom: parseInt($('#map').attr('data-zoom')),
        lat: $('#map').attr('data-lat'),
        lng: $('#map').attr('data-lon')
    }); 
    var typingTimer;                //timer identifier
    var doneTypingInterval = 500;  //time in ms, 5 second for example
    //on keyup, start the countdown
    $('#address').keyup(function () {
        clearTimeout(typingTimer);
        if ($(this).val()) {
           typingTimer = setTimeout(doneTyping, doneTypingInterval);
        }
    });
    //user is "finished typing," refresh map
    function doneTyping () {
        GMaps.geocode({
            address: $('#address').val(),
            callback: function (results, status) {
                if (status == 'OK') {
                    var latlng = results[0].geometry.location;
                    map = new GMaps({
                        div: '#map',
                        lat: latlng.lat(),
                        lng: latlng.lng(),
                    }); 
                    map.setCenter(latlng.lat(), latlng.lng());
                    map.addMarker({
                        lat: latlng.lat(),
                        lng: latlng.lng(),
                        draggable: true,
                    });
                    $('#publish-latitude').val(latlng.lat());
                    $('#publish-longitude').val(latlng.lng());
                }
            }
        });
    }
}

// auto locate user
$('.locateme').click(function() {
    var lat;
    var lng;
    GMaps.geolocate({
        success: function(position) {
            lat = position.coords.latitude;
            lng = position.coords.longitude
            map = new GMaps({
                div: '#map',
                lat: lat,
                lng: lng,
            }); 
            map.setCenter(lat, lng);
            map.addMarker({
                lat: lat,
                lng: lng,
            });
            $('#publish-latitude').val(lat);
            $('#publish-longitude').val(lng);
            GMaps.geocode({
                lat: lat,
                lng: lng,
                callback: function(results, status) {
                    if (status == 'OK') {
                        $("input[name='address']").val(results[0].formatted_address)
                    }
                }
            });
        },
        error: function(error) {
            alert('Geolocation failed: '+error.message);
        },
        not_supported: function() {
            alert("Your browser does not support geolocation");
        },
    });
});

// unhide next box image after selecting first
$('.fileinput').on('change.bs.fileinput', function() {
   $(this).next('.fileinput').removeClass('hidden');
});

// validate image size
$('input[name^="image"]').on('change', function() {
    //check whether browser fully supports all File API
    if (window.File && window.FileReader && window.FileList && window.Blob)
    {
        //get the file size and file type from file input field
        var image = $(this)[0].files[0];
        var max_size = $('.images').data('max-image-size')*1048576 // max size in bites

        if (image && image.size > max_size)
        {
            swal({
                title: '',
                text: $('.images').data('swaltext'),
                type: "warning",
                allowOutsideClick: true
            });
            
            $(this).closest('.fileinput').fileinput('clear');
        }
    }
});

// VALIDATION with chosen fix
$(function(){
    $.validator.addMethod(
        "regex",
        function(value, element, regexp) {
            var re = new RegExp(regexp);
            return this.optional(element) || re.test(value);
        }
    );

    // some extra rules for custom fields
    if ($('.cf_decimal_fields').length !== 0)
        var $decimal = $(".cf_decimal_fields").attr("name");
    if ($('.cf_integer_fields').length !== 0)
        var $integer = $(".cf_integer_fields").attr("name");

    var $params = {
        rules:{},
        messages:{},
        focusInvalid: false,
        onkeyup: false,
        submitHandler: function(form) {
            _ouibounce.disable();
            $('#processing-modal').modal('show');
            //form.submit();
            alert('enviado');
            return true;
        },
        invalidHandler: function(form, validator) {
            if (!validator.numberOfInvalids())
                return;
            $('html, body').animate({
                scrollTop: $(validator.errorList[0].element).offset().top
            }, 500);
        }
    };
    $params['rules'][$integer] = {regex: "^[0-9]{1,18}([,.]{1}[0-9]{1,3})?$"};
    $params['rules'][$decimal] = {regex: "^[0-9]{1,18}([,.]{1}[0-9]{1,3})?$"};
    $params['rules']['price'] = {regex: "^[0-9]{1,18}([,.]{1}[0-9]{1,3})?$"};
    $params['rules']['title'] = {maxlength: 145};
    $params['rules']['address'] = {maxlength: 145};
    $params['rules']['phone'] = {maxlength: 30};
    $params['rules']['website'] = {maxlength: 200};
    $params['rules']['captcha'] =   {
                                        "remote" :
                                        {
                                            url: $(".post_new").attr('action'),
                                            type: "post",
                                            data:
                                            {
                                                ajaxValidateCaptcha: true
                                            }
                                        }
                                    };
    $params['messages']['captcha'] =   {"remote" : $('.post_new :input[name="captcha"]').data('error')};

    $.validator.setDefaults({ ignore: ":hidden:not(select)" });
    var $form = $(".post_new");
    $form.validate($params);

    //chosen fix
    var settings = $.data($form[0], 'validator').settings;
    settings.ignore += ':not(#location)'; // post_new location(any chosen) texarea
    settings.ignore += ':not([name="description"])'; // post_new description texarea
});

// sure you want to leave alert and processing modal
$(function(){
    var _ouibounce = ouibounce(false, {
        aggressive: true,
        callback: function() {
            swal({
                title: $('#publish-new-btn').data('swaltitle'),
                text: $('#publish-new-btn').data('swaltext'),
                type: "warning",
                allowOutsideClick: true
            });
        }
    });
    
    $('.post_new').submit(function(e){
        return false;
    });
});
