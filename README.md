## Emotion Light Control
Smart light bars to display colors based on detected emotions. 
It allows you to set colors for predefined emotions and customize colors using a color picker. 
The project includes testing for smart bar connection and CRUD functionality for color customization.

## Emotion Colors
Angry: Red
Happy: Green
Sad: Blue
Fear: Purple
Disgust: Brown
Neutral: Gray
Surprise: Yellow
 
## Installation
Initialize the project and install dependencies:
   ```bash
   npm install
   npm install express dotenv axios
  npm install -g http-server
   ```

## Usage
1. Run the HTTP server in the directory where index.html is located:
  ```bash
  http-server .
```
2.	Open index.html in your browser to test the following:
	•	Emotion Light Control: Select an emotion to set the color on the smart light bar.
	•	Customize Emotion Colors: Use the RGB color picker to customize colors for each emotion and save your settings.

	Note: This setup is for testing the smart light bar connection and verifying CRUD functionality on index.html before applying it to a production front end.
  
