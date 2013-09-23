import _ = require('underscore');
import logger = require('utils/logger');
import Backbone = require('backbone');

import querystring = require('utils/querystring');
import BaseView = require('views/base');
import FlowerpotView = require('views/flowerpot');

export = FlowerpotRouter;

class FlowerpotRouter extends Backbone.Router {
  private routes: {[route:string]: string};
  private $el: JQuery;
  private currentView: BaseView;

  constructor() {
    this.routes = {
      '(?*querystring)': 'index',
    };
    this.$el = $('body');
    this.currentView = null;
    super();
  }

  private index(query: string) {
    if (_.isEmpty(query)) { query = ''; }
    logger.info('FlowerpotRouter.index called: query =', query);
    if (!_.isNull(this.currentView)) { this.currentView.close(); }
    var querydict = querystring.parse(query);
    this.currentView = new FlowerpotView(querydict);
    this.$el.html(this.currentView.render().el);
  }
}
