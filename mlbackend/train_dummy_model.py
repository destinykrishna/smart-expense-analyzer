import os
import pickle
from sklearn.pipeline import Pipeline
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB

def train_and_save_model():
    """Trains a simple dummy scikit-learn model and saves it as a pickle file."""
    print("Training dummy model...")
    # 1. Dummy training data
    X_train = [
        "STARBUCKS", "MCDONALDS", "KFC", "BURGER KING", # Food & Dining
        "UBER", "LYFT", "TAXI", "TRAIN TICKET",         # Transportation
        "AMAZON MARKETPLACE", "WALMART", "TARGET",      # Shopping
        "NETFLIX", "SPOTIFY", "CINEMA", "STEAM GAMES",  # Entertainment
        "WHOLE FOODS", "TRADER JOES", "SAFEWAY",        # Groceries
        "MONTHLY RENT", "ELECTRICITY BILL", "WATER"     # Housing/Utilities
    ]
    
    y_train = [
        "Food & Dining", "Food & Dining", "Food & Dining", "Food & Dining",
        "Transportation", "Transportation", "Transportation", "Transportation",
        "Shopping", "Shopping", "Shopping",
        "Entertainment", "Entertainment", "Entertainment", "Entertainment",
        "Groceries", "Groceries", "Groceries",
        "Housing/Utilities", "Housing/Utilities", "Housing/Utilities"
    ]

    # 2. Setup a basic ML pipeline
    pipeline = Pipeline([
        ('vectorizer', TfidfVectorizer()),
        ('classifier', MultinomialNB())
    ])

    # 3. Train the model
    pipeline.fit(X_train, y_train)

    # 4. Save the model to ml_models/expense_classifier.pkl
    models_dir = os.path.join(os.path.dirname(__file__), "ml_models")
    os.makedirs(models_dir, exist_ok=True)
    
    model_path = os.path.join(models_dir, "expense_classifier.pkl")
    with open(model_path, "wb") as f:
        pickle.dump(pipeline, f)
        
    print(f"Model successfully saved to {model_path}")

if __name__ == "__main__":
    train_and_save_model()
