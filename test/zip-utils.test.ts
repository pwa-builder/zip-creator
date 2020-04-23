import { encodingGuard, uriElements } from "../src/util/zip-utils";

describe("uriElements()", () => {
  it("should return 404", () => {
    const uri = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDADIiJSwlHzIsKSw4NTI7S31RS0VFS5ltc1p9tZ++u7Kfr6zI4f/zyNT/16yv+v/9////////wfD/////////////2wBDATU4OEtCS5NRUZP/zq/O////////////////////////////////////////////////////////////////////wAARCAAYAEADAREAAhEBAxEB/8QAGQAAAgMBAAAAAAAAAAAAAAAAAQMAAgQF/8QAJRABAAIBBAEEAgMAAAAAAAAAAQIRAAMSITEEEyJBgTORUWFx/8QAFAEBAAAAAAAAAAAAAAAAAAAAAP/EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAMAwEAAhEDEQA/AOgM52xQDrjvAV5Xv0vfKUALlTQfeBm0HThMNHXkL0Lw/swN5qgA8yT4MCS1OEOJV8mBz9Z05yfW8iSx7p4j+jA1aD6Wj7ZMzstsfvAas4UyRHvjrAkC9KhpLMClQntlqFc2X1gUj4viwVObKrddH9YDoHvuujAEuNV+bLwFS8XxdSr+Cq3Vf+4F5RgQl6ZR2p1eAzU/HX80YBYyJLCuexwJCO2O1bwCRidAfWBSctswbI12GAJT3yiwFR7+MBjGK2g/WAJR3FdF84E2rK5VR0YH/9k=";
    const output = uri.match("data:(.*);(.*),(.*)");
    const [ mimeType, encoding, data ] = uriElements(uri);

    console.log(output);
    console.log(data);

    expect(mimeType).toBe(output[1]);
    expect(encoding).toBe(output[2]);
    expect(data).toBe(output[3]);
  });
});

describe("encodingGuard()", () => {
  it("latin1 -> binary", () => {
    expect(encodingGuard("latin1")).toBe("binary");
  });

  it("binary", () => {
    expect(encodingGuard("binary")).toBe("binary");
  });

  it("hex", () => {
    expect(encodingGuard("hex")).toBe("hex");
  });

  it("ascii", () => {
    expect(encodingGuard("ascii")).toBe("ascii");
  });

  it("charset=US-ASCII -> ascii", () => {
    expect(encodingGuard("charset=US-ASCII")).toBe("ascii");
  });

  it("utf8", () => {
    expect(encodingGuard("utf8")).toBe("utf-8");
  });

  it("utf-8 -> utf8", () => {
    expect(encodingGuard("utf-8")).toBe("utf-8");
  });
  it("charset=utf-8 -> utf8", () => {
    expect(encodingGuard("charset=utf-8")).toBe("utf-8");
  });

  it("base64", () => {
    expect(encodingGuard("base64")).toBe("base64");
  });

  it("(default) asdf -> base64", () => {
    expect(encodingGuard("asdf")).toBe("base64");
  });
});
