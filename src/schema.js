const { PRIVATE_ROOM, PUBLIC_ROOM } = require('./app/constants/room.constant');

module.exports.login = {
  type: 'object',
  properties: {
    email: {
      type: 'string',
      regexp:
        '/^(([^<>()[]\\.,;:s@"]+(.[^<>()[]\\.,;:s@"]+)*)|(".+"))@(([[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}])|(([a-zA-Z-0-9]+.)+[a-zA-Z]{2,}))$/',
    },
    password: {
      type: 'string',
    },
  },
  required: ['email', 'password'],
};

module.exports.register = {
  type: 'object',
  properties: {
    username: {
      type: 'string',
    },
    email: {
      type: 'string',
      regexp:
        '/^(([^<>()[]\\.,;:s@"]+(.[^<>()[]\\.,;:s@"]+)*)|(".+"))@(([[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}])|(([a-zA-Z-0-9]+.)+[a-zA-Z]{2,}))$/',
    },
    password: {
      type: 'string',
      minLength: 8,
    },
  },
  required: ['email', 'password', 'username'],
};

module.exports.activeCode = {
  type: 'object',
  properties: {
    code: {
      type: 'string',
    },
  },
  required: ['code'],
};

module.exports.changePasswordThroughEmail = {
  type: 'object',
  properties: {
    email: {
      type: 'string',
      regexp:
        '/^(([^<>()[]\\.,;:s@"]+(.[^<>()[]\\.,;:s@"]+)*)|(".+"))@(([[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}])|(([a-zA-Z-0-9]+.)+[a-zA-Z]{2,}))$/',
    },
    host_fe: {
      type: 'string',
    },
    path_name: {
      type: 'string',
    },
  },
  required: ['email', 'host_fe', 'path_name'],
};

module.exports.createAConversation = {
  type: 'object',
  properties: {
    participants: {
      type: 'array',
      items: {
        type: 'string',
        minLength: 40,
        maxLength: 40,
      },
    },
    type: {
      type: 'string',
      enum: ['CONVERSATION_SINGLE', 'CONVERSATION_GROUP', 'CONVERSATION_GAME'],
    },
  },
  required: ['participants', 'type'],
};

module.exports.createARoom = {
  type: 'object',
  properties: {
    type: {
      type: 'string',
      enum: [PRIVATE_ROOM, PUBLIC_ROOM],
    },
    room_secret: {
      type: 'string',
      maxLength: 20,
    },
    bet_level: {
      type: 'number',
      minimum: 10,
      maximum: 100,
    },
  },
  required: ['type', 'bet_level', 'room_secret'],
};
