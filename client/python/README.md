# ODXPROXY MCP Client Demo

## Python
there are two types of demo inside python; using Google's ADK (Agent Development Kit) which is easier and raw using the ANTROPHIC SDKs

### Requirements
- Python 3.x
- ANTROPHIC / Google Gemini or aistudio API Key

### Installation
Navigate to the `client/python` directory
```shell
pip install -r requirements.txt
```

### Edit Environment Variables
Copy `.env.TEMPLATE` to `.env` and edit the environment variables.

Depends on your virtual environment the next step may vary but should be loading environment
```shell
source .venv/bin/activate
```

#### Running
1. Using Google's ADK (you should up one root folder before running this command: typically from **client/** folder)
```shell
adk web
```

2. Using antrhopic SDK
```shell
python3 claude.py
```
