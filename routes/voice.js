const express = require('express');
const multer = require('multer');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { OpenAI } = require('openai');
const { requireRole } = require('../middleware/auth');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// POST /voice/transcribe — forward audio to OpenAI Whisper and return transcript
router.post('/transcribe', requireRole('trainer', 'admin'), upload.single('audio'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No audio file provided' });
  if (!process.env.OPENAI_API_KEY) {
    return res.status(503).json({ error: 'OPENAI_API_KEY not configured on server' });
  }

  const tmpPath = path.join(os.tmpdir(), `nest-audio-${Date.now()}.webm`);
  try {
    fs.writeFileSync(tmpPath, req.file.buffer);
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(tmpPath),
      model: 'whisper-1',
    });
    res.json({ transcript: transcription.text });
  } catch (err) {
    res.status(500).json({ error: 'Transcription failed', details: err.message });
  } finally {
    try { fs.unlinkSync(tmpPath); } catch {}
  }
});

module.exports = router;
