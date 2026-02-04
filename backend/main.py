from finvizfinance.earnings import Earnings
from datetime import datetime, timedelta
import pandas as pd

def get_upcoming_earnings(days_ahead=7):
    earnings = Earnings()

    # Try both ways to get data
    try:
        df = earnings.get_earnings()
    except AttributeError:
        try:
            df = earnings.earnings
        except AttributeError:
            raise RuntimeError("Cannot access earnings data in this finvizfinance version.")

    # Convert date column
    df['Date'] = pd.to_datetime(df['Date']).dt.date

    today = datetime.today().date()
    future = today + timedelta(days=days_ahead)

    # Filter earnings in next X days
    upcoming = df[(df['Date'] >= today) & (df['Date'] <= future)]

    return upcoming

if __name__ == "__main__":
    print("Fetching earnings for the next 7 days...\n")

    try:
        upcoming = get_upcoming_earnings()
        if upcoming.empty:
            print("No earnings found in the next 7 days.")
        else:
            print(upcoming.to_string(index=False))
    except Exception as e:
        print("Error:", e)
