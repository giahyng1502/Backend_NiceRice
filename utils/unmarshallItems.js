const { unmarshall } = require("@aws-sdk/util-dynamodb");
const unmarshallItems = (items)=> {
    return items.map(item => unmarshall(item));
}
module.exports = {unmarshallItems};
