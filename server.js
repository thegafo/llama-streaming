const { spawn } = require('child_process');
const express = require('express');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});