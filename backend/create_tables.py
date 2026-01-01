from dotenv import load_dotenv
load_dotenv()

from app.database import engine, Base
from app import models  # noqa: F401

def main():
    Base.metadata.create_all(bind=engine)
    print("✅ Tables created.")

if __name__ == "__main__":
    main()
