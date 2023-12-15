const { spawn } = require('child_process');
const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const ngrok = require('ngrok');

dotenv.config();

if (!process.env.MAIN_PATH) {
  console.log('Error: MAIN_PATH not set.');
  process.exit();
}

if (!process.env.MODEL_PATH) {
  console.log('Error: MODEL_PATH not set.');
  process.exit();
}

const app = express();

// Serve static directory
app.use(express.static(path.join(__dirname, 'static')));

// Read JSON
app.use(express.json());

let p;

app.post('/prompt', (req, res) => {
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');

  console.log('Generating...');

  if (p) {
    console.log('Killing previous process...')
    p.kill();
  }

  p = spawn(process.env.MAIN_PATH, [
    '-m', process.env.MODEL_PATH,
    '-n', '-2',
    '-c', '0',
    '-r', 'User:',
    '--in-prefix', ' ',
    '--in-suffix', 'Assistant:',
    '--prompt', req.body.prompt]);

  p.stdout.on('data', (data) => {
    let str = data.toString('utf8');
    // process.stdout.write(str);
    res.write(data.toString('utf8'));
  });

  p.stderr.on('data', (data) => {
    // console.error(`Stderr: ${data}`);
  });

  p.on('close', (code) => {
    console.log(`Process exited with code ${code}`);
    console.log('Generation complete.');
    p = null;
    res.end()
  });


});

const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  const token = process.argv[2];
  if (token) {
    try {
      await ngrok.authtoken(token);
      const url = await ngrok.connect(PORT);
      console.log(`External URL: ${url}`);
    } catch (err) {
      console.log(`Error: invalid ngrok token`);
      process.exit();
    }
  }
});
