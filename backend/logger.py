import logging
import sys
from datetime import datetime
import os

def setup_logger():
    # Create logs directory if it doesn't exist
    if not os.path.exists('logs'):
        os.makedirs('logs')
    
    # Configure logging
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=[
            logging.FileHandler(f'logs/app_{datetime.now().strftime("%Y%m%d")}.log'),
            logging.StreamHandler(sys.stdout)
        ]
    )
    
    return logging.getLogger(__name__)

# Create logger instance
logger = setup_logger()

def log_database_operation(operation, user_id=None, details=""):
    logger.info(f"DB {operation} - User: {user_id} - {details}")

def log_ai_operation(operation, user_id=None, details=""):
    logger.info(f"AI {operation} - User: {user_id} - {details}")

def log_payment_operation(operation, user_id=None, plan_id=None, details=""):
    logger.info(f"PAYMENT {operation} - User: {user_id} - Plan: {plan_id} - {details}")

def log_error(operation, error, user_id=None):
    logger.error(f"ERROR in {operation} - User: {user_id} - Error: {str(error)}")