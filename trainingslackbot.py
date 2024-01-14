import json
import requests

# Load data from your JSON file
with open('data.json', 'r') as file:
    data = json.load(file)

# Your Slack Webhook URL
webhook_url = 'https://hooks.slack.com/services/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'


# Function to format message
def format_member_progress(member):
    name = f"*{member['first_name']} {member['last_name']}*"
    details = f"({member['category']} - Start Date: {member['start_date']})"
    progress_parts = [f"• {key.replace('_', ' ').title()}: {value}%" for key, value in
                      member["overall_progress"].items()]
    progress_str = "\n".join(progress_parts)
    return f"{name}\n{details}\n{progress_str}\n"


# Prepare the payload
messages = [format_member_progress(member) for member in data['members']]
payload = {
    "text": "\n".join(messages)
}

# Post request to the Slack incoming webhook URL
response = requests.post(webhook_url, json=payload)

# Check response
if response.status_code == 200:
    print("Message sent successfully.")
else:
    print(f"Failed to send message: {response.status_code}")
