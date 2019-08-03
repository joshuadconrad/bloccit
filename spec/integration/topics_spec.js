const request = require("request");
const server = require("../../src/server");
const base = "http://localhost:3000/topics/";

const sequelize = require("../../src/db/models/index").sequelize;
const Topic = require("../../src/db/models").Topic;

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

       Topic.all()

       .then((topics) => {
         const topicCountBeforeDelete = topics.length;
         expect(topicCountBeforeDelete).toBe(1);
         request.post(`${base}${this.topic.id}/destroy`, (err, res, body) => {
           Topic.all()
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
            title: "JavaScript Frameworks",
            description: "There are a lot of them"
          }
        };

        request.post(options,
          (err, res, body) => {

          expect(err).toBeNull();

          Topic.findOne({
            where: { id: this.topic.id }
          })
          .then((topic) => {
            expect(topic.title).toBe("JavaScript Frameworks");
            done();
          });
        });
    });

  });


});
