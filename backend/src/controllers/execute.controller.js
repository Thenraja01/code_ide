import axios from 'axios';

const JUDGE0_URL = 'https://ce.judge0.com';

const languageMap = {
  'python': 71,      // Python 3
  'java': 62,        // Java (OpenJDK 13.0.1)
  'c': 50,           // C (GCC 9.2.0)
  'cpp': 54,         // C++ (GCC 9.2.0)
  'go': 60,          // Go (1.13.5)
  'rust': 73,        // Rust (1.40.0)
  'javascript': 63   // JavaScript (Node.js 12.14.0)
};

export const runCode = async (req, res) => {
  try {
    const { language, code } = req.body;
    
    const languageId = languageMap[language.toLowerCase()];
    if (!languageId) {
      return res.status(400).json({ error: `Language ${language} is not supported via Judge0.` });
    }

    // Call Judge0 (wait=true for synchronous result)
    const response = await axios.post(`${JUDGE0_URL}/submissions?base64_encoded=false&wait=true`, {
      source_code: code,
      language_id: languageId,
      stdin: ""
    });

    const result = response.data;
    
    // Map Judge0 response to a structure compatible with our frontend
    // Frontend expects: { run: { output: string } }
    const mappedResponse = {
      run: {
        output: result.stdout || result.stderr || result.compile_output || result.message || "Execution finished with no output.",
        stderr: result.stderr,
        stdout: result.stdout,
        exit_code: result.status.id === 3 ? 0 : 1
      },
      status: result.status.description
    };

    res.json(mappedResponse);
  } catch (error) {
    console.error('Judge0 Execution Error:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Failed to execute code via Judge0',
      details: error.response?.data || error.message 
    });
  }
};

export const getRuntimes = async (req, res) => {
    try {
        const response = await axios.get(`${JUDGE0_URL}/languages`);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch Judge0 languages' });
    }
};
