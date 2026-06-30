// Code node 2: "Parse AI Response & Set Status"
// receive AI raw resonse
let rawText = $input.item.json.content.parts[0].text;

// clean raw text to remove ```json and ``` markers, and trim whitespace
let cleanJsonString = rawText.replace(/```json/g, "").replace(/```/g, "").trim();

try {
    // convert cleaned string to JSON
    const parsedData = JSON.parse(cleanJsonString);
    
    // merge parsed data into the current item json
    Object.assign($input.item.json, parsedData);
    
    // review status based on the presence of store and amount fields
    if (parsedData.store && parsedData.amount) {
        $input.item.json.status = "ok";
    } else {
        $input.item.json.status = "needs_review";
    }
} catch (error) {
    $input.item.json.status = "error";
    $input.item.json.error_message = "can't parse AI response: " + error.message;
}

// copy over the record_id, line_message_id, and replyToken from the original data
const originalData = $('Verify Signature & Extract Image Events').item.json;
$input.item.json.record_id = originalData.record_id;
$input.item.json.line_message_id = originalData.line_message_id;
$input.item.json.replyToken = originalData.replyToken;

return $input.item;