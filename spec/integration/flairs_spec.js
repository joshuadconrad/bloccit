const request = require("request");
const server = require("../../src/server");
const base = "http://localhost:3000/topics/";

const sequelize = require("../../src/db/models/index").sequelize;
const Topic = require("../../src/db/models").Topic;
const Flair = require("../../src/db/models").Flair;

describe("routes : flairs", () => {

  beforeEach((done) => {
    this.topic;
    this.flair;

    sequelize.sync({
      force: true
    }).then((res) => {

      //#1
      Topic.create({
          title: "Summer Olympics",
          description: "Post your Summer Games stories."
        })
        .then((topic) => {
          this.topic = topic;

          Flair.create({
              name: "United States",
              color: "Red, White and Blue",
              topicId: this.topic.id
            })
            .then((flair) => {
              this.flair = flair;
              done();
            })
            .catch((err) => {
              console.log(err);
              done();
            });
        });
    });

  });

  describe("GET /topics/:topicId/flairs/new", () => {

    it("should render a new flair form", (done) => {
      request.get(`${base}${this.topic.id}/flairs/new`, (err, res, body) => {
        expect(err).toBeNull();
        expect(body).toContain("New Flair");
        done();
      });
    });

  });

  describe("POST /topics/:topicId/flairs/create", () => {

    it("should create a new flair and redirect", (done) => {
      const options = {
        url: `${base}${this.topic.id}/flairs/create`,
        form: {
          name: "Sky",
          color: "Blue"
        }
      };
      request.post(options,
        (err, res, body) => {

          Flair.findOne({
              where: {
                name: "Sky"
              }
            })
            .then((flair) => {
              expect(flair).not.toBeNull();
              expect(flair.name).toBe("Sky");
              expect(flair.color).toBe("Blue");
              expect(flair.topicId).not.toBeNull();
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

  describe("GET /topics/:topicId/flairs/:id", () => {

    it("should render a view with the selected flair", (done) => {
      request.get(`${base}${this.topic.id}/flairs/${this.flair.id}`, (err, res, body) => {
        expect(err).toBeNull();
        expect(body).toContain("United States");
        done();
      });
    });

  });

  describe("POST /topics/:topicId/flairs/:id/destroy", () => {

    it("should delete the flair with the associated ID", (done) => {
      request.post(`${base}${this.topic.id}/flairs/${this.flair.id}/destroy`, (err, res, body) => {
        expect(this.flair.id).toBe(1);
        Flair.findById(1)
          .then((flair) => {
            expect(err).toBeNull();
            expect(flair).toBeNull();
            done();
          })
      });
    });

  });

  describe("GET /topics/:topicId/flairs/:id/edit", () => {

    it("should render a view with an edit flair form", (done) => {
      request.get(`${base}${this.topic.id}/flairs/${this.flair.id}/edit`, (err, res, body) => {
        expect(err).toBeNull();
        expect(body).toContain("Edit Flair");
        expect(body).toContain("United States");
        done();
      });
    });

  });

  describe("POST /topics/:topicId/flairs/:id/update", () => {

    it("should return a status code 302", (done) => {
      request.post({
        url: `${base}${this.topic.id}/flairs/${this.flair.id}/update`,
        form: {
          name: "1st place",
          color: "Gold"
        }
      }, (err, res, body) => {
        expect(res.statusCode).toBe(302);
        done();
      });
    });

    it("should update the flair with the given values", (done) => {
      const options = {
        url: `${base}${this.topic.id}/flairs/${this.flair.id}/update`,
        form: {
          name: "2nd place",
          color: "Silver"
        }
      };
      request.post(options,
        (err, res, body) => {

          expect(err).toBeNull();

          Flair.findOne({
              where: {
                id: this.flair.id
              }
            })
            .then((flair) => {
              expect(flair.name).toBe("2nd place");
              expect(flair.color).toBe("Silver");
              done();
            });
        });
    });

  });

});
