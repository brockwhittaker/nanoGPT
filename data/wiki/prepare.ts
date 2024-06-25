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
        charToIndex[char] = Object.keys(charToIndex).length;
      }

      integers[x] = charToIndex[char];
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
    currentChunks = new Array(100);
  read.on("data", (chunk) => {
    if (++chunkIndex % 100 !== 0) {
      currentChunks.push(chunk);
    } else {
      onMegaChunk(currentChunks.join(""), charStartIndex);
      currentChunks = [];
    }

    charStartIndex += chunk.length;
  });

  if (currentChunks.length) {
    onMegaChunk(currentChunks.join(""));
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
  });
});
