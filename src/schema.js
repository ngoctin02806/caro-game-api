const { PRIVATE_ROOM, PUBLIC_ROOM } = require('./app/constants/room.constant');
const { MOMO, VNPAY } = require('./app/constants/payment.constant');

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

module.exports.roomSecret = {
  type: 'object',
  properties: {
    room_secret: {
      type: 'string',
    },
  },
  required: ['room_secret'],
};

module.exports.createAGame = {
  type: 'object',
  properties: {
    players: {
      type: 'array',
      item: {
        type: 'string',
      },
    },
  },
  required: ['players'],
};

module.exports.point = {
  type: 'object',
  properties: {
    point: {
      type: 'number',
    },
    chess_board: {
      type: 'array',
      item: {
        type: 'array',
        item: 'string',
      },
    },
    user_id: {
      type: 'string',
    },
  },
  required: ['point', 'chess_board'],
};

module.exports.transaction = {
  type: 'object',
  properties: {
    type: {
      type: 'string',
      enum: [MOMO, VNPAY],
    },
    amount: {
      type: 'number',
    },
    option: {
      type: 'object',
      properties: {
        description: {
          type: 'string',
        },
        user_id: {
          type: 'string',
        },
      },
    },
  },
  required: ['amount', 'option', 'type'],
};

module.exports.renewPassword = {
  type: 'object',
  properties: {
    new_password: {
      type: 'string',
      minLength: 8,
    },
  },
  required: ['new_password'],
};
