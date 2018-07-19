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
            //
            var self = this;
            axios
                .get("/image/" + this.id)
                .then(response => (self.imageToModal = response.data))
                .catch(err => console.log(err));
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
        //
        data: {
            imageId: null,
            images: [],
            imageToUpload: {
                title: "",
                description: "",
                username: ""
            }
        },
        //
        mounted: function() {
            var self = this;
            axios.get("/images").then(function(response) {
                self.images = response.data;
            });
        },
        //
        methods: {
            //
            changeId: function(imageId) {
                this.imageId = imageId;
            },

            imageSelected: function(e) {
                this.imageFile = e.target.files[0];
            },
            upload: function() {
                var formData = new FormData();
                formData.append("file", this.imageFile);
                formData.append("title", this.imageToUpload.title);
                formData.append("description", this.imageToUpload.description);
                formData.append("username", this.imageToUpload.username);
                axios.post("/upload", formData).then(function(res) {
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
