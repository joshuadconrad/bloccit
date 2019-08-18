const request = require("request");
const server = require("../../src/server");
const base = "http://localhost:3000/topics/";

const sequelize = require("../../src/db/models/index").sequelize;
const Topic = require("../../src/db/models").Topic;
const User = require("../../src/db/models").User;

function authorizeUser(role, done) {
  User.create({
    email: "#{role}@example.com",
    password: "123456",
    role: role
  })
  .then((user) => {
    request.get({
      url: "http://localhost:3000/auth/fake",
      form: {
        role: user.role,
        userId: user.id,
        email: user.email
      }
    },
      (err, res, body) => {
        done();
      }
    );
  });
}

describe("routes : topics", () => {
  beforeEach(done => {
    this.topic;
    sequelize.sync({
      force: true
    }).then(response => {
      Topic.create({
          title: "JS Frameworks",
          description: "There is a lot of them"
        })
        .then(topic => {
          this.topic = topic;
          done();
        })
        .catch(error => {
          console.log(error);
          done();
        });
    });
  });

  describe("admin user performing CRUD actions for Topic", () => {

    beforeEach((done) => {
      authorizeUser("admin", done);
    });

    describe("GET /topics", () => {
      it("should return a status code 200 and all topics", done => {
        request.get(base, (error, response, body) => {
          expect(response.statusCode).toBe(200);
          expect(error).toBeNull();
          expect(body).toContain("Topics");
          expect(body).toContain("JS Frameworks");
          done();
        });
      });
    });

    describe("GET /topics/new", () => {

      it("should render a new topic form", (done) => {
        request.get(`${base}new`, (err, res, body) => {
          expect(err).toBeNull();
          expect(body).toContain("New Topic");
          done();
        });
      });
    });

    describe("POST /topics/create", () => {

      it("should create a new Topic and redirect", (done) => {
        const options = {
          url: `${base}create`,
          form: {
            title: "Test Topic Title",
            description: "Test topic description."
          }
        };
        request.post(options,
          (err, res, body) => {

            Topic.findOne({
                where: {
                  title: "Test Topic Title"
                }
              })
              .then((topic) => {
                expect(topic.title).toBe("Test Topic Title");
                expect(topic.description).toBe("Test topic description.");
                done();
              })
              .catch((err) => {
                console.log(err);
                done();
              });
          }
        );
      });

      it("should not create a new topic that fails validations", (done) => {
        const options = {
          url: `${base}create`,
          form: {
            title: "a",
            description: "b"
          }
        };

        request.post(options,
          (err, res, body) => {
            Topic.findOne({
                where: {
                  title: "a"
                }
              })
              .then((topic) => {
                expect(topic).toBeNull();
                done();
              })
              .catch((err) => {
                console.log(err);
                done();
              });
          }
        );
      });

    });

    describe("GET /topics/:id", () => {

      it("should render a view with the selected topic", (done) => {
        request.get(`${base}${this.topic.id}`, (err, res, body) => {
          expect(err).toBeNull();
          expect(body).toContain("JS Frameworks");
          done();
        });
      });

    });

    describe("POST /topics/:id/destroy", () => {

      it("should delete the topic with the associated ID", (done) => {

        Topic.findAll()

          .then((topics) => {
            const topicCountBeforeDelete = topics.length;
            expect(topicCountBeforeDelete).toBe(1);
            request.post(`${base}${this.topic.id}/destroy`, (err, res, body) => {
              Topic.findAll()
                .then((topics) => {
                  expect(err).toBeNull();
                  expect(topics.length).toBe(topicCountBeforeDelete - 1);
                  done();
                })
            });
          });

      });

    });

    describe("GET /topics/:id/edit", () => {

      it("should render a view with an edit topic form", (done) => {
        request.get(`${base}${this.topic.id}/edit`, (err, res, body) => {
          expect(err).toBeNull();
          expect(body).toContain("Edit Topic");
          expect(body).toContain("JS Frameworks");
          done();
        });
      });

    });

    describe("POST /topics/:id/update", () => {

      it("should update the topic with the given values", (done) => {
        const options = {
          url: `${base}${this.topic.id}/update`,
          form: {
            title: "Updated Title",
            description: "Updated description."
          }
        };

        request.post(options,
          (err, res, body) => {

            expect(err).toBeNull();

            Topic.findOne({
                where: {
                  id: this.topic.id
                }
              })
              .then((topic) => {
                expect(topic.title).toBe("Updated Title");
                done();
              });
          });
      });

    });
  });
  //end context for admin user


  // context of member user
  describe("member user performing CRUD actions for Topic", () => {
    beforeEach((done) => {
      authorizeUser("member", done);
    });

    describe("GET /topics", () => {
      it("should return a status code 200 and all topics", done => {
        request.get(base, (error, response, body) => {
          expect(response.statusCode).toBe(200);
          expect(error).toBeNull();
          expect(body).toContain("Topics");
          expect(body).toContain("JS Frameworks");
          done();
        });
      });
    });

    describe("GET /topics/new", () => {

      it("should redirect to topics view", (done) => {
        request.get(`${base}new`, (err, res, body) => {
          expect(err).toBeNull();
          expect(body).toContain("Topics");
          done();
        });
      });
    });

    describe("POST /topics/create", () => {
      const options = {
        url: `${base}create`,
        form: {
          title: "Test Topic Title",
          description: "Test topic description."
        }
      };

      it("should not create a new topic", (done) => {
        request.post(options,
          (err, res, body) => {
            Topic.findOne({
                where: {
                  title: "Test Topic Title"
                }
              })
              .then((topic) => {
                expect(topic).toBeNull();
                done();
              })
              .catch((err) => {
                console.log(err);
                done();
              });
          }
        );
      });
    });

    describe("GET /topics/:id", () => {

      it("should render a view with the selected topic", (done) => {
        request.get(`${base}${this.topic.id}`, (err, res, body) => {
          expect(err).toBeNull();
          expect(body).toContain("JS Frameworks");
          done();
        });
      });

    });

    describe("POST /topics/:id/destroy", () => {

      it("should not delete the topic with the associated ID", (done) => {

        Topic.findAll()
          .then((topics) => {
            const topicCountBeforeDelete = topics.length;
            expect(topicCountBeforeDelete).toBe(1);
            request.post(`${base}${this.topic.id}/destroy`, (err, res, body) => {
              Topic.findAll()
                .then((topics) => {
                  expect(topics.length).toBe(topicCountBeforeDelete);
                  done();
                })
            });
          })

      });

    });

    describe("GET /topics/:id/edit", () => {

      it("should not render a view with an edit topic form", (done) => {

        request.get(`${base}${this.topic.id}/edit`, (err, res, body) => {
          expect(err).toBeNull();
          expect(body).not.toContain("Edit Topic");
          expect(body).toContain("JS Frameworks");
          done();
        });

      });

    });

    describe("POST /topics/:id/update", () => {

      it("should not update the topic with the given values", (done) => {
        const options = {
          url: `${base}${this.topic.id}/update`,
          form: {
            title: "Updated Title",
            description: "Updated description."
          }
        }

        request.post(options,
          (err, res, body) => {
            expect(err).toBeNull();
            Topic.findOne({
                where: {
                  id: this.topic.id
                }
              })
              .then((topic) => {
                expect(topic.title).toBe("JS Frameworks");
                done();
              });
          });
      });

    });

  });

});
