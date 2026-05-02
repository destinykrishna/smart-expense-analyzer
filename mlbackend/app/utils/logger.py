import sys
import logging

# Define a custom log format
LOG_FORMAT = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"

# Configure standard logging to act as our logger
logging.basicConfig(level=logging.INFO, format=LOG_FORMAT, stream=sys.stdout)

# Create a logger instance for our application
logger = logging.getLogger("mlbackend")
