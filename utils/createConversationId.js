const createConversationId = (userIds, isGroup) => {
    if (isGroup) {
        return `conversation:group-${crypto.randomUUID()}`;
    } else {
        const sortedIds = userIds.sort();
        return `conversation:${sortedIds[0]}-${sortedIds[1]}`;
    }
};

const createUserId = () => {
    return `user-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
};
const createMessageId = () => {
    return `message-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
};
module.exports = {createConversationId,createUserId,createMessageId};
