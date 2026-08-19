import os
from dotenv import load_dotenv

# =====================================================
# LOAD ENVIRONMENT VARIABLES
# =====================================================

server_env = os.path.abspath(
    os.path.join(
        os.path.dirname(__file__),
        "..",
        "server",
        ".env"
    )
)

if os.path.exists(server_env):
    load_dotenv(server_env)
else:
    load_dotenv()


# =====================================================
# AI SERVICE SETTINGS
# =====================================================

PORT = int(os.getenv("AI_SERVICE_PORT", "8000"))

HOST = os.getenv(
    "AI_SERVICE_HOST",
    "0.0.0.0"
)


# =====================================================
# INTERNAL SECURITY TOKEN
# Node.js <-> Python AI communication
# =====================================================

INTERNAL_AI_SERVICE_TOKEN = os.getenv(
    "INTERNAL_AI_SERVICE_TOKEN",
    "educopilot_internal_ai_secret_token_2026"
).strip("'\"")


# =====================================================
# GROQ CONFIGURATION
# =====================================================

# Groq key is optional.
# If it is not provided, the AI service will start,
# but Groq-based generation will not be available.

raw_key = os.getenv("GROQ_API_KEY", "")

GROQ_API_KEY = (
    raw_key.strip("'\"")
    if raw_key
    else ""
)


# Primary Groq model
GROQ_MODEL = os.getenv(
    "GROQ_MODEL",
    "groq/compound-mini"
)


# Fallback Groq model
FALLBACK_GROQ_MODEL = os.getenv(
    "FALLBACK_GROQ_MODEL",
    "groq/compound"
)


# =====================================================
# RAG / EMBEDDING SETTINGS
# =====================================================

EMBEDDING_MODEL_NAME = os.getenv(
    "EMBEDDING_MODEL_NAME",
    "all-MiniLM-L6-v2"
)

VECTOR_DIMENSION = 384

DEFAULT_TOP_K = 4
