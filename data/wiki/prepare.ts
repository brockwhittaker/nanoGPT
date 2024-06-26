const fs = require("fs");

const inputFilePath = "./input.txt";

// read as stream
const read = fs.createReadStream(inputFilePath, { encoding: "utf8" });

const charToIndex = {};

// get file length in characters
let fileCharLength = 0;
read.on("data", (chunk) => {
  fileCharLength += chunk.length;
});

fs.writeFileSync("./train.bin", "");
fs.writeFileSync("./val.bin", "");

let charsIndexedCounter = 0;
read.on("end", () => {
  console.log(
    `length of dataset in characters: ${fileCharLength.toLocaleString()}`
  );

  const onMegaChunk = (chunk: string, charStartIndex: number) => {
    console.log(
      `percent done: ${((charStartIndex / fileCharLength) * 100).toFixed(2)}%`
    );
    let integers = new Int16Array(chunk.length);

    for (let x = 0; x < chunk.length; x++) {
      const char = chunk[x];
      if (!charToIndex[char]) {
        charToIndex[char] = charsIndexedCounter++;
        integers[x] = charToIndex[char];
      }
    }
    // write out the integers to a file as a binary file
    const buffer = Buffer.from(integers.buffer);

    if (charStartIndex < 0.9 * fileCharLength) {
      // appennd to train.bin
      fs.appendFileSync("./train.bin", buffer);
    } else {
      fs.appendFileSync("./val.bin", buffer);
    }
  };

  const read = fs.createReadStream(inputFilePath, { encoding: "utf8" });

  let charStartIndex = 0,
    chunkIndex = 0,
    currentChunks = new Array(1000);
  read.on("data", (chunk) => {
    if (chunkIndex === 0 || chunkIndex % 1000 !== 0) {
      currentChunks[chunkIndex % 1000] = chunk;
    } else {
      onMegaChunk(currentChunks.join(""), charStartIndex);
      currentChunks = new Array(1000);
    }

    chunkIndex++;

    charStartIndex += chunk.length;
  });

  if (currentChunks.length) {
    onMegaChunk(currentChunks.join(""), charStartIndex);
  }

  read.on("end", () => {
    const charSet = Object.keys(charToIndex).sort();
    console.log(`all the unique characters: ${charSet.join("")}`);
    console.log(`number of chars: ${charSet.length}`);

    const indexToChar = {};
    for (const char in charToIndex) {
      indexToChar[charToIndex[char]] = char;
    }

    const meta = {
      vocab_size: charSet.length,
      itos: indexToChar,
      stoi: charToIndex,
    };

    fs.writeFileSync("./meta.json", JSON.stringify(meta));

    // assert that every key in stoi is different
    const set = new Set();
    for (const key in charToIndex) {
      if (set.has(charToIndex[key])) {
        throw new Error(`duplicate key: ${key}`, charToIndex[key]);
      }
      set.add(charToIndex[key]);
    }

    // assert that every key in itos is different
    const set2 = new Set();
    for (const key in indexToChar) {
      if (set2.has(indexToChar[key])) {
        throw new Error(`duplicate key: ${key}`, indexToChar[key]);
      }
      set2.add(indexToChar[key]);
    }
  });
});
