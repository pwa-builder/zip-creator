import request from "supertest";
import app from "../src/app";


describe("OPTION /api", () => {
  it("should return 200 OK", () => {
    return request(app).options("/api").expect(200);
  });
});

describe("GET /api", () => {
  it("should return 200 OK", () => {
    return request(app).get("/api").expect(200);
  });
});

describe("POST /api", () => {
  it("should return 400 on no body", () => {
    return request(app).post("/api").expect(400);
  });

  it("should return 200 OK with data uri", () => {
    request(app)
      .post("/api")
      .send([
        {
          src: `data:image/jpeg;base64,
/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDADIiJSwlHzIsKSw4NTI7S31RS0VFS5ltc1p9tZ++u7Kf
r6zI4f/zyNT/16yv+v/9////////wfD/////////////2wBDATU4OEtCS5NRUZP/zq/O////////
////////////////////////////////////////////////////////////wAARCAAYAEADAREA
AhEBAxEB/8QAGQAAAgMBAAAAAAAAAAAAAAAAAQMAAgQF/8QAJRABAAIBBAEEAgMAAAAAAAAAAQIR
AAMSITEEEyJBgTORUWFx/8QAFAEBAAAAAAAAAAAAAAAAAAAAAP/EABQRAQAAAAAAAAAAAAAAAAAA
AAD/2gAMAwEAAhEDEQA/AOgM52xQDrjvAV5Xv0vfKUALlTQfeBm0HThMNHXkL0Lw/swN5qgA8yT4
MCS1OEOJV8mBz9Z05yfW8iSx7p4j+jA1aD6Wj7ZMzstsfvAas4UyRHvjrAkC9KhpLMClQntlqFc2
X1gUj4viwVObKrddH9YDoHvuujAEuNV+bLwFS8XxdSr+Cq3Vf+4F5RgQl6ZR2p1eAzU/HX80YBYy
JLCuexwJCO2O1bwCRidAfWBSctswbI12GAJT3yiwFR7+MBjGK2g/WAJR3FdF84E2rK5VR0YH/9k=`,
          type: "image/jpeg",
          sizes: "16x16",
        },
      ])
      .expect(200)
      .expect("Content-Type", "application/zip");
  });

  it("should return 200 OK with http", () => {
    return request(app)
      .post("/api")
      .send([
        {
          src: "https://www.google.com/favicon.ico",
          type: "image/x-icon",
          sizes: "16x16",
        },
      ])
      .expect(200)
      .expect("Content-Type", "application/zip");
  });
});
