/*
 * moleculer-got
 * Copyright (c) 2019 André Mazayev (https://github.com/AndreMaz/moleculer-got)
 * MIT Licensed
 */

"use strict";

const got = require("got");
const _ = require("lodash");

const HTTP_METHODS = ["get", "put", "post", "delete"];

module.exports = {
  name: "got",

  /**
   * Got instance https://github.com/sindresorhus/got#instances
   *
   * @type {import("got").GotInstance} _client
   */
  _client: null,

  /**
   * Default settings
   */
  settings: {
    got: {
      includeMethods: null,
      // More about Got default options: https://github.com/sindresorhus/got#instances
      defaultOptions: {
        hooks: {
          beforeRequest: [
            options => {
              // Get Moleculer Logger instance
              const logger = options.logger;
              logger.info(`>>> HTTP Request to ${options.href}`);
            }
          ],
          afterResponse: [
            (response, retryWithMergedOptions) => {
              // Get Moleculer Logger instance
              const logger = response.request.gotOptions.logger;
              const method = response.request.gotOptions.method;

              logger.info(
                `<<< HTTP ${method} to "${
                  response.requestUrl
                }" returned with status code ${response.statusCode}`
              );

              return response;
            }
          ],
          beforeError: []
        }
      }
    }
  },

  /**
   * Actions
   */
  actions: {
    test(ctx) {
      return "Hello " + (ctx.params.name || "Anonymous");
    }
  },

  /**
   * Methods
   */
  methods: {
    _get(url, opt) {
      if (opt.stream) {
        return this._client.stream(url, opt);
      }

      return this._client.get(url, opt);
    },

    _post(url, payload, opt) {
      /*
      if (opt && opt.stream) {
        return payload.pipe(this._client.stream.post(url, opt));
      }
      */
      /*
        return this._client.post(url, payload);
      */
    },

    _put() {},

    _delete() {}
  },

  /**
   * Service created lifecycle event handler
   */
  created() {
    // Remove unwanted methods
    const { includeMethods } = this.settings.got;
    if (!includeMethods || Array.isArray(includeMethods)) {
      const methodsToRemove = _.difference(HTTP_METHODS, includeMethods);

      methodsToRemove.forEach(methodName => delete this[`_${methodName}`]);
    }

    // Extend Got client with default options
    const { defaultOptions } = this.settings.got;

    // Add Moleculer Logger to Got Params
    this.settings.got.defaultOptions.logger = this.logger;

    /**
     * @type {import("got").GotInstance}
     */
    this._client = got.extend(defaultOptions);
  },

  /**
   * Service started lifecycle event handler
   */
  async started() {},

  /**
   * Service stopped lifecycle event handler
   */
  async stopped() {}
};
