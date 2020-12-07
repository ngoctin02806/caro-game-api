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
