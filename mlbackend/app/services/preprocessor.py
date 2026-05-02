def preprocess_text(text: str) -> str:
    """Cleans and normalizes transaction description text."""
    if not text:
        return ""
    # Very basic preprocessing; could be expanded based on model requirements
    return text.strip().upper()
