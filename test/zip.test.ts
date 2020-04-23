import archiver from "archiver";
import { parseMetaData, getData, generate, fetchHttp } from "../src/util/zip";

describe("zip", () => {
  it("generate() bad url", async (done) => {
    const mockMetaData = {
      src: "httpasdfhjka;sdfjkl;",
      mimeType: "text/plain",
      sizes: "16x16"
    };
    const zip = archiver("zip");

    expect(await generate(zip, [mockMetaData])).toBe(false);
    done();
  });

  it("generate() unsupported mimetype", async (done) => {
    const mockMetaData = {
      src: "data:text/plain;ascii,hello world!",
      mimeType: "text/plain",
      sizes: "16x16"
    };
    const zip = archiver("zip");

    expect(await generate(zip, [mockMetaData])).toBe(false);
    done();
  });

  it("parseMetaData()", async (done) => {
    const mockMetaData = {
      sizes: "16x16",
      src: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDADIiJSwlHzIsKSw4NTI7S31RS0VFS5ltc1p9tZ++u7Kfr6zI4f/zyNT/16yv+v/9////////wfD/////////////2wBDATU4OEtCS5NRUZP/zq/O////////////////////////////////////////////////////////////////////wAARCAAYAEADAREAAhEBAxEB/8QAGQAAAgMBAAAAAAAAAAAAAAAAAQMAAgQF/8QAJRABAAIBBAEEAgMAAAAAAAAAAQIRAAMSITEEEyJBgTORUWFx/8QAFAEBAAAAAAAAAAAAAAAAAAAAAP/EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAMAwEAAhEDEQA/AOgM52xQDrjvAV5Xv0vfKUALlTQfeBm0HThMNHXkL0Lw/swN5qgA8yT4MCS1OEOJV8mBz9Z05yfW8iSx7p4j+jA1aD6Wj7ZMzstsfvAas4UyRHvjrAkC9KhpLMClQntlqFc2X1gUj4viwVObKrddH9YDoHvuujAEuNV+bLwFS8XxdSr+Cq3Vf+4F5RgQl6ZR2p1eAzU/HX80YBYyJLCuexwJCO2O1bwCRidAfWBSctswbI12GAJT3yiwFR7+MBjGK2g/WAJR3FdF84E2rK5VR0YH/9k=",
    };
    const data = await parseMetaData(mockMetaData);

    expect(data.data).toBe(mockMetaData.src.split(",").pop());
    expect(data.mimeType).toBe("image/jpeg");
    expect(data.encoding).toBe("base64");

    done();
  });

  it("getData()", async (done) => {
    const mockIconMetaData = {
      sizes: "16x16",
      src: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDADIiJSwlHzIsKSw4NTI7S31RS0VFS5ltc1p9tZ++u7Kfr6zI4f/zyNT/16yv+v/9////////wfD/////////////2wBDATU4OEtCS5NRUZP/zq/O////////////////////////////////////////////////////////////////////wAARCAAYAEADAREAAhEBAxEB/8QAGQAAAgMBAAAAAAAAAAAAAAAAAQMAAgQF/8QAJRABAAIBBAEEAgMAAAAAAAAAAQIRAAMSITEEEyJBgTORUWFx/8QAFAEBAAAAAAAAAAAAAAAAAAAAAP/EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAMAwEAAhEDEQA/AOgM52xQDrjvAV5Xv0vfKUALlTQfeBm0HThMNHXkL0Lw/swN5qgA8yT4MCS1OEOJV8mBz9Z05yfW8iSx7p4j+jA1aD6Wj7ZMzstsfvAas4UyRHvjrAkC9KhpLMClQntlqFc2X1gUj4viwVObKrddH9YDoHvuujAEuNV+bLwFS8XxdSr+Cq3Vf+4F5RgQl6ZR2p1eAzU/HX80YBYyJLCuexwJCO2O1bwCRidAfWBSctswbI12GAJT3yiwFR7+MBjGK2g/WAJR3FdF84E2rK5VR0YH/9k=",
    };
    const mockFileMetaData = await parseMetaData(mockIconMetaData);
    const buffer = await getData(mockIconMetaData, mockFileMetaData);

    expect(Buffer.isBuffer(buffer)).toBe(true);

    done();
  });

  it("fetchHttp() throws errors on failure", async (done) => {
    try {
      await fetchHttp("asdfjk;");
    } catch(e) {
      expect(true).toBe(true);
    }

    done();
  });
});
