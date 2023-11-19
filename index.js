const express = require('express');
const app = express();
const port = 3000;

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});

const fetch = require('node-fetch').default;


const api_key = "<2686e5de-a21e-40b2-ac6f-e3488d8bdd27 >";
const authorization = `Bearer ${api_key}`;

const headers = {
    "accept": "application/json",
    "content-type": "application/json",
    "authorization": authorization
};

// Get a presigned URL for uploading an image
const initImageUrl = "https://cloud.leonardo.ai/api/rest/v1/init-image";
const initImagePayload = { "extension": "jpg" };


// all below this point should be in a function, which will then be called when accessed in the browser.
fetch(initImageUrl, {
    method: 'POST',
    headers: headers,
    body: JSON.stringify(initImagePayload)
})
    .then(response => {
        console.log(response.status);
        return response.json();
    })

    .then(data => {
        if (data.uploadInitImage) {
            const fields = data.uploadInitImage.fields;
            const uploadUrl = data.uploadInitImage.url;
            const image_id = data.uploadInitImage.id;

            const image_file_path = "/workspace/test.jpg";
            const formData = new FormData();
            formData.append('file', fs.createReadStream(image_file_path));

            return fetch(uploadUrl, {
                method: 'POST',
                body: formData,
            });
        } else {
            // Handle the case when uploadInitImage is undefined
            throw new Error('uploadInitImage is undefined');
        }
    })

    .then(data => {
        // Generate with an image prompt
        const generateUrl = "https://cloud.leonardo.ai/api/rest/v1/generations";
        const generatePayload = {
            "height": 512,
            "modelId": "6bef9f1b-29cb-40c7-b9df-32b51c1f67d3",
            "prompt": "An oil painting of a cat",
            "width": 512,
            "imagePrompts": [data.uploadInitImage.id]
        };

        return fetch(generateUrl, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(generatePayload)
        });
    })
    .then(response => {
        console.log(response.status);
        return response.json();
    })
    .then(data => {
        const generation_id = data.sdGenerationJob.generationId;
        const generationUrl = `https://cloud.leonardo.ai/api/rest/v1/generations/${generation_id}`;

        return new Promise(resolve => setTimeout(() => resolve(), 20000)) // Wait for 20 seconds
            .then(() => fetch(generationUrl, { headers: headers }));
    })
    .then(response => response.text())
    .then(text => console.log(text))
    .catch(error => console.error('Error:', error));