(function() {
    //
    console.log("client script");

    // *************************************************************************
    // component modal
    // *************************************************************************

    Vue.component("image-modal", {
        data: function() {
            return {
                imageToModal: {}
            };
        },
        props: ["id"],
        template: "#modal-template",
        mounted: function() {
            var self = this;
            axios
                .get("/image/" + this.id)
                .then(function(response) {
                    self.imageToModal = response.data;
                })
                .catch(function(err) {
                    console.log(err);
                });
        },
        methods: {
            changeModal: function(imageId) {
                this.$emit("unmodalify", imageId);
            }
        }
    });

    // *************************************************************************
    // main vue
    // *************************************************************************

    var app = new Vue({
        el: "#main",
        data: {
            imageId: null,
            images: [],
            imageToUpload: {
                title: "",
                description: "",
                username: ""
            }
        },

        mounted: function() {
            axios
                .get("/images")
                .then(function(response) {
                    app.images = response.data;
                })
                .catch(function(err) {
                    console.log(err);
                });
        },

        methods: {
            changeId: function(imageId) {
                app.imageId = imageId;
            },
            getSelected: function(e) {
                app.imageFile = e.target.files[0];
            },
            uploadImage: function() {
                var formData = new FormData();
                formData.append("file", app.imageFile);
                formData.append("title", app.imageToUpload.title);
                formData.append("description", app.imageToUpload.description);
                formData.append("username", app.imageToUpload.username);
                axios
                    .post("/uploadImage", formData)
                    .then(function(res) {
                        app.images.unshift(res.data);
                    })
                    .catch(function(err) {
                        console.log(err);
                    });
                app.imageFile = "";
                app.imageToUpload.title = "";
                app.imageToUpload.description = "";
                app.imageToUpload.username = "";
            }
        }
    });
})();
