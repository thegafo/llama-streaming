const { spawn } = require('child_process');
const dotenv = require('dotenv');
dotenv.config();

const prompt = `Hello World!`

const p = spawn(process.env.MAIN_PATH, ['-m',
  process.env.MODEL_PATH,
  '-n', '-1',
  '-c', '2048',
  '-k', '-1',
  '--prompt', prompt
]);

p.stdout.on('data', (data) => {
  let str = data.toString();
  process.stdout.write(str);
});

p.stderr.on('data', (data) => {
  // console.error(`Stderr: ${data}`);
});

p.on('close', (code) => {
  console.log(`Process exited with code ${code}`);
});
