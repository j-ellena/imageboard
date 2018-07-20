(function() {
    //
    console.log("client script");

    // *************************************************************************
    // component modal
    // *************************************************************************

    Vue.component("image-modal", {
        data: function() {
            return {
                imageToModal: {},
                comments: [],
                commentToUpload: {
                    comment: "",
                    username: ""
                }
            };
        },
        props: ["id_modal"],
        template: "#modal-template",
        mounted: function() {
            var self = this;
            axios
                .get(`/image/${self.id_modal}`)
                .then(function(response) {
                    self.imageToModal = response.data;
                    axios
                        .get(`/comments/${self.id_modal}`)
                        .then(function(response) {
                            self.comments = response.data;
                        })
                        .catch(function(err) {
                            console.log(
                                'Error axios.get("/comments"): \n',
                                err
                            );
                        });
                })
                .catch(function(err) {
                    console.log('Error axios.get("/image/:imageId"): \n', err);
                });
        },
        methods: {
            emitUnmodalify: function(imageId) {
                this.$emit("unmodalify", imageId);
            },
            addComment: function() {
                var self = this;
                axios
                    .post(`/addComment/${self.id_modal}`, self.commentToUpload)
                    .then(function(response) {
                        self.comments.unshift(response.data);
                        self.commentToUpload = {};
                    })
                    .catch(function(err) {
                        console.log(
                            'Error axios.post("/addComment/:imageId"): \n',
                            err
                        );
                    });
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
            imageFile: "",
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
                    console.log('Error axios.get("/images"): \n', err);
                });
        },
        methods: {
            changeId: function(imageId) {
                app.imageId = imageId;
            },
            getSelected: function(e) {
                this.imageFile = e.target.files[0];
                e.target.value = "";
            },
            uploadImage: function() {
                var formData = new FormData();
                formData.append("file", app.imageFile);
                formData.append("username", app.imageToUpload.username);
                formData.append("title", app.imageToUpload.title);
                formData.append("description", app.imageToUpload.description);
                axios
                    .post("/uploadImage", formData)
                    .then(function(response) {
                        if (response.data.error)
                            throw new Error(
                                'Error axios.post("/uploadImage"): \n'
                            );
                        app.images.unshift(response.data.image);
                        app.imageFile = "";
                        app.imageToUpload = {};
                    })
                    .catch(function(err) {
                        console.log(
                            'Error axios.post("/uploadImage"): \n',
                            err
                        );
                    });
            }
        }
    });
})();
