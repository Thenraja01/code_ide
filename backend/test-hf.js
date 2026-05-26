import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

async function test() {
  try {
    const res = await axios.post(
      'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2',
      {
        inputs: 'hello',
        parameters: { max_new_tokens: 10 }
      },
      {
        headers: { Authorization: `Bearer ${process.env.HF_TOKEN}` }
      }
    );
    console.log(res.data);
  } catch (err) {
    console.error(err.response?.status, err.response?.data);
  }
}
test();
