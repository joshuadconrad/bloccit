const request = require("request");
const server = require("../../src/server");
const base = "http://localhost:3000/topics/";

const sequelize = require("../../src/db/models/index").sequelize;
const Topic = require("../../src/db/models").Topic;
const Post = require("../../src/db/models").Post;
const Comment = require("../../src/db/models").Comment;
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

describe("routes : comments", () => {

  beforeEach((done) => {
    this.user;
    this.topic;
    this.post;
    this.comment;
    sequelize.sync({
      force: true
    }).then((res) => {

      User.create({
          email: "starman@tesla.com",
          password: "Trekkie4lyfe"
        })
        .then((user) => {
          this.user = user;

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
              this.topic = topic;
              this.post = this.topic.posts[0];

              Comment.create({
                  body: "ay caramba!!!!!",
                  userId: this.user.id,
                  postId: this.post.id
                })
                .then((coment) => {
                  this.comment = coment;
                  done();
                })
                .catch((err) => {
                  console.log(err);
                  done();
                });
            })
            .catch((err) => {
              console.log(err);
              done();
            });
        });
    });
  });

  //Begin guest user
  describe("guest attempting to perform CRUD actions for Comment", () => {

    beforeEach((done) => {
      request.get({
          url: "http://localhost:3000/auth/fake",
          form: {
            userId: 0
          }
        },
        (err, res, body) => {
          done();
        }
      );
    });

    describe("POST /topics/:topicId/posts/:postId/comments/create", () => {

      it("should not create a new comment", (done) => {
        const options = {
          url: `${base}${this.topic.id}/posts/${this.post.id}/comments/create`,
          form: {
            body: "This comment is amazing!"
          }
        };
        request.post(options,
          (err, res, body) => {
            Comment.findOne({
                where: {
                  body: "This comment is amazing!"
                }
              })
              .then((comment) => {
                expect(comment).toBeNull();
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


    describe("POST /topics/:topicId/posts/:postId/comments/:id/destroy", () => {

      it("should not delete the comment with the associated ID", (done) => {
        Comment.findAll()
          .then((comments) => {
            const commentCountBeforeDelete = comments.length;
            expect(commentCountBeforeDelete).toBe(1);
            request.post(
              `${base}${this.topic.id}/posts/${this.post.id}/comments/${this.comment.id}/destroy`,
              (err, res, body) => {
                Comment.findAll()
                  .then((comments) => {
                    expect(err).toBeNull();
                    expect(comments.length).toBe(commentCountBeforeDelete);
                    done();
                  })
              });
          })
      });

    });

  });
  //End guest user

  //Begin member user
  describe("member user performing CRUD actions for Comment", () => {

    beforeEach((done) => {
      request.get({
        url: "http://localhost:3000/auth/fake",
        form: {
          role: "member",
          userId: this.user.id
        }
      },
        (err, res, body) => {
          done();
        }
      );
    });

    describe("POST /topics/:topicId/posts/:postId/comments/create", () => {

      it("should create a new comment and redirect", (done) => {
        const options = {
          url: `${base}${this.topic.id}/posts/${this.post.id}/comments/create`,
          form: {
            body: "This comment is amazing!"
          }
        };
        request.post(options,
          (err, res, body) => {
            Comment.findOne({
                where: {
                  body: "This comment is amazing!"
                }
              })
              .then((comment) => {
                expect(comment).not.toBeNull();
                expect(comment.body).toBe("This comment is amazing!");
                expect(comment.id).not.toBeNull();
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

    describe("POST /topics/:topicId/posts/:postId/comments/:id/destroy", () => {

      it("should delete the comment with the associated ID", (done) => {
        Comment.findAll()
          .then((comments) => {
            const commentCountBeforeDelete = comments.length;
            expect(commentCountBeforeDelete).toBe(1);
            request.post(
              `${base}${this.topic.id}/posts/${this.post.id}/comments/${this.comment.id}/destroy`,
              (err, res, body) => {
                Comment.findAll()
                  .then((comments) => {
                    expect(err).toBeNull();
                    expect(comments.length).toBe(commentCountBeforeDelete - 1);
                    done();
                  })
              });
          })
      });

    });

    describe("POST /topics/:topicId/posts/:postId/comments/:id/destroy", () => {

      beforeEach((done) => {
        User.create({
          email: "email@email.com",
          password: "1234567",
          role: "member"
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
      });

      it("member role should not delete another members comment", (done) => {
        Comment.findAll()
          .then((comments) => {
            const commentCountBeforeDelete = comments.length;
            expect(commentCountBeforeDelete).toBe(1);
            request.post(
              `${base}${this.topic.id}/posts/${this.post.id}/comments/${this.comment.id}/destroy`,
              (err, res, body) => {
                Comment.findAll()
                  .then((comments) => {
                    expect(err).toBeNull();
                    expect(comments.length).toBe(commentCountBeforeDelete);
                    done();
                  })
              }
            );
          })
      });

    });

  });
  //End member in user

  //Begin admin user
  describe("admin user performing CRUD actions for Comment", () => {

    beforeEach((done) => {
      authorizeUser("admin", done);
    });

    describe("POST /topics/:topicId/posts/:postId/comments/:id/destroy", () => {

      it("admin should be able to delete another members comment", (done) => {
        Comment.findAll()
          .then((comments) => {
            const commentCountBeforeDelete = comments.length;
            expect(commentCountBeforeDelete).toBe(1);
            request.post(
              `${base}${this.topic.id}/posts/${this.post.id}/comments/${this.comment.id}/destroy`,
              (err, res, body) => {
                Comment.findAll()
                  .then((comments) => {
                    expect(err).toBeNull();
                    expect(comments.length).toBe(commentCountBeforeDelete - 1);
                    done();
                  })
              });
          })
      });

    });

  });
  //End admin user
});
