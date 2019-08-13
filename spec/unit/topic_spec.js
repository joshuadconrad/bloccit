const sequelize = require("../../src/db/models/index").sequelize;
const Topic = require("../../src/db/models").Topic;
const Post = require("../../src/db/models").Post;
const User = require("../../src/db/models").User;


describe("Topic", () => {

  beforeEach((done) => {
    this.topic;
    this.post;
    this.user;

    sequelize.sync({
      force: true
    }).then((res) => {

      User.create({
          email: "starman@tesla.com",
          password: "Trekkie4lyfe"
        })
        .then((user) => {
          this.user = user; //store the user

          Topic.create({
              title: "Expeditions to Alpha Centauri",
              description: "A compilation of reports from recent visits to the star system.",

              posts: [{
                title: "My first visit to Proxima Centauri b",
                body: "I saw some rocks.",
                userId: this.user.id
              }]
            }, {

              include: {
                model: Post,
                as: "posts"
              }
            })
            .then((topic) => {
              this.topic = topic; //store the topic
              this.post = topic.posts[0]; //store the post
              done();
            })
        })
    });
  });

  describe("#create()", () => {

    it("should create a topic object with a title and a description", (done) => {

      Topic.create({
        title: "Expeditions to Alpha Centauri",
        description: "A compilation of reports from recent visits to the star system."
        })
        .then((topic) => {
          expect(topic.title).toBe("Expeditions to Alpha Centauri");
          expect(topic.description).toBe("A compilation of reports from recent visits to the star system.");
          done();
        })
        .catch((err) => {
          console.log(err);
          done();
        });

    });

  });

  describe("#getPosts()", () => {

    it("should return the post associated with the topic", (done) => {

      this.topic.getPosts()
        .then((associatedPosts) => {
          expect(associatedPosts[0].title).toBe("My first visit to Proxima Centauri b");
          done();
        });

    });

  });


});
