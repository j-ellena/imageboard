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
                },
                message: null
            };
        },
        props: ["id"],
        template: "#modal-template",
        mounted: function() {
            var self = this;
            axios
                .get(`/image/${self.id}`)
                .then(function(response) {
                    self.imageToModal = response.data;
                    console.log(self.imageToModal.newer);
                    console.log(self.imageToModal.older);
                    axios
                        .get(`/comments/${self.id}`)
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
        watch: {
            id: function() {
                var self = this;
                axios
                    .get(`/image/${self.id}`)
                    .then(function(response) {
                        self.imageToModal = response.data;
                        axios
                            .get(`/comments/${self.id}`)
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
                        console.log(
                            'Error axios.get("/image/:imageId"): \n',
                            err
                        );
                    });
            }
        },
        methods: {
            emitUnmodalify: function() {
                this.$emit("unmodalify");
            },
            addComment: function() {
                var self = this;
                axios
                    .post(`/addComment/${self.id}`, self.commentToUpload)
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
            },
            deleteImage: function() {
                var self = this;
                axios
                    .post(`/deleteImage/${self.id}`)
                    .then(function(response) {
                        self.message = response.data;
                    })
                    .catch(function(err) {
                        console.log(
                            'Error axios.post("/deleteImage/:imageId"): \n',
                            err
                        );
                    });
                // this.$emit("unmodalify", null);
            },
            deleteComment: function(commentId) {
                var self = this;
                axios
                    .post(`/deleteComment/${self.id}/${commentId}`)
                    .then(function(response) {
                        self.message = response.data;
                        axios
                            .get(`/comments/${self.id}`)
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
                        console.log(
                            'Error axios.post("/deleteComment/:imageId/commentId"): \n',
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
            imageId: location.hash.slice(1),
            images: [],
            imageFile: "",
            imageToUpload: {
                title: "",
                description: "",
                username: ""
            },
            offset: 0
        },
        mounted: function() {
            addEventListener("hashchange", function() {
                app.imageId = location.hash.slice(1);
                if (isNaN(app.imageId)) {
                    app.imageId = null;
                    location.hash = "";
                }
            });
            axios
                .get("/images")
                .then(function(response) {
                    app.images = response.data;
                })
                .catch(function(err) {
                    console.log('Error axios.get("/images"): \n', err);
                });
            this.checkScroll();
        },
        updated: function() {
            app.checkScroll();
        },
        methods: {
            openModal: function(imageId) {
                app.imageId = imageId;
                location.hash = this.imageId;
            },
            closeModal: function() {
                app.imageId = null;
                location.hash = "";
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
            },
            checkScroll: function() {
                setTimeout(function() {
                    if (
                        $(document).scrollTop() + $(window).height() >=
                        $(document).height() - 1
                    ) {
                        axios
                            .get("/images", {
                                params: { offset: (app.offset += 12) }
                            })
                            .then(function(response) {
                                response.data.forEach(function(elem) {
                                    app.images.push(elem);
                                });
                            });
                    } else {
                        this.checkScroll();
                    }
                }, 1000);
            }
        }
    });
})();
