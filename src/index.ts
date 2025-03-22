import express from 'express';
import { Pipeline } from './core/Pipeline';
import { PipelineConfig } from './types/pipeline';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Endpoint to trigger pipeline execution
app.post('/execute', async (req, res) => {
  try {
    const pipelineConfig: PipelineConfig = req.body;
    const pipeline = new Pipeline(pipelineConfig);
    await pipeline.execute();
    res.status(200).json({ message: 'Pipeline executed successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Pipeline execution failed', details: error });
  }
});

app.listen(port, () => {
  console.log(`Data Pipeline Service listening at http://localhost:${port}`);
});
