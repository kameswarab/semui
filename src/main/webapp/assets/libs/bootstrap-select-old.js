//== Class definition

var BootstrapSelect = function () {
    
    //== Private functions
    var demos = function () {
        // minimum setup
        $('.m_selectpicker').selectpicker();
        $( "div.bs-searchbox > input" ).attr( "placeholder", "Search..." );
    }

    return {
        // public functions
        init: function() {
            demos(); 
        }
    };
}();

jQuery(document).ready(function() { 
    $(".m_selectpicker").selectpicker("default").selectpicker("refresh");
    BootstrapSelect.init();
});
$("#refreshselectvalue").click(function(){
    $(".m_selectpicker").selectpicker("default").selectpicker("refresh");
});


