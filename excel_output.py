import json
import pandas as pd


def convert_json_to_excel(json_file_path, excel_file_path):
    try:
        # Load JSON data
        with open(json_file_path, 'r') as file:
            data = json.load(file)
        print("JSON data loaded successfully.")

        # Convert to DataFrame
        df = pd.json_normalize(data, record_path=['members'])
        df.drop(columns=['id'], inplace=True)

        # Write to Excel
        df.to_excel(excel_file_path, index=False)
        print(f"Excel file created successfully at {excel_file_path}.")

    except Exception as e:
        print(f"An error occurred: {e}")


# Paths for your JSON file and Excel output
json_file_path = 'data.json'
excel_file_path = 'output.xlsx'


def create_excel_file():
    return None