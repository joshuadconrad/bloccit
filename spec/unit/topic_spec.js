const sequelize = require("../../src/db/models/index").sequelize;
const Topic = require("../../src/db/models").Topic;
const Post = require("../../src/db/models").Post;

describe("Topic", () => {

  beforeEach((done) => {
    this.topic;
    this.post;
    sequelize.sync({
      force: true
    }).then((res) => {
      Topic.create({
          title: "Expeditions to Alpha Centauri",
          description: "A compilation of reports from recent visits to the star system."
        })
        .then((topic) => {
          this.topic = topic;
          Post.create({
              title: "My first visit to Proxima Centauri b",
              body: "I saw some rocks.",
              topicId: this.topic.id
            })
            .then((post) => {
              this.post = post;
              done();
            });
        })
        .catch((err) => {
          console.log(err);
          done();
        });
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
