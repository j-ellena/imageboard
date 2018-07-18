(function() {
    //
    console.log("client script");

    var app = new Vue({
        el: "#main",
        //
        data: {
            images: [],
            imageToUpload: {
                title: "",
                description: "",
                username: ""
            }
        },
        //
        mounted: function() {
            console.log("mounted");
            var self = this;
            axios.get("/images").then(function(response) {
                console.log("axios get");

                self.images = response.data;
            });
        },
        created: function() {
            console.log("created");
        },
        updated: function() {
            console.log("updated");
        },
        //
        methods: {
            imageSelected: function(e) {
                console.log("image selected");
                this.imageFile = e.target.files[0];
            },
            upload: function() {
                var formData = new FormData();
                formData.append("file", this.imageFile);
                formData.append("title", this.imageToUpload.title);
                formData.append("description", this.imageToUpload.description);
                formData.append("username", this.imageToUpload.username);
                axios.post("/upload", formData).then(function(res) {
                    console.log("axios post");
                    app.images.unshift(res.data.image);
                });
                this.imageFile = "";
                this.imageToUpload.title = "";
                this.imageToUpload.description = "";
                this.imageToUpload.username = "";
            }
        }
    });
})();
