(function() {
    //
    var app = new Vue({
        el: "#main",
        //
        data: {
            images: []
        },
        //
        mounted: function() {
            var self = this;

            // *****************************************************************
            // ajax request with axios
            // *****************************************************************

            axios.get("/images").then(function(response) {
                self.images = response.data;
            });
        }
    });
})();
